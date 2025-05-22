import { useEffect, useRef } from "react";

export function useWebcamStreamer(videoRef: React.RefObject<HTMLVideoElement>, token: string) {
    const wsRef = useRef<WebSocket | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const reconnectTimeout = useRef<number>(1000); // start with 1s

    useEffect(() => {
        let isCancelled = false;

        const setupStream = async (ws: WebSocket) => {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            const video = document.createElement("video");
            video.srcObject = stream;
            await video.play();

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const sendFrame = () => {
                if (ws.readyState !== WebSocket.OPEN) return;

                if (video.videoWidth && video.videoHeight) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => {
                        if (blob) ws.send(blob);
                    }, "image/jpeg", 0.7);
                }

                if (!isCancelled) requestAnimationFrame(sendFrame);
            };

            sendFrame();
        };

        const connect = async () => {
            try {
                const ws = new WebSocket(`${import.meta.env.VITE_WS_PORT}/ws/stream?token=${token}`);
                wsRef.current = ws;

                ws.onopen = async () => {
                    reconnectTimeout.current = 1000; // reset timeout
                    await setupStream(ws);
                };

                ws.onerror = () => {
                    console.warn("WebSocket error. Attempting reconnect...");
                };

                ws.onclose = () => {
                    if (isCancelled) return;
                    console.warn("WebSocket closed. Reconnecting...");
                    setTimeout(connect, reconnectTimeout.current);
                    reconnectTimeout.current = Math.min(reconnectTimeout.current * 2, 16000); // exponential backoff
                };
            } catch (err) {
                console.error("WebSocket connection failed:", err);
            }
        };

        connect();

        return () => {
            isCancelled = true;
            streamRef.current?.getTracks().forEach((track) => track.stop());
            wsRef.current?.close();
        };
    }, [token]);
}
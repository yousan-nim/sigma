import { useEffect, useRef } from "react";

export function useWebcamStreamer(videoRef: React.RefObject<HTMLVideoElement>, token: string) {
    const wsRef = useRef<WebSocket | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${import.meta.env.VITE_WS_PORT}/ws/stream?token=${token}`);
        wsRef.current = ws;

        ws.onopen = async () => {
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

            // Configurable FPS and JPEG Quality
            const targetFps = parseInt(import.meta.env.VITE_FPS || "10", 10);
            const jpegQuality = parseFloat(import.meta.env.VITE_JPEG_QUALITY || "0.7");
            const frameInterval = 1000 / targetFps;

            let lastFrameTime = 0;

            const sendFrame = (timestamp?: number) => {
                if (ws.readyState !== WebSocket.OPEN) return;

                // Ensure requestAnimationFrame is used for timing if possible, or fallback to setTimeout style
                // For more precise FPS control, we use a setTimeout loop instead of requestAnimationFrame directly controlling sends
                // However, requestAnimationFrame is good for knowing when to *start* a cycle.

                if (video.videoWidth && video.videoHeight) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => {
                        if (blob) ws.send(blob);
                    }, "image/jpeg", jpegQuality);
                }
                // Schedule next frame
                setTimeout(sendFrame, frameInterval);
            };

            // Start the loop
            const startStreaming = () => {
                if (streamRef.current) { // Ensure stream is active
                    sendFrame();
                }
            };

            startStreaming(); // Initial call to start the loop

        };

        return () => {
            // Clear timeout if we were to store its ID, though for this structure it stops via WebSocket state
            streamRef.current?.getTracks().forEach((track) => track.stop());
            wsRef.current?.close();
        };
    }, [token]);
}
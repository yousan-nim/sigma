import React, { useEffect, useRef } from "react";

const WebcamStream: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        let ws: WebSocket;
        let isCancelled = false;

        const startStreaming = async () => {
            try {
                const res = await fetch("http://192.168.1.144:8000/auth/holovue", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: "testuser" }),
                });

                const data = await res.json();
                const token = data.token;

                ws = new WebSocket(`ws://192.168.1.144:8000/ws/stream?token=${token}`);
                wsRef.current = ws;

                ws.onopen = async () => {
                    if (isCancelled) return;

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
                                if (blob && ws.readyState === WebSocket.OPEN) {
                                    ws.send(blob);
                                }
                            }, "image/jpeg", 0.7);
                        }

                        requestAnimationFrame(sendFrame);
                    };

                    sendFrame();
                };

                ws.onerror = (err) => {
                    console.error("WebSocket error", err);
                };
            } catch (err) {
                console.error("Streaming setup failed", err);
            }
        };

        startStreaming();

        return () => {
            isCancelled = true;
            streamRef.current?.getTracks().forEach((track) => track.stop());
            wsRef.current?.close();
        };
    }, []);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-red-500">
            <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%" }} />
        </div>
    );
};

export default WebcamStream;
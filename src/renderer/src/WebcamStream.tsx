// WebcamStream.tsx
import { WS_STREAM_URL } from "@renderer/constants/endpoints";
import React, { useEffect, useRef } from "react";

const WebcamStream: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const token = "YOUR_JWT_TOKEN"; // replace with real one

    useEffect(() => {
        // Connect to WebSocket
        const ws = new WebSocket(`${WS_STREAM_URL}?token=${token}`);
        wsRef.current = ws;

        // Get camera
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                const video = document.createElement("video");
                video.srcObject = stream;
                video.play();

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                // Configurable FPS and JPEG Quality
                const targetFps = parseInt(import.meta.env.VITE_FPS || "10", 10);
                const jpegQuality = parseFloat(import.meta.env.VITE_JPEG_QUALITY || "0.7");
                const frameInterval = 1000 / targetFps;

                const sendFrame = () => {
                    if (ws.readyState !== WebSocket.OPEN) return;

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

                sendFrame(); // Initial call
            })
            .catch((err) => console.error("Camera error:", err));

        // Cleanup
        return () => {
            ws.close();
        };
    }, []);

    return (
        <div>
            <h2>Streaming Webcam...</h2>
            <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%" }} />
        </div>
    );
};

export default WebcamStream;
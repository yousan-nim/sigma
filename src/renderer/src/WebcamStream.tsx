import React, { useRef } from "react";
import { useWebcamStreamer } from "./lib/hook/useWebcamStremer";

type WebcamStreamProps = {
    token: string;
};

const WebcamStream: React.FC<WebcamStreamProps> = ({ token }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useWebcamStreamer(videoRef as React.RefObject<HTMLVideoElement>, token);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-red-500">
            {/* <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%" }} /> */}
        </div>
    );
};

export default WebcamStream;

import React, { useRef, useState, useEffect } from 'react';

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let currentStream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                const constraints = {
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: "user"
                    }
                };
                currentStream = await navigator.mediaDevices.getUserMedia(constraints);
                setStream(currentStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = currentStream;
                }
            } catch (err: any) {
                console.error("Camera error:", err);
                setError("カメラの起動に失敗しました。カメラへのアクセスを許可してください。" + (err.message || ""));
            }
        };

        startCamera();

        return () => {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg", lastModified: Date.now() });
                        onCapture(file);
                    }
                }, 'image/jpeg', 0.9);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-black rounded-lg overflow-hidden relative border border-slate-700">
                {error ? (
                    <div className="p-8 text-center text-white">
                        <p className="text-red-400 font-bold mb-2">エラー</p>
                        <p>{error}</p>
                        <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-700 rounded text-sm">閉じる</button>
                    </div>
                ) : (
                    <>
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto bg-black transform scale-x-[-1]" />
                        <canvas ref={canvasRef} className="hidden" />

                        <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-6 items-center">
                            <button onClick={onClose} className="bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-2 text-sm backdrop-blur-sm transition-colors">
                                キャンセル
                            </button>
                            <button
                                onClick={handleCapture}
                                className="w-16 h-16 rounded-full bg-white border-4 border-slate-300 shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
                            >
                                <div className="w-14 h-14 rounded-full bg-white border-2 border-slate-900" />
                            </button>
                            <div className="w-20" /> {/* Spacer */}
                        </div>
                    </>
                )}
            </div>
            <p className="text-white/50 text-xs mt-4">PCのカメラで撮影します</p>
        </div>
    );
};

export default CameraCapture;

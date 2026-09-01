import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, Check } from "lucide-react";

interface CameraCaptureDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCapture: (file: File) => void;
}

/** Live webcam capture for laptops/desktops — mobile still uses the file-picker's native camera via `capture="environment"`. */
export function CameraCaptureDialog({ open, onOpenChange, onCapture }: CameraCaptureDialogProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);

    const stopStream = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
    };

    const startStream = () => {
        setError(null);
        if (!navigator.mediaDevices?.getUserMedia) {
            setError("Camera access isn't available — this requires a secure (HTTPS) connection. Use file upload instead.");
            return;
        }
        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: "user" }, audio: false })
            .then((stream) => {
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(() => {
                setError("Could not access the camera. Check browser permissions, or use file upload instead.");
            });
    };

    useEffect(() => {
        if (!open) {
            stopStream();
            if (capturedUrl) URL.revokeObjectURL(capturedUrl);
            setCapturedUrl(null);
            setCapturedBlob(null);
            setError(null);
            return;
        }
        startStream();
        return () => stopStream();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleCapture = () => {
        const video = videoRef.current;
        if (!video) return;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0);
        canvas.toBlob(
            (blob) => {
                if (!blob) return;
                setCapturedBlob(blob);
                setCapturedUrl(URL.createObjectURL(blob));
                stopStream();
            },
            "image/jpeg",
            0.92
        );
    };

    const handleRetake = () => {
        if (capturedUrl) URL.revokeObjectURL(capturedUrl);
        setCapturedUrl(null);
        setCapturedBlob(null);
        startStream();
    };

    const handleConfirm = () => {
        if (!capturedBlob) return;
        onCapture(new File([capturedBlob], `verify-face-${Date.now()}.jpg`, { type: "image/jpeg" }));
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-primary" /> Capture Candidate Photo
                    </DialogTitle>
                </DialogHeader>

                {error ? (
                    <p className="text-sm text-destructive py-8 text-center">{error}</p>
                ) : capturedUrl ? (
                    <img src={capturedUrl} alt="Captured candidate" className="w-full rounded-lg" />
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full rounded-lg bg-black scale-x-[-1]"
                    />
                )}

                <div className="flex gap-3 pt-2">
                    {capturedUrl ? (
                        <>
                            <Button variant="outline" className="flex-1" onClick={handleRetake}>
                                <RotateCcw className="w-4 h-4 mr-2" /> Retake
                            </Button>
                            <Button className="flex-1" onClick={handleConfirm}>
                                <Check className="w-4 h-4 mr-2" /> Use Photo
                            </Button>
                        </>
                    ) : !error ? (
                        <Button className="flex-1" onClick={handleCapture}>
                            <Camera className="w-4 h-4 mr-2" /> Capture
                        </Button>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}

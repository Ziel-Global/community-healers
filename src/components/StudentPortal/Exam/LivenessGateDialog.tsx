import { useEffect, useState } from "react";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import "@aws-amplify/ui-react-liveness/styles.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, ShieldCheck } from "lucide-react";
import { candidateService, VerifyLivenessResult } from "@/services/candidateService";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/errors";

interface LivenessGateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onResult: (result: VerifyLivenessResult) => void;
}

/**
 * Exam-start face verification — a lighter-weight anti-impersonation check
 * (50% match threshold) than the center-admin's check-in photo verify (95%).
 * Two failed attempts blocks this exam sitting entirely (see backend).
 */
export function LivenessGateDialog({ open, onOpenChange, onResult }: LivenessGateDialogProps) {
    const { toast } = useToast();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            setSessionId(null);
            setError(null);
            return;
        }
        setLoading(true);
        candidateService
            .createLivenessSession()
            .then((res) => setSessionId(res.sessionId))
            .catch((err) => setError(getApiErrorMessage(err, "Could not start face verification.")))
            .finally(() => setLoading(false));
    }, [open]);

    const handleAnalysisComplete = async () => {
        if (!sessionId) return;
        try {
            const result = await candidateService.verifyLiveness(sessionId);
            onResult(result);
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Verification Failed",
                description: getApiErrorMessage(err, "Could not verify your face. Please try again."),
            });
        } finally {
            onOpenChange(false);
        }
    };

    const handleError = (livenessError: { error?: { message?: string } }) => {
        toast({
            variant: "destructive",
            title: "Camera Error",
            description: livenessError?.error?.message || "Face verification challenge failed. Please retry.",
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg rounded-[20px] border-[#d5e0d4] shadow-[0_16px_48px_rgba(22,76,62,0.12)]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-display text-[#183d34]">
                        <ShieldCheck className="w-5 h-5 text-[#164c3e]" /> Face Verification Required
                    </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-[#6d8474] -mt-2 leading-relaxed">
                    Please look at your camera and follow the on-screen instructions to confirm your identity before starting the exam.
                </p>
                <div className="h-[520px] rounded-[14px] overflow-hidden border border-[#e7eee9] bg-[#f8faf7]">
                    {loading && (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-[#164c3e]" />
                        </div>
                    )}
                    {error && <p className="text-sm text-red-600 text-center py-12">{error}</p>}
                    {sessionId && !error && (
                        <FaceLivenessDetector
                            sessionId={sessionId}
                            region={import.meta.env.VITE_AWS_REGION}
                            onAnalysisComplete={handleAnalysisComplete}
                            onError={handleError}
                            onUserCancel={() => onOpenChange(false)}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

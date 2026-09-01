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
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" /> Face Verification Required
                    </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground -mt-2">
                    Please look at your camera and follow the on-screen instructions to confirm your identity before starting the exam.
                </p>
                <div className="h-[520px]">
                    {loading && (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    )}
                    {error && <p className="text-sm text-destructive text-center py-12">{error}</p>}
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

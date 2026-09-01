import { useEffect, useState } from "react";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";
import "@aws-amplify/ui-react-liveness/styles.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, ShieldCheck } from "lucide-react";
import { centerAdminService, VerifyFaceLivenessResult } from "@/services/centerAdminService";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/errors";

interface LivenessCheckDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    candidateId: string;
    onResult: (result: VerifyFaceLivenessResult) => void;
}

export function LivenessCheckDialog({ open, onOpenChange, candidateId, onResult }: LivenessCheckDialogProps) {
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
        centerAdminService
            .createLivenessSession(candidateId)
            .then((res) => setSessionId(res.sessionId))
            .catch((err) => setError(getApiErrorMessage(err, "Could not start liveness session.")))
            .finally(() => setLoading(false));
    }, [open, candidateId]);

    // Called by the widget once AWS finishes analyzing the challenge on its
    // end — the actual pass/fail + face match only comes from our own
    // verify-face-liveness call right after, which fetches the result and
    // runs the match against the candidate's registered photo.
    const handleAnalysisComplete = async () => {
        if (!sessionId) return;
        try {
            const result = await centerAdminService.verifyFaceLiveness(candidateId, sessionId);
            onResult(result);
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Liveness Check Failed",
                description: getApiErrorMessage(err, "Could not verify liveness result."),
            });
        } finally {
            onOpenChange(false);
        }
    };

    const handleError = (livenessError: { error?: { message?: string } }) => {
        toast({
            variant: "destructive",
            title: "Liveness Error",
            description: livenessError?.error?.message || "Camera challenge failed. Please retry.",
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" /> Liveness Check
                    </DialogTitle>
                </DialogHeader>
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

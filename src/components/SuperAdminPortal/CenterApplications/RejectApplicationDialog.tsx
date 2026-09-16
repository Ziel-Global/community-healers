import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/errors";
import { useRejectApplication } from "@/hooks/queries/useCenterApplicationQueries";
import type { CenterApplicationSummary } from "@/services/centerApplicationService";

interface RejectApplicationDialogProps {
    application: CenterApplicationSummary | null;
    onClose: () => void;
    onRejected: () => void;
}

export function RejectApplicationDialog({ application, onClose, onRejected }: RejectApplicationDialogProps) {
    const { toast } = useToast();
    const rejectMutation = useRejectApplication(application?.id ?? "");
    const [reason, setReason] = useState("");

    const handleClose = () => {
        setReason("");
        onClose();
    };

    const handleReject = () => {
        if (!application || reason.trim().length < 5) return;
        rejectMutation.mutate(reason.trim(), {
            onSuccess: () => {
                toast({ title: "Application rejected", description: `${application.centerName || "This application"} has been rejected.` });
                setReason("");
                onRejected();
            },
            onError: (error) => {
                toast({ variant: "destructive", title: "Failed to reject application", description: getApiErrorMessage(error) });
            },
        });
    };

    return (
        <Dialog open={!!application} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <XCircle className="w-5 h-5" />
                        Reject Application
                    </DialogTitle>
                    <DialogDescription>
                        This will notify {application?.centerName || "the applicant"} and cannot be undone. Please give a clear reason.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 py-2">
                    <Label htmlFor="reject-reason">Reason *</Label>
                    <Textarea
                        id="reject-reason"
                        placeholder="e.g. Missing fire safety certification, incomplete staff documentation..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        autoFocus
                    />
                    {reason.trim().length > 0 && reason.trim().length < 5 && (
                        <p className="text-xs text-destructive">Reason must be at least 5 characters.</p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={rejectMutation.isPending}>Cancel</Button>
                    <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={reason.trim().length < 5 || rejectMutation.isPending}
                        className="gap-2"
                    >
                        {rejectMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Reject
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

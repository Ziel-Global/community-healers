import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/errors";
import { useApproveApplication } from "@/hooks/queries/useDirectorOperationsCenterApplicationQueries";
import type { CenterApplicationSummary } from "@/services/centerApplicationService";

interface ApproveApplicationDialogProps {
    application: CenterApplicationSummary | null;
    onClose: () => void;
    onApproved: () => void;
}

export function ApproveApplicationDialog({ application, onClose, onApproved }: ApproveApplicationDialogProps) {
    const { toast } = useToast();
    const approveMutation = useApproveApplication(application?.id ?? "");

    const handleApprove = () => {
        if (!application) return;
        approveMutation.mutate(undefined, {
            onSuccess: () => {
                toast({ title: "Application approved", description: `${application.centerName} is now a live center with its own admin login.` });
                onApproved();
            },
            onError: (error) => {
                toast({ variant: "destructive", title: "Failed to approve application", description: getApiErrorMessage(error) });
            },
        });
    };

    return (
        <Dialog open={!!application} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 className="w-5 h-5" />
                        Approve Application
                    </DialogTitle>
                    <DialogDescription>
                        This creates a live <strong>Center</strong> and a <strong>Center Admin</strong> login for{" "}
                        {application?.centerName || "this applicant"}, and cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={approveMutation.isPending}>Cancel</Button>
                    <Button
                        onClick={handleApprove}
                        disabled={approveMutation.isPending}
                        className="gradient-primary text-white gap-2"
                    >
                        {approveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Approve
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

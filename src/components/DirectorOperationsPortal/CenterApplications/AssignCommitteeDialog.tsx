import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/errors";
import { useAssignCommittee } from "@/hooks/queries/useDirectorOperationsCenterApplicationQueries";
import { useCommitteeForDirectorOperations } from "@/hooks/queries/useCommitteeQueries";
import type { CenterApplicationSummary } from "@/services/centerApplicationService";

interface AssignCommitteeDialogProps {
    application: CenterApplicationSummary | null;
    onClose: () => void;
    onAssigned: () => void;
}

/** There's exactly one Approval Committee, so this is just a confirmation — nothing to pick. */
export function AssignCommitteeDialog({ application, onClose, onAssigned }: AssignCommitteeDialogProps) {
    const { toast } = useToast();
    const { data: committee, isLoading: isLoadingCommittee } = useCommitteeForDirectorOperations();
    const assignMutation = useAssignCommittee(application?.id ?? "");

    const handleAssign = () => {
        if (!application || !committee) return;
        assignMutation.mutate(committee.id, {
            onSuccess: () => {
                toast({ title: "Committee assigned", description: `${application.centerName || "Application"} moved to Assigned — every member will see it.` });
                onAssigned();
            },
            onError: (error) => {
                toast({ variant: "destructive", title: "Failed to assign committee", description: getApiErrorMessage(error) });
            },
        });
    };

    return (
        <Dialog open={!!application} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Assign to {committee?.name ?? "the Approval Committee"}?
                    </DialogTitle>
                    <DialogDescription>
                        {application?.centerName || "This application"} will be visible to every member of the committee
                        {committee ? ` (${committee.members.length} member${committee.members.length === 1 ? "" : "s"})` : ""}, who can then
                        schedule and carry out the inspection.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={assignMutation.isPending}>Cancel</Button>
                    <Button
                        onClick={handleAssign}
                        disabled={!committee || isLoadingCommittee || assignMutation.isPending}
                        className="gradient-primary text-white gap-2"
                    >
                        {assignMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Confirm Assignment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

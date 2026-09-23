import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/errors";
import { useAssignCommittee } from "@/hooks/queries/useDirectorOperationsCenterApplicationQueries";
import { useCommitteeForDirectorOperations } from "@/hooks/queries/useCommitteeQueries";
import { useAddApplicationComment } from "@/hooks/queries/useCenterApplicationCommentQueries";
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
    const addComment = useAddApplicationComment(application?.id ?? "");
    const [comment, setComment] = useState("");

    const handleAssign = () => {
        if (!application || !committee) return;
        const noteText = comment.trim();
        assignMutation.mutate(committee.id, {
            onSuccess: () => {
                toast({
                    title: "Sent to chairman review",
                    description: `${application.centerName || "Application"} is with the committee chairman. Members will see it after the chairman forwards it.`,
                });
                if (noteText) {
                    addComment.mutate(
                        { text: noteText },
                        {
                            onError: (error) => {
                                toast({ variant: "destructive", title: "Assigned, but the comment failed to post", description: getApiErrorMessage(error) });
                            },
                        },
                    );
                }
                setComment("");
                onAssigned();
            },
            onError: (error) => {
                toast({ variant: "destructive", title: "Failed to assign committee", description: getApiErrorMessage(error) });
            },
        });
    };

    return (
        <Dialog open={!!application} onOpenChange={(open) => { if (!open) { setComment(""); onClose(); } }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Assign to {committee?.name ?? "the Approval Committee"}?
                    </DialogTitle>
                    <DialogDescription>
                        {application?.centerName || "This application"} will go to the committee chairman for review
                        {committee ? ` (${committee.name})` : ""}. After the chairman forwards it, every member can schedule and carry out the inspection.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-1.5">
                    <Label htmlFor="assign-comment">Comment for the committee (optional)</Label>
                    <Textarea
                        id="assign-comment"
                        placeholder="Add any context or instructions for the committee..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        className="resize-none"
                        disabled={assignMutation.isPending}
                    />
                </div>

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

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarClock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/errors";
import { useAddApplicationComment } from "@/hooks/queries/useCenterApplicationCommentQueries";

interface ScheduleInspectionDialogProps {
    applicationId: string;
    open: boolean;
    onClose: () => void;
    currentScheduledDate: string | null;
}

export function ScheduleInspectionDialog({ applicationId, open, onClose, currentScheduledDate }: ScheduleInspectionDialogProps) {
    const { toast } = useToast();
    const addComment = useAddApplicationComment(applicationId);
    const [date, setDate] = useState(currentScheduledDate ?? "");
    const [comment, setComment] = useState("");

    const handleClose = () => {
        setDate(currentScheduledDate ?? "");
        setComment("");
        onClose();
    };

    const handleSubmit = () => {
        if (!comment.trim()) return;
        addComment.mutate(
            { text: comment.trim(), scheduledInspectionDate: date || undefined },
            {
                onSuccess: () => {
                    toast({ title: date ? "Inspection scheduled" : "Comment added" });
                    handleClose();
                },
                onError: (error) => toast({ variant: "destructive", title: "Failed to save", description: getApiErrorMessage(error) }),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarClock className="w-5 h-5 text-primary" />
                        Schedule Inspection
                    </DialogTitle>
                    <DialogDescription>
                        Set (or update) the inspection date and leave a note for the rest of your committee — e.g. "will visit on this date", or explain if a scheduled date was missed.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="inspection-date">Inspection Date</Label>
                        <Input
                            id="inspection-date"
                            type="date"
                            min={new Date().toISOString().slice(0, 10)}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="inspection-comment">Comment *</Label>
                        <Textarea
                            id="inspection-comment"
                            placeholder='e.g. "We will visit this center for inspection on this date."'
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            autoFocus
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={addComment.isPending}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!comment.trim() || addComment.isPending}
                        className="gradient-primary text-white gap-2"
                    >
                        {addComment.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

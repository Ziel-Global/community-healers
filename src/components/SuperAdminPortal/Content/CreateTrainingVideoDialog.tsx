import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FilePlus2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/errors";
import { useCreateTrainingVideo } from "@/hooks/queries/useTrainingVideosQueries";
import type { TrainingVideo } from "@/services/trainingVideosService";

const emptyForm = { title: "", r2Key: "", sequenceOrder: "" };

interface CreateTrainingVideoDialogProps {
    open: boolean;
    onClose: () => void;
    onCreated: (video: TrainingVideo) => void;
}

export function CreateTrainingVideoDialog({ open, onClose, onCreated }: CreateTrainingVideoDialogProps) {
    const { toast } = useToast();
    const createVideoMutation = useCreateTrainingVideo();
    const [form, setForm] = useState(emptyForm);

    const handleClose = () => {
        setForm(emptyForm);
        onClose();
    };

    const handleCreate = () => {
        const sequenceOrder = Number(form.sequenceOrder);
        if (!form.title || !form.r2Key || !form.sequenceOrder || !Number.isInteger(sequenceOrder) || sequenceOrder < 1) {
            toast({
                variant: "destructive",
                title: "Incomplete form",
                description: "Title, R2 object key, and a valid sequence number are required.",
            });
            return;
        }
        createVideoMutation.mutate(
            { title: form.title, r2Key: form.r2Key, sequenceOrder },
            {
                onSuccess: (video) => {
                    toast({ title: "Video registered", description: `"${video.title}" added at position ${video.sequenceOrder}.` });
                    setForm(emptyForm);
                    onCreated(video);
                },
                onError: (error) => {
                    toast({ variant: "destructive", title: "Failed to register video", description: getApiErrorMessage(error) });
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FilePlus2 className="w-5 h-5 text-primary" />
                        Register Training Video
                    </DialogTitle>
                    <DialogDescription>
                        Adds a video already uploaded to the R2 bucket to the course catalog.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="new-video-title">Title *</Label>
                        <Input id="new-video-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="new-video-key">R2 object key *</Label>
                        <Input
                            id="new-video-key"
                            placeholder="e.g. T2-45.mp4"
                            value={form.r2Key}
                            onChange={(e) => setForm({ ...form, r2Key: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="new-video-order">Sequence order *</Label>
                        <Input
                            id="new-video-order"
                            type="number"
                            min={1}
                            value={form.sequenceOrder}
                            onChange={(e) => setForm({ ...form, sequenceOrder: e.target.value })}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={createVideoMutation.isPending}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={createVideoMutation.isPending} className="gradient-primary text-white gap-2">
                        {createVideoMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Register Video
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

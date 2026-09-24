import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PlayCircle, ListVideo, Edit3, Check, X, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/errors";
import { useTrainingVideosList, useUpdateTrainingVideo } from "@/hooks/queries/useTrainingVideosQueries";
import type { TrainingVideo } from "@/services/trainingVideosService";
import { CreateTrainingVideoDialog } from "./CreateTrainingVideoDialog";

function EditableVideoRow({ video }: { video: TrainingVideo }) {
    const { toast } = useToast();
    const updateVideoMutation = useUpdateTrainingVideo();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(video.title);
    const [sequenceOrder, setSequenceOrder] = useState(String(video.sequenceOrder));

    const startEdit = () => {
        setTitle(video.title);
        setSequenceOrder(String(video.sequenceOrder));
        setIsEditing(true);
    };

    const handleSave = () => {
        const nextOrder = Number(sequenceOrder);
        if (!title || !Number.isInteger(nextOrder) || nextOrder < 1) {
            toast({ variant: "destructive", title: "Invalid values", description: "Title and a valid sequence number are required." });
            return;
        }
        updateVideoMutation.mutate(
            { id: video.id, payload: { title, sequenceOrder: nextOrder } },
            {
                onSuccess: () => {
                    toast({ title: "Video updated" });
                    setIsEditing(false);
                },
                onError: (error) => {
                    toast({ variant: "destructive", title: "Failed to update video", description: getApiErrorMessage(error) });
                },
            }
        );
    };

    return (
        <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm group hover:border-primary/40 transition-all">
            <CardContent className="p-0">
                <div className="flex items-center p-4 gap-4">
                    <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center relative shadow-inner overflow-hidden shrink-0">
                        <PlayCircle className="w-6 h-6 text-primary z-10" />
                    </div>

                    {isEditing ? (
                        <div className="flex-1 grid grid-cols-[1fr_100px] gap-2">
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                            <Input
                                type="number"
                                min={1}
                                value={sequenceOrder}
                                onChange={(e) => setSequenceOrder(e.target.value)}
                                placeholder="Order"
                            />
                        </div>
                    ) : (
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-tight h-4 px-1.5">
                                    #{video.sequenceOrder}
                                </Badge>
                                <h4 className="font-bold text-foreground">{video.title}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{video.r2Key}</p>
                        </div>
                    )}

                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 p-0 rounded-lg bg-white border border-border/40 text-success"
                                    onClick={handleSave}
                                    disabled={updateVideoMutation.isPending}
                                >
                                    {updateVideoMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 p-0 rounded-lg bg-white border border-border/40"
                                    onClick={() => setIsEditing(false)}
                                    disabled={updateVideoMutation.isPending}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 px-3 gap-2 rounded-lg bg-white border border-border/40 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={startEdit}
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function AcademyManager() {
    const { data: videos, isLoading } = useTrainingVideosList();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const sortedVideos = [...(videos || [])].sort((a, b) => a.sequenceOrder - b.sequenceOrder);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h3 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                        <ListVideo className="w-5 h-5 text-primary" />
                        Training Course
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {sortedVideos.length} videos, played in order by Center Admins
                    </p>
                </div>
                <Button className="gradient-primary text-black font-bold h-11 px-6 rounded-xl shadow-lg gap-2" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Add Video
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading course…
                </div>
            ) : (
                <div className="grid gap-3">
                    {sortedVideos.map((video) => (
                        <EditableVideoRow key={video.id} video={video} />
                    ))}
                </div>
            )}

            <CreateTrainingVideoDialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreated={() => setIsCreateOpen(false)} />
        </div>
    );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Loader2, Send } from "lucide-react";
import { useApplicationComments, useAddApplicationComment } from "@/hooks/queries/useCenterApplicationCommentQueries";
import { getApiErrorMessage } from "@/lib/errors";
import { useToast } from "@/hooks/use-toast";

function formatTimestamp(iso: string): string {
    return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function initials(firstName: string | null, lastName: string | null, fallback: string): string {
    const combined = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
    return combined || fallback.slice(0, 2).toUpperCase();
}

interface CommentThreadProps {
    applicationId: string;
    /** Only committee members can post — everyone else (DO, Super Admin) is read-only here. */
    canPost: boolean;
}

export function CommentThread({ applicationId, canPost }: CommentThreadProps) {
    const { toast } = useToast();
    const { data: comments = [], isLoading } = useApplicationComments(applicationId);
    const addComment = useAddApplicationComment(applicationId);
    const [text, setText] = useState("");

    const handlePost = () => {
        if (!text.trim()) return;
        addComment.mutate(
            { text: text.trim() },
            {
                onSuccess: () => {
                    setText("");
                    toast({ title: "Comment added" });
                },
                onError: (error) => toast({ variant: "destructive", title: "Failed to add comment", description: getApiErrorMessage(error) }),
            },
        );
    };

    return (
        <div className="space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Comments ({comments.length})
            </p>

            {isLoading ? (
                <div className="flex justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center bg-secondary/20 rounded-xl border border-dashed border-border/50">
                    No comments yet.
                </p>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full gradient-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                {initials(comment.author.firstName, comment.author.lastName, comment.author.email)}
                            </div>
                            <div className="min-w-0 flex-1 bg-secondary/20 rounded-xl p-3">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-semibold text-foreground truncate">
                                        {[comment.author.firstName, comment.author.lastName].filter(Boolean).join(" ") || comment.author.email}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground shrink-0">{formatTimestamp(comment.createdAt)}</span>
                                </div>
                                <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {canPost && (
                <div className="flex gap-2 pt-1">
                    <Textarea
                        placeholder="Add a comment..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={2}
                        className="resize-none"
                    />
                    <Button
                        size="icon"
                        className="gradient-primary text-white shrink-0 self-end"
                        disabled={!text.trim() || addComment.isPending}
                        onClick={handlePost}
                    >
                        {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </div>
            )}
        </div>
    );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquareWarning, Loader2, Send, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useMyComplaints, useCreateComplaint } from "@/hooks/queries/useComplaintQueries";
import { getApiErrorMessage } from "@/lib/errors";
import type { ComplaintStatus } from "@/services/complaintService";

const STATUS_META: Record<ComplaintStatus, { label: string; className: string; icon: typeof Clock }> = {
    OPEN: { label: "Open", className: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
    IN_PROGRESS: { label: "In Progress", className: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: AlertCircle },
    RESOLVED: { label: "Resolved", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
};

export function ComplaintsPanel() {
    const { data, isLoading } = useMyComplaints();
    const createComplaint = useCreateComplaint();
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");

    const subjectValid = subject.trim().length >= 5 && subject.trim().length <= 150;
    const descriptionValid = description.trim().length >= 10 && description.trim().length <= 5000;

    const handleSubmit = () => {
        if (!subjectValid || !descriptionValid) return;
        createComplaint.mutate(
            { subject: subject.trim(), description: description.trim() },
            {
                onSuccess: () => {
                    toast.success("Complaint submitted — we'll review it soon");
                    setSubject("");
                    setDescription("");
                },
                onError: (error) => toast.error(getApiErrorMessage(error, "Failed to submit complaint")),
            },
        );
    };

    return (
        <div className="space-y-6">
            <Card className="border-border/40 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <MessageSquareWarning className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="alumni-sans-title">File a Complaint</CardTitle>
                            <CardDescription>Report an issue with your registration, exam center, or exam experience</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Input
                            placeholder="Subject (e.g. 'Exam centre was closed')"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            maxLength={150}
                        />
                        {subject.length > 0 && !subjectValid && (
                            <p className="text-xs text-destructive">Subject must be 5–150 characters.</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Textarea
                            placeholder="Describe what happened in detail..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            maxLength={5000}
                        />
                        {description.length > 0 && !descriptionValid && (
                            <p className="text-xs text-destructive">Description must be 10–5000 characters.</p>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={!subjectValid || !descriptionValid || createComplaint.isPending}
                            className="gradient-primary text-white gap-2"
                        >
                            {createComplaint.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Submit Complaint
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/40 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">My Complaints</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : !data?.data.length ? (
                        <p className="text-sm text-muted-foreground text-center py-8">You haven't filed any complaints yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {data.data.map((complaint) => {
                                const meta = STATUS_META[complaint.status];
                                const Icon = meta.icon;
                                return (
                                    <div key={complaint.id} className="p-4 rounded-xl border border-border/40 bg-secondary/10 space-y-2">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="text-sm font-semibold text-foreground">{complaint.subject}</p>
                                            <Badge variant="outline" className={`gap-1.5 shrink-0 ${meta.className}`}>
                                                <Icon className="w-3 h-3" /> {meta.label}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{complaint.description}</p>
                                        {complaint.resolutionNote && (
                                            <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                                <p className="text-[10px] font-bold text-emerald-700 uppercase mb-0.5">Response</p>
                                                <p className="text-xs text-emerald-800">{complaint.resolutionNote}</p>
                                            </div>
                                        )}
                                        <p className="text-[10px] text-muted-foreground/70">
                                            Filed {new Date(complaint.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

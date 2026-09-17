import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, MessageSquareWarning, Mail, Phone, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminComplaints, useUpdateComplaintStatus } from "@/hooks/queries/useComplaintQueries";
import { getApiErrorMessage } from "@/lib/errors";
import type { AdminComplaint, ComplaintStatus } from "@/services/complaintService";

const STATUS_META: Record<ComplaintStatus, { label: string; className: string; icon: typeof Clock }> = {
    OPEN: { label: "Open", className: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
    IN_PROGRESS: { label: "In Progress", className: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: AlertCircle },
    RESOLVED: { label: "Resolved", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
};

export function ComplaintsAdminTable() {
    const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<AdminComplaint | null>(null);
    const [draftStatus, setDraftStatus] = useState<ComplaintStatus>("OPEN");
    const [draftNote, setDraftNote] = useState("");

    const { data, isLoading } = useAdminComplaints({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search.trim() || undefined,
        limit: 100,
    });
    const updateStatus = useUpdateComplaintStatus();

    const openDetail = (complaint: AdminComplaint) => {
        setSelected(complaint);
        setDraftStatus(complaint.status);
        setDraftNote(complaint.resolutionNote ?? "");
    };

    const handleSave = () => {
        if (!selected) return;
        updateStatus.mutate(
            { id: selected.id, payload: { status: draftStatus, resolutionNote: draftNote } },
            {
                onSuccess: () => {
                    toast.success("Complaint updated");
                    setSelected(null);
                },
                onError: (error) => toast.error(getApiErrorMessage(error, "Failed to update complaint")),
            },
        );
    };

    const complaints = data?.data ?? [];

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by subject or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-12 h-11 bg-card/60 border-border/60 focus:border-primary/40 rounded-xl"
                    />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ComplaintStatus | "all")}>
                    <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : complaints.length === 0 ? (
                <div className="text-center py-16">
                    <MessageSquareWarning className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No complaints found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {complaints.map((complaint) => {
                        const meta = STATUS_META[complaint.status];
                        const Icon = meta.icon;
                        return (
                            <Card
                                key={complaint.id}
                                className="border-border/40 cursor-pointer hover:border-primary/30 hover:-translate-y-0.5 transition-all"
                                onClick={() => openDetail(complaint)}
                            >
                                <CardContent className="p-4 flex items-start justify-between gap-3">
                                    <div className="min-w-0 space-y-1">
                                        <p className="text-sm font-semibold text-foreground truncate">{complaint.subject}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-1">{complaint.description}</p>
                                        <p className="text-[11px] text-muted-foreground/70">
                                            {complaint.complainant.name} &middot; {complaint.complainant.email}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className={`gap-1.5 shrink-0 ${meta.className}`}>
                                        <Icon className="w-3 h-3" /> {meta.label}
                                    </Badge>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{selected?.subject}</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {selected.complainant.email}</span>
                                {selected.complainant.phoneNumber && (
                                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {selected.complainant.phoneNumber}</span>
                                )}
                            </div>
                            <p className="text-sm text-foreground whitespace-pre-wrap p-3 rounded-lg bg-secondary/20 border border-border/40">
                                {selected.description}
                            </p>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">Status</label>
                                <Select value={draftStatus} onValueChange={(v) => setDraftStatus(v as ComplaintStatus)}>
                                    <SelectTrigger className="h-10 rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OPEN">Open</SelectItem>
                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">Resolution Note</label>
                                <Textarea
                                    placeholder="Note visible to the candidate..."
                                    value={draftNote}
                                    onChange={(e) => setDraftNote(e.target.value)}
                                    rows={4}
                                    maxLength={2000}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
                                <Button
                                    className="gradient-primary text-white"
                                    onClick={handleSave}
                                    disabled={updateStatus.isPending}
                                >
                                    {updateStatus.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Save
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

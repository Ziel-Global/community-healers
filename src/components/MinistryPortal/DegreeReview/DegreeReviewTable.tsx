import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, User, FileText, ExternalLink, CheckCircle2, XCircle, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
    useApproveDegreeDocument,
    useDegreeReviewQueue,
    useRejectDegreeDocument,
} from "@/hooks/queries/useMinistryQueries";
import { ministryService } from "@/services/ministryService";
import { getApiErrorMessage } from "@/lib/errors";
import type { DegreeReviewCandidate } from "@/types/ministry";

function isPdfBlob(blob: Blob) {
    return blob.type === "application/pdf";
}

function isImageBlob(blob: Blob) {
    return blob.type.startsWith("image/");
}

export function DegreeReviewTable() {
    const { data: queue = [], isLoading, error } = useDegreeReviewQueue();
    const approveMutation = useApproveDegreeDocument();
    const rejectMutation = useRejectDegreeDocument();

    const [selected, setSelected] = useState<DegreeReviewCandidate | null>(null);
    const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
    const [previewIsPdf, setPreviewIsPdf] = useState(false);
    const [previewIsImage, setPreviewIsImage] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        if (error) {
            toast.error(getApiErrorMessage(error, "Failed to load degree review queue"));
        }
    }, [error]);

    useEffect(() => {
        return () => {
            if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
        };
    }, [previewBlobUrl]);

    const openCandidate = async (candidate: DegreeReviewCandidate) => {
        setSelected(candidate);
        setPreviewLoading(true);
        setPreviewBlobUrl(null);
        try {
            const blob = await ministryService.getDegreeDocumentBlob(candidate.candidateId);
            setPreviewIsPdf(isPdfBlob(blob));
            setPreviewIsImage(isImageBlob(blob));
            setPreviewBlobUrl(URL.createObjectURL(blob));
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Could not load the transcript document."));
        } finally {
            setPreviewLoading(false);
        }
    };

    const closeCandidate = () => {
        setSelected(null);
        setPreviewBlobUrl(null);
    };

    const handleApprove = (candidateId: string, name: string) => {
        approveMutation.mutate(candidateId, {
            onSuccess: () => {
                toast.success(`Degree transcript approved for ${name}`);
                closeCandidate();
            },
            onError: (err) => toast.error(getApiErrorMessage(err, "Failed to approve document")),
        });
    };

    const handleReject = (candidateId: string, name: string) => {
        rejectMutation.mutate(
            { candidateId, reason: rejectReason.trim() || undefined },
            {
                onSuccess: () => {
                    toast.success(`Degree transcript rejected for ${name}`);
                    setRejectingId(null);
                    setRejectReason("");
                    closeCandidate();
                },
                onError: (err) => toast.error(getApiErrorMessage(err, "Failed to reject document")),
            },
        );
    };

    const busy = approveMutation.isPending || rejectMutation.isPending;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading degree submissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-secondary/40 border-b border-border/40">
                                <th className="p-3 sm:p-4 text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Candidate</th>
                                <th className="p-3 sm:p-4 text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">City</th>
                                <th className="p-3 sm:p-4 text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">Submitted</th>
                                <th className="p-3 sm:p-4 text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {queue.map((item) => (
                                <tr key={item.documentId} className="hover:bg-primary/5 transition-colors">
                                    <td className="p-3 sm:p-4">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="alumni-sans-subtitle text-foreground leading-none text-sm sm:text-base truncate">
                                                    {item.candidate.user.firstName} {item.candidate.user.lastName}
                                                </p>
                                                <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 font-mono truncate">{item.candidate.cnic}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 sm:p-4 hidden sm:table-cell">
                                        <p className="text-sm text-foreground">{item.candidate.city?.name || "—"}</p>
                                    </td>
                                    <td className="p-3 sm:p-4 hidden sm:table-cell">
                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(item.submittedAt).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="p-3 sm:p-4 text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 gap-1.5 text-xs"
                                            onClick={() => openCandidate(item)}
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            Review
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {queue.length === 0 && (
                        <div className="text-center py-12">
                            <GraduationCap className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">No degree submissions awaiting review</p>
                        </div>
                    )}
                </div>
            </Card>

            <Dialog open={!!selected} onOpenChange={(open) => { if (!open) closeCandidate(); }}>
                <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <User className="w-5 h-5 text-primary" />
                            {selected?.candidate.user.firstName} {selected?.candidate.user.lastName}
                        </DialogTitle>
                    </DialogHeader>

                    {selected && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">CNIC</p>
                                    <p className="font-medium">{selected.candidate.cnic}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">City</p>
                                    <p className="font-medium">{selected.candidate.city?.name || "—"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Email</p>
                                    <p className="font-medium truncate">{selected.candidate.user.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Phone</p>
                                    <p className="font-medium">{selected.candidate.user.phoneNumber}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" /> Degree Transcript
                                </p>
                                <div className="rounded-lg bg-secondary/30 p-2 overflow-auto max-h-[55vh]">
                                    {previewLoading && (
                                        <div className="p-12 text-center">
                                            <Loader2 className="w-8 h-8 text-muted-foreground mx-auto animate-spin" />
                                        </div>
                                    )}
                                    {!previewLoading && previewBlobUrl && (
                                        <>
                                            {previewIsPdf && (
                                                <iframe src={previewBlobUrl} title="Degree transcript" className="w-full h-[50vh] rounded-md border-0" />
                                            )}
                                            {previewIsImage && (
                                                <img src={previewBlobUrl} alt="Degree transcript" className="max-w-full h-auto mx-auto rounded-md" />
                                            )}
                                            {!previewIsPdf && !previewIsImage && (
                                                <div className="flex flex-col items-center justify-center gap-3 py-12">
                                                    <FileText className="w-10 h-10 text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">Preview not available for this file type</p>
                                                    <Button variant="outline" onClick={() => window.open(previewBlobUrl, "_blank")}>
                                                        Open in new tab
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {rejectingId === selected.candidateId ? (
                                <div className="space-y-3 pt-2 border-t">
                                    <Textarea
                                        placeholder="Reason for rejection (optional, shown to the candidate)"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        rows={3}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setRejectingId(null)}>Cancel</Button>
                                        <Button
                                            variant="destructive"
                                            disabled={busy}
                                            onClick={() => handleReject(selected.candidateId, `${selected.candidate.user.firstName} ${selected.candidate.user.lastName}`)}
                                        >
                                            {rejectMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Confirm Rejection
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button variant="outline" onClick={closeCandidate}>Close</Button>
                                    <Button
                                        variant="outline"
                                        className="border-destructive/40 text-destructive hover:bg-destructive/10"
                                        disabled={busy}
                                        onClick={() => setRejectingId(selected.candidateId)}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        disabled={busy}
                                        onClick={() => handleApprove(selected.candidateId, `${selected.candidate.user.firstName} ${selected.candidate.user.lastName}`)}
                                    >
                                        {approveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                        Approve
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

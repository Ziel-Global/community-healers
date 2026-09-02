import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, Clock, UserCheck, Eye, Phone, Mail, MapPin, Calendar, FileText, Download, ExternalLink, Loader2, ShieldAlert, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTodayCandidates, useOverrideLiveness } from "@/hooks/queries/useCenterAdminQueries";
import { getApiErrorMessage } from "@/lib/errors";
import { useToast } from "@/hooks/use-toast";
import { getCandidateAvatarUrl } from "@/utils/avatar";
import { formatTimeLabel } from "@/utils/time";
import { centerAdminService } from "@/services/centerAdminService";

interface Document {
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    fileUrl: string | null;
    fileType?: string | null;
}

interface Candidate {
    id: string;
    name: string;
    cnic: string;
    time: string;
    payment: string;
    status: string;
    photo: string;
    phone?: string;
    email?: string;
    address?: string;
    dob?: string;
    fatherName?: string;
    documents?: Document[];
    livenessVerified?: boolean;
    livenessAttempts?: number;
    livenessBlocked?: boolean;
}

/**
 * Exam-start liveness state is separate from candidateStatus (the admin's
 * check-in verification) — a candidate can be "Verified" at check-in but
 * still stuck, failing, or blocked at the face-check gate right before
 * their exam actually starts. Only rendered once check-in verification has
 * happened, since liveness only matters after that point.
 */
const LivenessIndicator = ({ candidate }: { candidate: Candidate }) => {
    if (candidate.status !== "Verified" || candidate.livenessVerified) return null;
    if (candidate.livenessBlocked) {
        return (
            <Badge variant="destructive" className="gap-1 text-[9px] sm:text-[10px]">
                <ShieldAlert className="w-3 h-3" /> Exam Blocked — Face Verification Failed
            </Badge>
        );
    }
    if ((candidate.livenessAttempts ?? 0) > 0) {
        return (
            <Badge variant="secondary" className="gap-1 text-[9px] sm:text-[10px] bg-amber-100 text-amber-700 border-amber-200">
                <AlertTriangle className="w-3 h-3" /> Liveness Failed ({candidate.livenessAttempts}/2)
            </Badge>
        );
    }
    return null;
};

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case "Verified":
            return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Verified</Badge>;
        case "Pending":
            return <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700 border-amber-200"><Clock className="w-3 h-3" /> Pending</Badge>;
        case "Absent":
            return <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700 border-blue-200"><XCircle className="w-3 h-3" /> Absent</Badge>;
        case "Rejected":
            return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

interface CandidateTableProps {
    statusFilter?: string;
    examDate?: string;
    canVerify?: boolean;
}

export function CandidateTable({
    statusFilter = "all",
    examDate,
    canVerify = false
}: CandidateTableProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [pendingDocId, setPendingDocId] = useState<string | null>(null);
    const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
    const [overrideReason, setOverrideReason] = useState("");
    const overrideLivenessMutation = useOverrideLiveness();

    // Default to today if not provided — local date components, not
    // toISOString(), which converts to UTC first and silently returns
    // "yesterday" for any timezone ahead of UTC (e.g. PKT) between midnight
    // and the UTC day rollover.
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const targetDate = examDate || localToday;
    const { data, isLoading: loading, isError, error: queryError } = useTodayCandidates(targetDate);

    // Fetches the document as a blob rather than using doc.fileUrl directly as
    // a link target — the backend requires the X-Requested-With header on
    // cookie-authenticated requests (CSRF protection), which window.open()/an
    // <a> tag can never send. Revoking is delayed since both consumers below
    // read the blob URL asynchronously (new tab / download) right after this
    // returns, not synchronously.
    const handleOpenDocument = async (doc: Document, mode: "view" | "download") => {
        if (!doc.fileUrl || !selectedCandidate) return;
        setPendingDocId(doc.id);
        try {
            const blob = await centerAdminService.getCandidateDocumentBlob(selectedCandidate.id, doc.type);
            const blobUrl = URL.createObjectURL(blob);
            if (mode === "view") {
                window.open(blobUrl, "_blank");
            } else {
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = doc.name;
                link.click();
            }
            setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: getApiErrorMessage(error, "Could not load this document."),
            });
        } finally {
            setPendingDocId(null);
        }
    };

    const candidates: Candidate[] = useMemo(() => {
        // Data is already unwrapped by the service
        const candidatesArray = data || [];

        if (!Array.isArray(candidatesArray)) {
            console.error("Expected array but got:", data);
            return [];
        }

        // Map API response to Component Candidate interface
        return candidatesArray.map((item: any) => {
            const name = item.user
                ? `${item.user.firstName} ${item.user.lastName}`
                : (item.name || "Unknown");
            const documents = (item.documents || []).map((d: any) => {
                const typeLabels: Record<string, string> = {
                    photo: "Candidate Photo",
                    passport: "Passport",
                    visa: "Visa",
                    cnicFront: "CNIC Front",
                    cnicBack: "CNIC Back",
                    degreeTranscript: "Degree/Transcript",
                };
                return {
                    id: d.id,
                    name: typeLabels[d.type] || d.name || d.type || "Document",
                    type: d.type,
                    uploadDate: d.createdAt || d.uploadDate || "",
                    fileUrl: d.fileUrl ?? null,
                    fileType: d.fileType ?? null,
                };
            });

            return {
                id: item.userId || item.id || item.cnic,
                name,
                cnic: item.cnic || "N/A",
                time: formatTimeLabel(item.examStartTime || item.time, {
                    fallback: "9:00 AM",
                    datePart: item.examDate,
                }),
                payment: item.payment || "Paid",
                status: item.candidateStatus
                    ? (item.candidateStatus.charAt(0).toUpperCase() + item.candidateStatus.slice(1).toLowerCase())
                    : "Pending",
                photo: getCandidateAvatarUrl({
                    seed: item.user?.firstName || name,
                    cnic: item.cnic,
                    photoUrl: item.photoUrl || item.photo,
                    documents,
                }),
                phone: item.user?.phoneNumber || item.phone,
                email: item.user?.email || item.email,
                address: item.address,
                dob: item.dob,
                fatherName: item.fatherName,
                documents,
                livenessVerified: item.livenessVerified,
                livenessAttempts: item.livenessAttempts,
                livenessBlocked: item.livenessBlocked,
            };
        });
    }, [data]);

    const error = isError ? getApiErrorMessage(queryError, "Failed to load candidates.") : null;

    const handleVerify = () => {
        // Navigate to verification page with candidate data
        if (selectedCandidate) {
            navigate("/center/verification", { state: { candidate: selectedCandidate } });
        } else {
            navigate("/center/verification");
        }
        setSelectedCandidate(null);
    };

    const handleOverrideLiveness = () => {
        if (!selectedCandidate || overrideReason.trim().length < 5) return;
        overrideLivenessMutation.mutate(
            { candidateId: selectedCandidate.id, reason: overrideReason.trim() },
            {
                onSuccess: () => {
                    toast({
                        title: "Liveness check overridden",
                        description: `${selectedCandidate.name} can now start the exam.`,
                    });
                    setOverrideDialogOpen(false);
                    setOverrideReason("");
                    setSelectedCandidate(null);
                },
                onError: (error) => {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: getApiErrorMessage(error, "Failed to override liveness check."),
                    });
                },
            }
        );
    };

    // Filter candidates by status
    const filteredCandidates = statusFilter === "all"
        ? candidates
        : candidates.filter(c => c.status === statusFilter);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center p-8 text-destructive">
                {error}
            </div>
        );
    }
    return (
        <>
            <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-secondary/40 border-b border-border/40">
                                <th className="p-3 sm:p-4 text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Candidate</th>
                                <th className="p-3 sm:p-4 text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest hidden md:table-cell">CNIC</th>
                                <th className="p-3 sm:p-4 text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Time</th>
                                <th className="p-3 sm:p-4 text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:table-cell">Payment</th>
                                <th className="p-3 sm:p-4 text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                                <th className="p-3 sm:p-4 text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {filteredCandidates.map((c) => (
                                <tr key={c.id} className="hover:bg-primary/5 transition-colors group">
                                    <td className="p-3 sm:p-4">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <img
                                                src={c.photo}
                                                alt={c.name}
                                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-secondary object-cover border border-border/40 flex-shrink-0"
                                                onError={(e) => {
                                                    const img = e.currentTarget;
                                                    if (img.dataset.fallbackApplied === "true") return;
                                                    img.dataset.fallbackApplied = "true";
                                                    img.src = getCandidateAvatarUrl({
                                                        seed: c.name,
                                                        cnic: c.cnic,
                                                    });
                                                }}
                                            />
                                            <div className="min-w-0">
                                                <p className="alumni-sans-subtitle text-foreground text-base sm:text-lg truncate">{c.name}</p>
                                                <p className="text-[9px] sm:text-[10px] text-muted-foreground font-mono truncate">{c.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 sm:p-4 hidden md:table-cell">
                                        <p className="text-xs sm:text-sm font-medium text-foreground">{c.cnic}</p>
                                    </td>
                                    <td className="p-3 sm:p-4">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary" />
                                            <p className="text-xs sm:text-sm font-medium text-foreground">{c.time}</p>
                                        </div>
                                    </td>
                                    <td className="p-3 sm:p-4 hidden sm:table-cell">
                                        <Badge variant={c.payment === "Paid" ? "success" : "destructive"} className="px-1.5 sm:px-2 py-0 text-[9px] sm:text-[10px] uppercase font-bold tracking-tighter">
                                            {c.payment}
                                        </Badge>
                                    </td>
                                    <td className="p-3 sm:p-4">
                                        <div className="flex flex-col items-start gap-1">
                                            <StatusBadge status={c.status} />
                                            <LivenessIndicator candidate={c} />
                                        </div>
                                    </td>
                                    <td className="p-3 sm:p-4 text-right">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 sm:h-9 px-2 sm:px-3 gap-1 sm:gap-2 hover:bg-primary hover:text-primary-foreground rounded-lg transition-all text-xs"
                                            onClick={() => setSelectedCandidate(c)}
                                        >
                                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            <span className="hidden sm:inline">Details</span>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Candidate Detail Modal */}
            <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl font-bold alumni-sans-title">Candidate Details</DialogTitle>
                    </DialogHeader>

                    {selectedCandidate && (
                        <div className="space-y-4 sm:space-y-6">
                            {/* Candidate Header */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 pb-4 sm:pb-6 border-b text-center sm:text-left">
                                <img
                                    src={selectedCandidate.photo}
                                    alt={selectedCandidate.name}
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-secondary object-cover border-2 border-border/40"
                                    onError={(e) => {
                                        const img = e.currentTarget;
                                        if (img.dataset.fallbackApplied === "true") return;
                                        img.dataset.fallbackApplied = "true";
                                        img.src = getCandidateAvatarUrl({
                                            seed: selectedCandidate.name,
                                            cnic: selectedCandidate.cnic,
                                        });
                                    }}
                                />
                                <div className="flex-1">
                                    <h3 className="text-lg sm:text-xl font-bold text-foreground alumni-sans-title">{selectedCandidate.name}</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground font-mono mt-1">{selectedCandidate.id}</p>
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                                        <StatusBadge status={selectedCandidate.status} />
                                        <LivenessIndicator candidate={selectedCandidate} />
                                        <Badge variant={selectedCandidate.payment === "Paid" ? "success" : "destructive"}>
                                            {selectedCandidate.payment}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Personal Information</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <FileText className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold uppercase">CNIC</p>
                                            <p className="text-sm font-medium">{selectedCandidate.cnic}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold uppercase">Date of Birth</p>
                                            <p className="text-sm font-medium">{selectedCandidate.dob}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <UserCheck className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold uppercase">Father's Name</p>
                                            <p className="text-sm font-medium">{selectedCandidate.fatherName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold uppercase">Exam Time</p>
                                            <p className="text-sm font-medium">{selectedCandidate.time}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4 pt-4 border-t">
                                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Contact Information</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold uppercase">Phone Number</p>
                                            <p className="text-sm font-medium">{selectedCandidate.phone}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Mail className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold uppercase">Email Address</p>
                                            <p className="text-sm font-medium">{selectedCandidate.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 md:col-span-2">
                                        <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold uppercase">Address</p>
                                            <p className="text-sm font-medium">{selectedCandidate.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Uploaded Documents */}
                            {selectedCandidate.documents && selectedCandidate.documents.length > 0 && (
                                <div className="space-y-4 pt-4 border-t">
                                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Uploaded Documents</h4>

                                    <div className="grid grid-cols-1 gap-3">
                                        {selectedCandidate.documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-secondary/20 hover:bg-secondary/40 transition-colors"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <FileText className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-foreground truncate">{doc.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs text-muted-foreground">{doc.type}</span>
                                                            <span className="text-xs text-muted-foreground">•</span>
                                                            <span className="text-xs text-muted-foreground">{doc.uploadDate}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        disabled={!doc.fileUrl || pendingDocId === doc.id}
                                                        onClick={() => handleOpenDocument(doc, "view")}
                                                    >
                                                        {pendingDocId === doc.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <ExternalLink className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        disabled={!doc.fileUrl || pendingDocId === doc.id}
                                                        onClick={() => handleOpenDocument(doc, "download")}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" onClick={() => setSelectedCandidate(null)}>
                                    Close
                                </Button>
                                {canVerify && selectedCandidate.livenessBlocked && (
                                    <Button
                                        variant="outline"
                                        className="border-destructive/40 text-destructive hover:bg-destructive/10"
                                        onClick={() => setOverrideDialogOpen(true)}
                                    >
                                        <ShieldAlert className="w-4 h-4 mr-2" />
                                        Verify Manually & Unblock
                                    </Button>
                                )}
                                {canVerify && selectedCandidate.status === "Pending" && (
                                    <Button
                                        onClick={handleVerify}
                                        className="gradient-primary text-white"
                                    >
                                        Verify Candidate
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Manual Liveness Override — bypasses the automated face check for a
                candidate blocked after 2 failed attempts. Requires a reason since
                this skips biometric verification and needs a paper trail. */}
            <Dialog
                open={overrideDialogOpen}
                onOpenChange={(open) => {
                    setOverrideDialogOpen(open);
                    if (!open) setOverrideReason("");
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-destructive" />
                            Verify Manually & Unblock
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            This skips the automated face check for <span className="font-medium text-foreground">{selectedCandidate?.name}</span> and lets them start the exam. Only do this after physically verifying their identity (face + CNIC) yourself.
                        </p>
                        <Textarea
                            placeholder="Reason for override (e.g. camera lighting issue, verified CNIC + face in person)"
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            rows={3}
                        />
                        {overrideReason.trim().length > 0 && overrideReason.trim().length < 5 && (
                            <p className="text-xs text-destructive">Reason must be at least 5 characters.</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setOverrideDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={overrideReason.trim().length < 5 || overrideLivenessMutation.isPending}
                            onClick={handleOverrideLiveness}
                        >
                            {overrideLivenessMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Confirm Override
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

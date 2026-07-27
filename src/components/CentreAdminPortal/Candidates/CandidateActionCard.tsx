import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    CheckCircle2,
    UserCheck,
    ShieldCheck,
    XCircle,
    Fingerprint,
    Loader2,
    FileText,
    Eye,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { centerAdminService } from "@/services/centerAdminService";
import { useToast } from "@/hooks/use-toast";
import { getCandidateAvatarUrl } from "@/utils/avatar";
import { getDocumentPreviewUrl, getSampleDocumentUrl } from "@/utils/sampleDocuments";

interface CandidateDocument {
    id: string;
    name?: string;
    type: string;
    uploadDate?: string;
    fileUrl?: string | null;
}

interface Candidate {
    id: string;
    name: string;
    cnic: string;
    time: string;
    photo: string;
    documents?: CandidateDocument[];
    [key: string]: any;
}

const DOC_LABELS: Record<string, string> = {
    photo: "Candidate Photo",
    passport: "Passport",
    visa: "Visa",
    cnicFront: "CNIC Front",
    cnicBack: "CNIC Back",
    degreeTranscript: "Degree/Transcript",
};

const EXPECTED_DOC_TYPES = [
    "photo",
    "passport",
    "visa",
    "cnicFront",
    "cnicBack",
] as const;

function isImageUrl(url?: string | null) {
    if (!url) return false;
    return /\.(jpe?g|png|gif|webp|bmp)(\?|$)/i.test(url) || url.includes("image");
}

function isPdfUrl(url?: string | null) {
    if (!url) return false;
    return /\.pdf(\?|$)/i.test(url);
}

export function CandidateActionCard({ candidate }: { candidate?: Candidate }) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<{
        label: string;
        fileUrl: string;
    } | null>(null);
    const [checklist, setChecklist] = useState({
        present: false,
        faceMatch: false,
        cnicMatch: false,
    });

    const isVerified = checklist.present && checklist.faceMatch && checklist.cnicMatch;

    const documentRows = useMemo(() => {
        const uploaded = candidate?.documents || [];
        const byType = new Map(
            uploaded
                .filter((d) => d.type)
                .map((d) => [d.type, d] as const)
        );

        return EXPECTED_DOC_TYPES.map((type) => {
            const found = byType.get(type);
            const sampleUrl = getSampleDocumentUrl(type);
            const fileUrl = getDocumentPreviewUrl(type);
            const uploaded = !!sampleUrl || !!found?.fileUrl;
            return {
                type,
                label: DOC_LABELS[type] || type,
                uploaded,
                fileUrl: fileUrl,
            };
        });
    }, [candidate?.documents]);

    const getErrorMessage = (error: any, fallback: string) => {
        return (
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.response?.data?.data?.message ||
            fallback
        );
    };

    const handleVerifyAndUnlock = async () => {
        if (!candidate?.id) return;
        setLoading(true);
        try {
            await centerAdminService.updateCandidateStatus(candidate.id, 'VERIFIED');
            toast({
                title: "Success",
                description: "Candidate verified and exam unlocked.",
            });
            navigate("/center/candidates");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: getErrorMessage(error, "Failed to verify candidate. Please try again."),
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!candidate?.id) return;
        setLoading(true);
        try {
            await centerAdminService.updateCandidateStatus(candidate.id, 'REJECTED');
            toast({
                title: "Candidate Rejected",
                description: "Candidate has been marked as rejected.",
            });
            navigate("/center/candidates");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: getErrorMessage(error, "Failed to reject candidate. Please try again."),
            });
        } finally {
            setLoading(false);
        }
    };

    const displayData = {
        name: candidate?.name || "Muhammad Ahmed",
        cnic: candidate?.cnic || "35201-1234567-1",
        time: candidate?.time || "09:00 AM",
        photo: candidate?.photo || getCandidateAvatarUrl({
            seed: candidate?.name || "Ahmed",
            cnic: candidate?.cnic,
            documents: candidate?.documents,
        }),
    };

    return (
        <>
            <Card className="border-border/40 shadow-royal overflow-hidden bg-card/80 backdrop-blur-md">
                <CardHeader className="bg-primary/5 border-b border-border/40 p-6">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                            <div className="relative">
                                <img
                                    src={displayData.photo}
                                    alt="Candidate"
                                    className="w-20 h-20 rounded-2xl bg-white p-1 border border-primary/20 shadow-md object-cover"
                                    onError={(e) => {
                                        const img = e.currentTarget;
                                        if (img.dataset.fallbackApplied === "true") return;
                                        img.dataset.fallbackApplied = "true";
                                        img.src = getCandidateAvatarUrl({
                                            seed: displayData.name,
                                            cnic: displayData.cnic,
                                        });
                                    }}
                                />
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shadow-lg">
                                    <ShieldCheck className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <div>
                                <Badge variant="success" className="mb-2 uppercase tracking-widest text-[10px] bg-primary/20 text-primary border-primary/30">
                                    Payment Verified
                                </Badge>
                                <CardTitle className="text-2xl font-display font-bold">{displayData.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1 font-mono text-xs">
                                    <Fingerprint className="w-3.5 h-3.5 text-primary" />
                                    CNIC: {displayData.cnic}
                                </CardDescription>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Time Slot</p>
                            <p className="text-lg font-bold text-foreground">{displayData.time}</p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-primary" /> Verification Checklist
                        </h4>

                        <div className="grid gap-3">
                            {[
                                { id: 'present', label: 'Candidate is Physically Present' },
                                { id: 'faceMatch', label: 'Face matches Registration Photo' },
                                { id: 'cnicMatch', label: 'CNIC matches system Record' }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setChecklist(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border transition-all text-left group",
                                        checklist[item.id as keyof typeof checklist]
                                            ? "bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20"
                                            : "bg-secondary text-muted-foreground border-border/40 hover:border-primary/40"
                                    )}
                                >
                                    <span className={cn("text-sm font-medium transition-colors", checklist[item.id as keyof typeof checklist] ? "text-emerald-700" : "text-muted-foreground")}>
                                        {item.label}
                                    </span>
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                        checklist[item.id as keyof typeof checklist]
                                            ? "bg-emerald-500 border-emerald-500 scale-110"
                                            : "border-border/60 group-hover:border-primary/40"
                                    )}>
                                        {checklist[item.id as keyof typeof checklist] && <CheckCircle2 className="w-4 h-4 text-white" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" /> Uploaded Documents
                        </h4>

                        <div className="grid gap-3">
                            {documentRows.map((doc) => (
                                <button
                                    key={doc.type}
                                    type="button"
                                    disabled={!doc.uploaded || !doc.fileUrl}
                                    onClick={() => {
                                        if (doc.fileUrl) {
                                            setPreviewDoc({ label: doc.label, fileUrl: doc.fileUrl });
                                        }
                                    }}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border transition-all text-left group",
                                        doc.uploaded
                                            ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15 cursor-pointer"
                                            : "bg-secondary/60 border-border/40 opacity-80 cursor-not-allowed"
                                    )}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={cn(
                                            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                                            doc.uploaded ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-muted-foreground"
                                        )}>
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={cn(
                                                "text-sm font-medium truncate",
                                                doc.uploaded ? "text-emerald-800" : "text-muted-foreground"
                                            )}>
                                                {doc.label}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {doc.uploaded ? "Uploaded — click to view" : "Not uploaded"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {doc.uploaded ? (
                                            <>
                                                <Eye className="w-4 h-4 text-emerald-600 opacity-70 group-hover:opacity-100" />
                                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full border-2 border-border/60 flex items-center justify-center">
                                                <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border/40">
                        <Button
                            variant="outline"
                            className={cn(
                                "flex-1 h-12 font-bold transition-all shadow-sm group",
                                (isVerified || loading) ? "bg-secondary text-muted-foreground cursor-not-allowed" : "border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive/50"
                            )}
                            disabled={isVerified || loading}
                            onClick={handleReject}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                                <XCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                            )}
                            Reject Candidate
                        </Button>
                        <Button
                            className={cn(
                                "flex-1 h-12 font-bold transition-all shadow-lg group",
                                (isVerified && !loading) ? "gradient-primary text-white" : "bg-primary/20 text-muted-foreground cursor-not-allowed border-none shadow-none"
                            )}
                            disabled={!isVerified || loading}
                            onClick={handleVerifyAndUnlock}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                            )}
                            Verify & Unlock
                        </Button>
                    </div>

                    {!isVerified && (
                        <p className="text-center text-[10px] text-muted-foreground uppercase font-medium tracking-tight">
                            * Complete all checks to proceed with verification
                        </p>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            {previewDoc?.label}
                        </DialogTitle>
                    </DialogHeader>
                    {previewDoc?.fileUrl && (
                        <div className="overflow-auto max-h-[70vh] rounded-lg bg-secondary/30 p-2">
                            {isImageUrl(previewDoc.fileUrl) && (
                                <img
                                    src={previewDoc.fileUrl}
                                    alt={previewDoc.label}
                                    className="max-w-full h-auto mx-auto rounded-md"
                                />
                            )}
                            {isPdfUrl(previewDoc.fileUrl) && (
                                <iframe
                                    src={previewDoc.fileUrl}
                                    title={previewDoc.label}
                                    className="w-full h-[65vh] rounded-md border-0"
                                />
                            )}
                            {!isImageUrl(previewDoc.fileUrl) && !isPdfUrl(previewDoc.fileUrl) && (
                                <div className="flex flex-col items-center justify-center gap-3 py-12">
                                    <FileText className="w-10 h-10 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Preview not available for this file type</p>
                                    <Button
                                        variant="outline"
                                        onClick={() => window.open(previewDoc.fileUrl, "_blank")}
                                    >
                                        Open in new tab
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

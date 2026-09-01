import { useEffect, useMemo, useRef, useState } from "react";
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
    Camera,
    Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateCandidateStatus, useVerifyFace } from "@/hooks/queries/useCenterAdminQueries";
import { getApiErrorMessage } from "@/lib/errors";
import { useToast } from "@/hooks/use-toast";
import { getCandidateAvatarUrl } from "@/utils/avatar";
import { centerAdminService, CandidateDocument, VerifyFaceLivenessResult } from "@/services/centerAdminService";
import { CameraCaptureDialog } from "./CameraCaptureDialog";
import { LivenessCheckDialog } from "./LivenessCheckDialog";

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

function isImageFile(fileType?: string | null) {
    return !!fileType?.startsWith("image/");
}

function isPdfFile(fileType?: string | null) {
    return fileType === "application/pdf";
}

export function CandidateActionCard({ candidate }: { candidate?: Candidate }) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const updateCandidateStatus = useUpdateCandidateStatus();
    const verifyFace = useVerifyFace();
    const loading = updateCandidateStatus.isPending;
    const faceInputRef = useRef<HTMLInputElement>(null);
    const [faceCheckResult, setFaceCheckResult] = useState<{
        matched: boolean;
        confidence: number;
        liveness?: { pass: boolean; confidence: number };
    } | null>(null);
    const [showCameraDialog, setShowCameraDialog] = useState(false);
    const [showLivenessDialog, setShowLivenessDialog] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<{
        label: string;
        type: string;
        fileType?: string | null;
    } | null>(null);
    const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [checklist, setChecklist] = useState({
        present: false,
        faceMatch: false,
        cnicMatch: false,
    });

    const isVerified = checklist.present && checklist.faceMatch && checklist.cnicMatch;

    // Revoke the previous blob URL whenever it's replaced or the component
    // unmounts — object URLs otherwise leak memory for the life of the page.
    useEffect(() => {
        return () => {
            if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
        };
    }, [previewBlobUrl]);

    const documentRows = useMemo(() => {
        const uploaded = candidate?.documents || [];
        const byType = new Map(
            uploaded
                .filter((d) => d.type)
                .map((d) => [d.type, d] as const)
        );

        return EXPECTED_DOC_TYPES.map((type) => {
            const found = byType.get(type);
            return {
                type,
                label: DOC_LABELS[type] || type,
                uploaded: !!found?.fileUrl,
                fileType: found?.fileType,
            };
        });
    }, [candidate?.documents]);

    const handleViewDocument = async (doc: { type: string; label: string; fileType?: string | null }) => {
        if (!candidate?.id) return;
        setPreviewDoc(doc);
        setPreviewLoading(true);
        try {
            const blob = await centerAdminService.getCandidateDocumentBlob(candidate.id, doc.type);
            setPreviewBlobUrl(URL.createObjectURL(blob));
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Preview unavailable",
                description: getApiErrorMessage(error, "Could not load this document."),
            });
            setPreviewDoc(null);
        } finally {
            setPreviewLoading(false);
        }
    };

    const closePreview = () => {
        setPreviewDoc(null);
        setPreviewBlobUrl(null);
    };

    const runFaceVerification = (file: File) => {
        if (!candidate?.id) return;

        verifyFace.mutate(
            { candidateId: candidate.id, photo: file },
            {
                onSuccess: (result) => {
                    setFaceCheckResult({ matched: result.matched, confidence: result.confidence });
                    setChecklist((prev) => ({ ...prev, faceMatch: result.matched }));
                    toast({
                        title: result.matched ? "Face Matched" : "Face Did Not Match",
                        description: `Confidence: ${result.confidence.toFixed(1)}%${result.matched ? "" : " — retry or override manually"}`,
                        variant: result.matched ? "default" : "destructive",
                    });
                },
                onError: (error) => {
                    toast({
                        variant: "destructive",
                        title: "Verification Failed",
                        description: getApiErrorMessage(error, "Could not verify face. Please try again."),
                    });
                },
            }
        );
    };

    const handleLivenessResult = (result: VerifyFaceLivenessResult) => {
        // Both gates matter here: liveness proves a real person is present
        // (anti-spoofing), the match proves it's this candidate. Only tick
        // the checklist when both hold.
        const passed = result.livenessPass && result.matched;
        setFaceCheckResult({
            matched: passed,
            confidence: result.faceMatchConfidence,
            liveness: { pass: result.livenessPass, confidence: result.livenessConfidence },
        });
        setChecklist((prev) => ({ ...prev, faceMatch: passed }));
        toast({
            title: !result.livenessPass
                ? "Liveness Check Failed"
                : result.matched
                    ? "Liveness Passed & Face Matched"
                    : "Liveness Passed but Face Did Not Match",
            description: !result.livenessPass
                ? `Liveness confidence: ${result.livenessConfidence.toFixed(1)}% — possible spoofing, retry or override manually`
                : `Face match confidence: ${result.faceMatchConfidence.toFixed(1)}%${result.matched ? "" : " — retry or override manually"}`,
            variant: passed ? "default" : "destructive",
        });
    };

    const handleFacePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ""; // allow re-selecting the same file on retry
        if (file) runFaceVerification(file);
    };

    const handleVerifyAndUnlock = () => {
        if (!candidate?.id) return;
        updateCandidateStatus.mutate(
            { id: candidate.id, status: 'VERIFIED' },
            {
                onSuccess: () => {
                    toast({
                        title: "Success",
                        description: "Candidate verified and exam unlocked.",
                    });
                    navigate("/center/candidates");
                },
                onError: (error) => {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: getApiErrorMessage(error, "Failed to verify candidate. Please try again."),
                    });
                },
            }
        );
    };

    const handleReject = () => {
        if (!candidate?.id) return;
        updateCandidateStatus.mutate(
            { id: candidate.id, status: 'REJECTED' },
            {
                onSuccess: () => {
                    toast({
                        title: "Candidate Rejected",
                        description: "Candidate has been marked as rejected.",
                    });
                    navigate("/center/candidates");
                },
                onError: (error) => {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: getApiErrorMessage(error, "Failed to reject candidate. Please try again."),
                    });
                },
            }
        );
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

                        <input
                            type="file"
                            accept="image/jpeg,image/png"
                            capture="environment"
                            ref={faceInputRef}
                            className="hidden"
                            onChange={handleFacePhotoSelected}
                        />
                        <div className="grid gap-3">
                            <div
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-xl border transition-all",
                                    checklist.faceMatch
                                        ? "bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20"
                                        : "bg-secondary text-muted-foreground border-border/40"
                                )}
                            >
                                <div className="min-w-0">
                                    <span className={cn("text-sm font-medium transition-colors block", checklist.faceMatch ? "text-emerald-700" : "text-muted-foreground")}>
                                        Face matches Registration Photo
                                    </span>
                                    {faceCheckResult && (
                                        <span className={cn("text-[11px] block", faceCheckResult.matched ? "text-emerald-600" : "text-destructive")}>
                                            {faceCheckResult.matched ? "Matched" : "No match"} — {faceCheckResult.confidence.toFixed(1)}% confidence
                                            {faceCheckResult.liveness && (
                                                <> · Liveness {faceCheckResult.liveness.pass ? "passed" : "failed"} ({faceCheckResult.liveness.confidence.toFixed(1)}%)</>
                                            )}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <div className="flex flex-col items-end gap-0.5">
                                        <div className="flex gap-1.5">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                disabled={verifyFace.isPending}
                                                onClick={() => setShowCameraDialog(true)}
                                                className="h-8"
                                            >
                                                {verifyFace.isPending ? (
                                                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                                ) : (
                                                    <Camera className="w-3.5 h-3.5 mr-1.5" />
                                                )}
                                                {faceCheckResult ? "Retry" : "Verify"}
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setShowLivenessDialog(true)}
                                                className="h-8"
                                                title="Stronger anti-spoofing check via live camera challenge"
                                            >
                                                <Video className="w-3.5 h-3.5 mr-1.5" />
                                                Liveness
                                            </Button>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={verifyFace.isPending}
                                            onClick={() => faceInputRef.current?.click()}
                                            className="text-[10px] text-muted-foreground underline hover:text-foreground"
                                        >
                                            or upload a file
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        title="Manual override"
                                        onClick={() => setChecklist((prev) => ({ ...prev, faceMatch: !prev.faceMatch }))}
                                        className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                                            checklist.faceMatch
                                                ? "bg-emerald-500 border-emerald-500 scale-110"
                                                : "border-border/60 hover:border-primary/40"
                                        )}
                                    >
                                        {checklist.faceMatch && <CheckCircle2 className="w-4 h-4 text-white" />}
                                    </button>
                                </div>
                            </div>
                            {[
                                { id: 'present', label: 'Candidate is Physically Present' },
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
                                    disabled={!doc.uploaded}
                                    onClick={() => {
                                        if (doc.uploaded) handleViewDocument(doc);
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

            <Dialog open={!!previewDoc} onOpenChange={(open) => { if (!open) closePreview(); }}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            {previewDoc?.label}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="overflow-auto max-h-[70vh] rounded-lg bg-secondary/30 p-2">
                        {previewLoading && (
                            <div className="p-12 text-center">
                                <Loader2 className="w-8 h-8 text-muted-foreground mx-auto animate-spin" />
                            </div>
                        )}
                        {!previewLoading && previewBlobUrl && (
                            <>
                                {isImageFile(previewDoc?.fileType) && (
                                    <img
                                        src={previewBlobUrl}
                                        alt={previewDoc?.label}
                                        className="max-w-full h-auto mx-auto rounded-md"
                                    />
                                )}
                                {isPdfFile(previewDoc?.fileType) && (
                                    <iframe
                                        src={previewBlobUrl}
                                        title={previewDoc?.label}
                                        className="w-full h-[65vh] rounded-md border-0"
                                    />
                                )}
                                {!isImageFile(previewDoc?.fileType) && !isPdfFile(previewDoc?.fileType) && (
                                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                                        <FileText className="w-10 h-10 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Preview not available for this file type</p>
                                        <Button
                                            variant="outline"
                                            onClick={() => window.open(previewBlobUrl, "_blank")}
                                        >
                                            Open in new tab
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <CameraCaptureDialog
                open={showCameraDialog}
                onOpenChange={setShowCameraDialog}
                onCapture={runFaceVerification}
            />

            {candidate?.id && (
                <LivenessCheckDialog
                    open={showLivenessDialog}
                    onOpenChange={setShowLivenessDialog}
                    candidateId={candidate.id}
                    onResult={handleLivenessResult}
                />
            )}
        </>
    );
}

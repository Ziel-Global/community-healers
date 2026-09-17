import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Award, Save, Upload, Loader2, PenTool } from "lucide-react";
import { toast } from "sonner";
import {
    useCertificateSettings,
    useUpdateCertificateDetails,
    useUpdateCertificateSignature1,
    useUpdateCertificateSignature2,
} from "@/hooks/queries/useSuperAdminQueries";
import { superAdminService } from "@/services/superAdminService";
import { getApiErrorMessage } from "@/lib/errors";

interface SignatureBlockProps {
    label: string;
    name: string;
    title: string;
    onNameChange: (value: string) => void;
    onTitleChange: (value: string) => void;
    currentSignatureUrl: string | null;
    currentSignatureLoading: boolean;
    onFileSelected: (file: File | null) => void;
    pendingPreviewUrl: string | null;
    uploading: boolean;
    onUpload: () => void;
    hasPendingFile: boolean;
}

function SignatureBlock({
    label,
    name,
    title,
    onNameChange,
    onTitleChange,
    currentSignatureUrl,
    currentSignatureLoading,
    onFileSelected,
    pendingPreviewUrl,
    uploading,
    onUpload,
    hasPendingFile,
}: SignatureBlockProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    return (
        <div className="space-y-4 p-4 rounded-xl border border-border/40 bg-white/40">
            <p className="text-sm font-semibold text-foreground uppercase tracking-wide">{label}</p>

            <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Name</Label>
                <Input
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    className="h-10 bg-white/50 border-border/60"
                    placeholder="e.g. Ms. Marija Raus"
                />
            </div>

            <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Title</Label>
                <Input
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="h-10 bg-white/50 border-border/60"
                    placeholder="e.g. Head of Region Silk Routes, ICMPD"
                />
            </div>

            <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Signature Image</Label>
                <div className="h-24 rounded-xl border border-dashed border-border/60 bg-white/50 flex items-center justify-center overflow-hidden">
                    {pendingPreviewUrl ? (
                        <img src={pendingPreviewUrl} alt="New signature preview" className="max-h-16 max-w-[85%] object-contain" />
                    ) : currentSignatureLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : currentSignatureUrl ? (
                        <img src={currentSignatureUrl} alt="Current signature" className="max-h-16 max-w-[85%] object-contain" />
                    ) : (
                        <div className="text-center text-muted-foreground text-xs flex flex-col items-center gap-1.5">
                            <PenTool className="w-4 h-4" />
                            No signature set yet
                        </div>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
                />
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-3.5 h-3.5" /> Choose Image
                    </Button>
                    <Button
                        size="sm"
                        className="gradient-primary text-white gap-1.5"
                        disabled={!hasPendingFile || uploading}
                        onClick={onUpload}
                    >
                        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Signature
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function CertificateTemplateForm() {
    const { data: settings, isLoading } = useCertificateSettings();
    const updateDetails = useUpdateCertificateDetails();
    const updateSignature1 = useUpdateCertificateSignature1();
    const updateSignature2 = useUpdateCertificateSignature2();

    const [signature1Name, setSignature1Name] = useState("");
    const [signature1Title, setSignature1Title] = useState("");
    const [signature2Name, setSignature2Name] = useState("");
    const [signature2Title, setSignature2Title] = useState("");
    const [trainingDuration, setTrainingDuration] = useState("");

    const [signature1Url, setSignature1Url] = useState<string | null>(null);
    const [signature1Loading, setSignature1Loading] = useState(true);
    const [signature2Url, setSignature2Url] = useState<string | null>(null);
    const [signature2Loading, setSignature2Loading] = useState(true);

    const [pendingFile1, setPendingFile1] = useState<File | null>(null);
    const [pendingPreview1, setPendingPreview1] = useState<string | null>(null);
    const [pendingFile2, setPendingFile2] = useState<File | null>(null);
    const [pendingPreview2, setPendingPreview2] = useState<string | null>(null);

    useEffect(() => {
        if (!settings) return;
        setSignature1Name(settings.signature1Name);
        setSignature1Title(settings.signature1Title);
        setSignature2Name(settings.signature2Name);
        setSignature2Title(settings.signature2Title);
        setTrainingDuration(settings.trainingDuration);
    }, [settings]);

    // Load the current signature images as blob previews once, and whenever a new one is saved.
    useEffect(() => {
        let cancelled = false;
        let localUrl: string | null = null;

        setSignature1Loading(true);
        superAdminService
            .getCertificateSignature1Blob()
            .then((blob) => {
                if (cancelled) return;
                if (blob) {
                    localUrl = URL.createObjectURL(blob);
                    setSignature1Url(localUrl);
                } else {
                    setSignature1Url(null);
                }
            })
            .catch(() => setSignature1Url(null))
            .finally(() => !cancelled && setSignature1Loading(false));

        return () => {
            cancelled = true;
            if (localUrl) URL.revokeObjectURL(localUrl);
        };
    }, [settings?.hasSignature1]);

    useEffect(() => {
        let cancelled = false;
        let localUrl: string | null = null;

        setSignature2Loading(true);
        superAdminService
            .getCertificateSignature2Blob()
            .then((blob) => {
                if (cancelled) return;
                if (blob) {
                    localUrl = URL.createObjectURL(blob);
                    setSignature2Url(localUrl);
                } else {
                    setSignature2Url(null);
                }
            })
            .catch(() => setSignature2Url(null))
            .finally(() => !cancelled && setSignature2Loading(false));

        return () => {
            cancelled = true;
            if (localUrl) URL.revokeObjectURL(localUrl);
        };
    }, [settings?.hasSignature2]);

    useEffect(() => {
        return () => {
            if (pendingPreview1) URL.revokeObjectURL(pendingPreview1);
        };
    }, [pendingPreview1]);

    useEffect(() => {
        return () => {
            if (pendingPreview2) URL.revokeObjectURL(pendingPreview2);
        };
    }, [pendingPreview2]);

    const validateAndStage = (file: File | null, setFile: (f: File | null) => void, setPreview: (u: string | null) => void) => {
        if (!file) return;
        if (!["image/png", "image/jpeg"].includes(file.type)) {
            toast.error("Signature must be a PNG or JPEG image");
            return;
        }
        setFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSaveDetails = () => {
        if (!signature1Name.trim() || !signature1Title.trim() || !signature2Name.trim() || !signature2Title.trim() || !trainingDuration.trim()) {
            toast.error("All fields are required");
            return;
        }
        updateDetails.mutate(
            {
                signature1Name: signature1Name.trim(),
                signature1Title: signature1Title.trim(),
                signature2Name: signature2Name.trim(),
                signature2Title: signature2Title.trim(),
                trainingDuration: trainingDuration.trim(),
            },
            {
                onSuccess: () => toast.success("Certificate settings updated — will apply to newly issued certificates"),
                onError: (error) => toast.error(getApiErrorMessage(error, "Failed to update certificate settings")),
            },
        );
    };

    const handleUploadSignature1 = () => {
        if (!pendingFile1) return;
        updateSignature1.mutate(pendingFile1, {
            onSuccess: () => {
                toast.success("Signature updated — will apply to newly issued certificates");
                setPendingFile1(null);
                setPendingPreview1(null);
            },
            onError: (error) => toast.error(getApiErrorMessage(error, "Failed to update signature")),
        });
    };

    const handleUploadSignature2 = () => {
        if (!pendingFile2) return;
        updateSignature2.mutate(pendingFile2, {
            onSuccess: () => {
                toast.success("Signature updated — will apply to newly issued certificates");
                setPendingFile2(null);
                setPendingPreview2(null);
            },
            onError: (error) => toast.error(getApiErrorMessage(error, "Failed to update signature")),
        });
    };

    return (
        <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardHeader className="border-b border-border/40 bg-primary/5">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-2xl font-bold alumni-sans-title flex items-center gap-2">
                            <Award className="w-5 h-5 text-primary" />
                            Certificate Template
                        </CardTitle>
                        <CardDescription>Manage the Soft Skills Training certificate's two signatories and training duration</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-3 py-12">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground animate-pulse">Loading certificate settings...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid md:grid-cols-2 gap-6">
                            <SignatureBlock
                                label="Signature 1 (left)"
                                name={signature1Name}
                                title={signature1Title}
                                onNameChange={setSignature1Name}
                                onTitleChange={setSignature1Title}
                                currentSignatureUrl={signature1Url}
                                currentSignatureLoading={signature1Loading}
                                onFileSelected={(f) => validateAndStage(f, setPendingFile1, setPendingPreview1)}
                                pendingPreviewUrl={pendingPreview1}
                                uploading={updateSignature1.isPending}
                                onUpload={handleUploadSignature1}
                                hasPendingFile={!!pendingFile1}
                            />
                            <SignatureBlock
                                label="Signature 2 (right)"
                                name={signature2Name}
                                title={signature2Title}
                                onNameChange={setSignature2Name}
                                onTitleChange={setSignature2Title}
                                currentSignatureUrl={signature2Url}
                                currentSignatureLoading={signature2Loading}
                                onFileSelected={(f) => validateAndStage(f, setPendingFile2, setPendingPreview2)}
                                pendingPreviewUrl={pendingPreview2}
                                uploading={updateSignature2.isPending}
                                onUpload={handleUploadSignature2}
                                hasPendingFile={!!pendingFile2}
                            />
                        </div>

                        <div className="space-y-2 max-w-sm">
                            <Label htmlFor="trainingDuration" className="text-lg alumni-sans-subtitle uppercase tracking-wider">
                                Training Duration
                            </Label>
                            <Input
                                id="trainingDuration"
                                value={trainingDuration}
                                onChange={(e) => setTrainingDuration(e.target.value)}
                                className="h-11 bg-white/50 border-border/60"
                                placeholder="e.g. 4 Hours"
                            />
                            <p className="text-[10px] text-muted-foreground italic">Shown on newly issued certificates.</p>
                        </div>

                        <Button
                            onClick={handleSaveDetails}
                            disabled={updateDetails.isPending}
                            variant="outline"
                            className="gap-2"
                        >
                            {updateDetails.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Details
                        </Button>
                    </>
                )}

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-4">
                    <Badge variant="outline" className="bg-white/50 shrink-0">Note</Badge>
                    <p className="text-xs text-amber-800 leading-relaxed">
                        Changing a signature, name/title, or training duration only affects <span className="underline italic">newly issued</span> certificates —
                        certificates already issued keep whatever was current at the time they were issued.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

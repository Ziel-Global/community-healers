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
    useUpdateCertificateDgName,
    useUpdateCertificateSignature,
} from "@/hooks/queries/useSuperAdminQueries";
import { superAdminService } from "@/services/superAdminService";
import { getApiErrorMessage } from "@/lib/errors";

export function CertificateTemplateForm() {
    const { data: settings, isLoading } = useCertificateSettings();
    const updateDgName = useUpdateCertificateDgName();
    const updateSignature = useUpdateCertificateSignature();

    const [dgName, setDgName] = useState("");
    const [signaturePreviewUrl, setSignaturePreviewUrl] = useState<string | null>(null);
    const [signaturePreviewLoading, setSignaturePreviewLoading] = useState(true);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (settings) setDgName(settings.dgName);
    }, [settings]);

    // Load the current signature image as a blob preview once, and whenever a new one is saved.
    useEffect(() => {
        let cancelled = false;
        let localUrl: string | null = null;

        setSignaturePreviewLoading(true);
        superAdminService
            .getCertificateSignatureBlob()
            .then((blob) => {
                if (cancelled) return;
                if (blob) {
                    localUrl = URL.createObjectURL(blob);
                    setSignaturePreviewUrl(localUrl);
                } else {
                    setSignaturePreviewUrl(null);
                }
            })
            .catch(() => setSignaturePreviewUrl(null))
            .finally(() => !cancelled && setSignaturePreviewLoading(false));

        return () => {
            cancelled = true;
            if (localUrl) URL.revokeObjectURL(localUrl);
        };
    }, [settings?.hasSignature]);

    useEffect(() => {
        return () => {
            if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
        };
    }, [pendingPreviewUrl]);

    const handleFileSelected = (file: File | null) => {
        if (!file) return;
        if (!["image/png", "image/jpeg"].includes(file.type)) {
            toast.error("Signature must be a PNG or JPEG image");
            return;
        }
        setPendingFile(file);
        setPendingPreviewUrl(URL.createObjectURL(file));
    };

    const handleSaveDgName = () => {
        if (!dgName.trim()) return;
        updateDgName.mutate(dgName.trim(), {
            onSuccess: () => toast.success("DG name updated — will apply to newly issued certificates"),
            onError: (error) => toast.error(getApiErrorMessage(error, "Failed to update DG name")),
        });
    };

    const handleUploadSignature = () => {
        if (!pendingFile) return;
        updateSignature.mutate(pendingFile, {
            onSuccess: () => {
                toast.success("Signature updated — will apply to newly issued certificates");
                setPendingFile(null);
                setPendingPreviewUrl(null);
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
                        <CardDescription>Manage the Director General's signature shown on issued certificates</CardDescription>
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
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="dgName" className="text-lg alumni-sans-subtitle uppercase tracking-wider">DG Name</Label>
                                <Input
                                    id="dgName"
                                    value={dgName}
                                    onChange={(e) => setDgName(e.target.value)}
                                    className="h-11 bg-white/50 border-border/60"
                                />
                                <p className="text-[10px] text-muted-foreground italic">Shown under the signature on newly issued certificates.</p>
                                <Button
                                    onClick={handleSaveDgName}
                                    disabled={updateDgName.isPending || !dgName.trim()}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    {updateDgName.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Name
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-lg alumni-sans-subtitle uppercase tracking-wider">Signature Image</Label>

                            <div className="h-28 rounded-xl border border-dashed border-border/60 bg-white/50 flex items-center justify-center overflow-hidden">
                                {pendingPreviewUrl ? (
                                    <img src={pendingPreviewUrl} alt="New signature preview" className="max-h-20 max-w-[85%] object-contain" />
                                ) : signaturePreviewLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                ) : signaturePreviewUrl ? (
                                    <img src={signaturePreviewUrl} alt="Current signature" className="max-h-20 max-w-[85%] object-contain" />
                                ) : (
                                    <div className="text-center text-muted-foreground text-xs flex flex-col items-center gap-1.5">
                                        <PenTool className="w-5 h-5" />
                                        No signature set yet
                                    </div>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg"
                                className="hidden"
                                onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
                            />
                            <div className="flex gap-2">
                                <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="w-4 h-4" /> Choose Image
                                </Button>
                                <Button
                                    className="gradient-primary text-white gap-2"
                                    disabled={!pendingFile || updateSignature.isPending}
                                    onClick={handleUploadSignature}
                                >
                                    {updateSignature.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Signature
                                </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">PNG or JPEG, max 2MB. Transparent PNG recommended.</p>
                        </div>
                    </div>
                )}

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-4">
                    <Badge variant="outline" className="bg-white/50 shrink-0">Note</Badge>
                    <p className="text-xs text-amber-800 leading-relaxed">
                        Changing the DG name or signature only affects <span className="underline italic">newly issued</span> certificates —
                        certificates already issued keep the signature that was current at the time they were issued.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

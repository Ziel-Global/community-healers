import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BookOpen, GraduationCap, Upload, FileCheck, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface EducationDeclarationProps {
    candidateData: any;
}

export function EducationDeclaration({ candidateData }: EducationDeclarationProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [hasSixteenYears, setHasSixteenYears] = useState(false);
    const [isUploaded, setIsUploaded] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (candidateData) {
            setHasSixteenYears(candidateData.has16YearsEducation || false);

            const degreeDoc = candidateData.documents?.find((d: any) => d.type === 'degreeTranscript');
            if (degreeDoc && degreeDoc.fileUrl) {
                setIsUploaded(true);
                setUploadedFileName(degreeDoc.fileUrl.split('/').pop() || "Uploaded");
            }
        } else {
            const saved = localStorage.getItem("has16YearsEducation") === "true";
            setHasSixteenYears(saved);
        }
    }, [candidateData]);

    const handleToggle = (value: boolean) => {
        setHasSixteenYears(value);
        localStorage.setItem("has16YearsEducation", String(value));
    };

    const handleFileSelect = async (file: File | null) => {
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: t('documents.uploadFailed'),
                description: t('documents.maxSize'),
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'degreeTranscript');

            await api.post('/candidates/me/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setIsUploaded(true);
            setUploadedFileName(file.name);
            toast({
                title: t('documents.uploadSuccess'),
                description: `${file.name}`,
            });
        } catch (error: any) {
            toast({
                title: t('documents.uploadFailed'),
                description: error.response?.data?.message || t('documents.uploadFailed'),
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="alumni-sans-title">{t('education.title')}</CardTitle>
                        <CardDescription>{t('education.description')}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/40">
                    <div className="space-y-1">
                        <Label htmlFor="education-switch" className="text-base font-semibold">{t('education.has16Years')}</Label>
                        <p className="text-sm text-muted-foreground">{t('education.description')}</p>
                    </div>
                    <Switch
                        id="education-switch"
                        checked={hasSixteenYears}
                        onCheckedChange={handleToggle}
                    />
                </div>

                {hasSixteenYears && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-2 text-primary">
                            <GraduationCap className="w-5 h-5" />
                            <h4 className="font-semibold">{t('education.transcriptTitle')}</h4>
                        </div>

                        <div
                            className={cn(
                                "p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center space-y-4 transition-colors",
                                isUploaded ? "bg-success/5 border-success/30" : "bg-secondary/10 border-border/60 hover:border-primary/40"
                            )}
                        >
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    <p className="text-sm text-muted-foreground">{t('education.uploading')}</p>
                                </div>
                            ) : isUploaded ? (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center">
                                        <FileCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{t('education.transcriptTitle')}</p>
                                        <p className="text-sm text-muted-foreground">{uploadedFileName}</p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => { setIsUploaded(false); setUploadedFileName(""); }}>{t('documents.removeFile')}</Button>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{t('education.uploadTranscript')}</p>
                                        <p className="text-sm text-muted-foreground">{t('education.transcriptDesc')}</p>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="application/pdf,image/*"
                                        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                                    />
                                    <Button className="gradient-primary text-white" onClick={() => fileInputRef.current?.click()}>{t('documents.uploadButton')}</Button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
                    <Info className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('education.description')}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

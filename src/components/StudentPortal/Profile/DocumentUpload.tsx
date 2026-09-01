import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileCheck, X, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUploadDocument } from "@/hooks/queries/useCandidateQueries";
import { getApiErrorMessage } from "@/lib/errors";
import { DOCUMENT_ERROR_CODES, DocumentType, documentMetadataSchema } from "@/schemas/documentSchemas";

interface Document {
    id: string;
    nameKey: string;
    type: string;
    isMandatory: boolean;
    /** Counts toward identity: CNIC front+back OR visa */
    identityOption?: boolean;
    status: "pending" | "uploading" | "complete" | "error";
    fileName?: string;
    fileType?: string;
    fileUrl?: string;
}

const initialDocuments: Document[] = [
    { id: "photo", nameKey: "documents.candidatePhoto", type: "Image", isMandatory: true, status: "pending" },
    { id: "passport", nameKey: "documents.passport", type: "Image/PDF", isMandatory: true, status: "pending" },
    { id: "visa", nameKey: "documents.visa", type: "Image/PDF", isMandatory: false, identityOption: true, status: "pending" },
    { id: "cnicFront", nameKey: "documents.cnicFront", type: "Image/PDF", isMandatory: false, identityOption: true, status: "pending" },
    { id: "cnicBack", nameKey: "documents.cnicBack", type: "Image/PDF", isMandatory: false, identityOption: true, status: "pending" },
];

interface DocumentUploadProps {
    candidateData: any;
}

export function DocumentUpload({ candidateData }: DocumentUploadProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [documents, setDocuments] = useState<Document[]>(initialDocuments);
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const uploadDocumentMutation = useUploadDocument();

    useEffect(() => {
        if (candidateData && candidateData.documents) {
            const apiDocs = candidateData.documents;

            setDocuments(prev => prev.map(doc => {
                const uploadedDoc = apiDocs.find((d: any) => d.type === doc.id);

                if (uploadedDoc) {
                    const isComplete = !!uploadedDoc.fileUrl;

                    return {
                        ...doc,
                        status: isComplete ? "complete" : "pending",
                        // fileUrl is a backend download route now, not a filename-bearing
                        // path (e.g. /candidates/me/documents/photo/download) — there's
                        // no real filename left to parse out of it, so show a status
                        // label on reload instead of the literal word "download".
                        fileName: uploadedDoc.fileUrl ? t('profile.uploaded') : undefined,
                        fileUrl: uploadedDoc.fileUrl
                    };
                }
                return doc;
            }));
        }
    }, [candidateData]);

    const handleFileSelect = async (docId: string, file: File | null) => {
        if (!file) return;

        const validation = documentMetadataSchema.safeParse({ type: docId as DocumentType, file });
        if (!validation.success) {
            const code = validation.error.issues[0].message;
            const description =
                code === DOCUMENT_ERROR_CODES.UNSUPPORTED_TYPE
                    ? t('documents.unsupportedFileType') || "This file type isn't supported. Please upload an image or PDF."
                    : t('documents.maxSize');
            toast({
                title: t('documents.uploadFailed'),
                description,
                variant: "destructive",
            });
            return;
        }

        setDocuments(prev => prev.map(doc =>
            doc.id === docId
                ? { ...doc, status: "uploading" as const }
                : doc
        ));

        uploadDocumentMutation.mutate(
            { type: docId, file },
            {
                onSuccess: (uploadedDoc) => {
                    setDocuments(prev => prev.map(doc =>
                        doc.id === docId
                            ? {
                                ...doc,
                                status: "complete" as const,
                                fileName: file.name,
                                fileType: file.type,
                                fileUrl: uploadedDoc?.url
                            }
                            : doc
                    ));

                    toast({
                        title: t('documents.uploadSuccess'),
                        description: `${file.name}`,
                    });
                },
                onError: (error) => {
                    setDocuments(prev => prev.map(doc =>
                        doc.id === docId
                            ? { ...doc, status: "error" as const }
                            : doc
                    ));

                    toast({
                        title: t('documents.uploadFailed'),
                        description: getApiErrorMessage(error, t('documents.uploadFailed')),
                        variant: "destructive",
                    });
                },
            },
        );
    };

    const handleRemoveFile = (docId: string) => {
        const updatedDocs = documents.map(doc =>
            doc.id === docId
                ? { ...doc, status: "pending" as const, fileName: undefined, fileUrl: undefined }
                : doc
        );
        setDocuments(updatedDocs);

        toast({
            title: t('documents.removeFailed'),
            description: t('documents.removeFailed'),
        });
    };

    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="alumni-sans-title">{t('documents.title')}</CardTitle>
                        <CardDescription>{t('documents.description')}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm text-foreground/90 space-y-1">
                        <p className="font-semibold">{t('documents.identityRequirementTitle')}</p>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                            {t('documents.identityRequirementDesc')}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className={cn(
                                "p-4 rounded-xl border transition-all flex items-center justify-between",
                                doc.status === "complete" ? "bg-success/5 border-success/20" :
                                    doc.status === "uploading" ? "bg-primary/5 border-primary/20" :
                                        "bg-card border-border/60"
                            )}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                    doc.status === "complete" ? "bg-success/10 text-success" :
                                        doc.status === "uploading" ? "bg-primary/10 text-primary" :
                                            "bg-secondary text-muted-foreground"
                                )}>
                                    {doc.status === "complete" ? (
                                        <FileCheck className="w-5 h-5" />
                                    ) : doc.status === "uploading" ? (
                                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                    ) : (
                                        <FileText className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-semibold text-foreground">{t(doc.nameKey)}</p>
                                        {doc.isMandatory && (
                                            <span className="text-[10px] font-bold text-destructive uppercase">
                                                {t('documents.mandatoryLabel')}
                                            </span>
                                        )}
                                        {!doc.isMandatory && doc.identityOption && (
                                            <span className="text-[10px] font-bold text-primary uppercase">
                                                {t('documents.identityOptionLabel')}
                                            </span>
                                        )}
                                        {!doc.isMandatory && !doc.identityOption && (
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                                {t('documents.optionalLabel')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {doc.status === "complete" ? doc.fileName :
                                            doc.status === "uploading" ? t('documents.uploading') :
                                                `${t('profile.format')}: ${doc.type}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                {doc.status === "complete" ? (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleRemoveFile(doc.id)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <>
                                        <input
                                            type="file"
                                            ref={el => fileInputRefs.current[doc.id] = el}
                                            className="hidden"
                                            accept={doc.id === 'photo' ? 'image/jpeg,image/png' : 'image/*,application/pdf'}
                                            onChange={(e) => handleFileSelect(doc.id, e.target.files?.[0] || null)}
                                        />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 gap-2"
                                            onClick={() => fileInputRefs.current[doc.id]?.click()}
                                            disabled={doc.status === "uploading"}
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                            {doc.status === "uploading" ? t('documents.uploading') : t('documents.uploadButton')}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex gap-3 mt-6">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                        {t('documents.dragDrop')}. {t('documents.maxSize')}.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

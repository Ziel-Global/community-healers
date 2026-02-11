import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileCheck, X, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

interface Document {
    id: string;
    name: string;
    type: string;
    isMandatory: boolean;
    status: "pending" | "uploading" | "complete" | "error";
    fileName?: string;
    fileType?: string; // MIME type
    fileUrl?: string;
}

const initialDocuments: Document[] = [
    { id: "photo", name: "Candidate Photo", type: "Image", isMandatory: true, status: "pending" },
    { id: "cnicFront", name: "CNIC Front", type: "Image/PDF", isMandatory: true, status: "pending" },
    { id: "cnicBack", name: "CNIC Back", type: "Image/PDF", isMandatory: true, status: "pending" },
    { id: "policeClearance", name: "Police Clearance Certificate", type: "PDF", isMandatory: true, status: "pending" },
    { id: "medicalCertificate", name: "Medical Certificate", type: "PDF", isMandatory: true, status: "pending" },
    { id: "passport", name: "Passport", type: "PDF", isMandatory: false, status: "pending" },
];

interface DocumentUploadProps {
    candidateData: any;
}

export function DocumentUpload({ candidateData }: DocumentUploadProps) {
    const { toast } = useToast();
    const [documents, setDocuments] = useState<Document[]>(initialDocuments);
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    useEffect(() => {
        if (candidateData && candidateData.documents) {
            const apiDocs = candidateData.documents;

            setDocuments(prev => prev.map(doc => {
                const uploadedDoc = apiDocs.find((d: any) => d.type === doc.id);

                if (uploadedDoc) {
                    // Check if fileUrl exists
                    const isComplete = !!uploadedDoc.fileUrl;

                    return {
                        ...doc,
                        status: isComplete ? "complete" : "pending",
                        fileName: uploadedDoc.fileUrl ? uploadedDoc.fileUrl.split('/').pop() : undefined,
                        fileUrl: uploadedDoc.fileUrl
                    };
                }
                return doc;
            }));
        }
    }, [candidateData]);

    const handleFileSelect = async (docId: string, file: File | null) => {
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File Too Large",
                description: "File size must be less than 5MB.",
                variant: "destructive",
            });
            return;
        }

        // Update document status to uploading
        setDocuments(prev => prev.map(doc =>
            doc.id === docId
                ? { ...doc, status: "uploading" as const }
                : doc
        ));

        try {
            // Upload document via API
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', docId);

            const response = await api.post('/candidates/me/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // If API returns the created document object in response, use it. 
            // Otherwise, construct it optimistically or trigger a page refresh.
            // Assuming response.data.data is the document object or similar.
            // For safety/simplicity in this refactor without changing parent, we can just set it as complete with the file details we have + URL from response if available.

            const uploadedDoc = response.data.data; // Adjust based on actual API response if known, else use pessimistic reload or optimistic update

            setDocuments(prev => prev.map(doc =>
                doc.id === docId
                    ? {
                        ...doc,
                        status: "complete" as const,
                        fileName: file.name,
                        fileType: file.type,
                        fileUrl: uploadedDoc?.fileUrl // Capture URL if returned
                    }
                    : doc
            ));

            // Optional: Reload page or notify parent to refetch if needed to persist across components immediately
            // window.location.reload(); // Too aggressive
            // For now, this local update satisfies the UI feedback requirement.

            toast({
                title: "Upload Successful",
                description: `${file.name} has been uploaded successfully.`,
            });
        } catch (error: any) {
            setDocuments(prev => prev.map(doc =>
                doc.id === docId
                    ? { ...doc, status: "error" as const }
                    : doc
            ));

            toast({
                title: "Upload Failed",
                description: error.response?.data?.message || "Failed to upload document. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleRemoveFile = (docId: string) => {
        // ideally we should also call API to delete, but for now just update local state
        // or re-fetch to see if it was actually removed (if the user requested deletion logic)
        // given the current scope, I'll just reset the status
        const updatedDocs = documents.map(doc =>
            doc.id === docId
                ? { ...doc, status: "pending" as const, fileName: undefined, fileUrl: undefined }
                : doc
        );
        setDocuments(updatedDocs);

        toast({
            title: "Document Removed",
            description: "Document has been removed from view. (Note: This does not delete from server yet)",
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
                        <CardTitle className="alumni-sans-title">Document Upload</CardTitle>
                        <CardDescription>Upload high-quality scans of your original documents</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center",
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
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-foreground">{doc.name}</p>
                                        {doc.isMandatory && <span className="text-[10px] font-bold text-destructive uppercase">Mandatory</span>}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {doc.status === "complete" ? doc.fileName :
                                            doc.status === "uploading" ? "Uploading..." :
                                                `Format: ${doc.type}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
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
                                            accept={doc.type.includes('Image') ? 'image/*' : 'application/pdf'}
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
                                            {doc.status === "uploading" ? "Uploading..." : "Upload"}
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
                        Please ensure all documents are clearly legible. Blurry or incorrect documents may lead to registration rejection. Max file size: 5MB.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

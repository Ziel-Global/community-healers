import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileCheck, X, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Document {
    id: string;
    name: string;
    type: string;
    isMandatory: boolean;
    status: "pending" | "uploading" | "complete" | "error";
    fileName?: string;
    fileData?: string; // Base64 encoded file data
    fileType?: string; // MIME type
}

const initialDocuments: Document[] = [
    { id: "1", name: "Candidate Photo", type: "Image", isMandatory: true, status: "pending" },
    { id: "2", name: "CNIC Front", type: "Image/PDF", isMandatory: true, status: "pending" },
    { id: "3", name: "CNIC Back", type: "Image/PDF", isMandatory: true, status: "pending" },
    { id: "4", name: "Police Clearance Certificate", type: "PDF", isMandatory: true, status: "pending" },
    { id: "5", name: "Medical Certificate", type: "PDF", isMandatory: true, status: "pending" },
    { id: "6", name: "Passport", type: "PDF", isMandatory: false, status: "pending" },
];

export function DocumentUpload() {
    const { toast } = useToast();
    const [documents, setDocuments] = useState<Document[]>(initialDocuments);
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    // Load saved documents from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("candidateDocuments");
        if (saved) {
            setDocuments(JSON.parse(saved));
        }
    }, []);

    const handleFileSelect = (docId: string, file: File | null) => {
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

        // Read file as base64
        const reader = new FileReader();
        reader.onload = () => {
            const base64Data = reader.result as string;
            
            // Simulate upload delay
            setTimeout(() => {
                setDocuments(prev => {
                    const updatedDocs = prev.map(doc => 
                        doc.id === docId 
                            ? { 
                                ...doc, 
                                status: "complete" as const, 
                                fileName: file.name,
                                fileData: base64Data,
                                fileType: file.type
                              } 
                            : doc
                    );
                    localStorage.setItem("candidateDocuments", JSON.stringify(updatedDocs));
                    return updatedDocs;
                });
                
                toast({
                    title: "Upload Successful",
                    description: `${file.name} has been uploaded successfully.`,
                });
            }, 1000);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveFile = (docId: string) => {
        const updatedDocs = documents.map(doc => 
            doc.id === docId 
                ? { ...doc, status: "pending" as const, fileName: undefined } 
                : doc
        );
        setDocuments(updatedDocs);
        localStorage.setItem("candidateDocuments", JSON.stringify(updatedDocs));
        
        toast({
            title: "Document Removed",
            description: "Document has been removed successfully.",
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

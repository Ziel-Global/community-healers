import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileCheck, X, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Document {
    id: string;
    name: string;
    type: string;
    isMandatory: boolean;
    status: "pending" | "uploading" | "complete" | "error";
    fileName?: string;
}

const documents: Document[] = [
    { id: "1", name: "Candidate Photo", type: "Image", isMandatory: true, status: "complete", fileName: "photo.jpg" },
    { id: "2", name: "CNIC Front", type: "Image/PDF", isMandatory: true, status: "pending" },
    { id: "3", name: "CNIC Back", type: "Image/PDF", isMandatory: true, status: "pending" },
    { id: "4", name: "Police Clearance Certificate", type: "PDF", isMandatory: true, status: "pending" },
    { id: "5", name: "Medical Certificate", type: "PDF", isMandatory: true, status: "pending" },
    { id: "6", name: "Passport", type: "PDF", isMandatory: false, status: "pending" },
];

export function DocumentUpload() {
    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle>Document Upload</CardTitle>
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
                                doc.status === "complete" ? "bg-success/5 border-success/20" : "bg-card border-border/60"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                    doc.status === "complete" ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"
                                )}>
                                    {doc.status === "complete" ? <FileCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-foreground">{doc.name}</p>
                                        {doc.isMandatory && <span className="text-[10px] font-bold text-destructive uppercase">Mandatory</span>}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {doc.status === "complete" ? doc.fileName : `Format: ${doc.type}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {doc.status === "complete" ? (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                        <X className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button size="sm" variant="outline" className="h-8 gap-2">
                                        <Upload className="w-3.5 h-3.5" />
                                        Upload
                                    </Button>
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

                <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                    <Button variant="outline">Previous</Button>
                    <Button className="gradient-primary text-white px-8">Next Step</Button>
                </div>
            </CardContent>
        </Card>
    );
}

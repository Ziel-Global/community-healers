import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { getApiErrorMessage } from "@/lib/errors";

interface CertificatePreviewCardProps {
    certNumber: string;
    issuedDate: string;
    score: number | string;
    candidateName?: string;
    fetchPdf: () => Promise<Blob>;
}

export function CertificatePreviewCard({ certNumber, issuedDate, score, candidateName, fetchPdf }: CertificatePreviewCardProps) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        let localUrl: string | null = null;

        setLoading(true);
        setError(null);
        fetchPdf()
            .then((blob) => {
                if (cancelled) return;
                localUrl = URL.createObjectURL(blob);
                setBlobUrl(localUrl);
            })
            .catch((err) => {
                if (!cancelled) setError(getApiErrorMessage(err, "Failed to load certificate"));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
            if (localUrl) URL.revokeObjectURL(localUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [certNumber]);

    const handleDownload = () => {
        if (!blobUrl) return;
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `certificate-${certNumber}.pdf`;
        a.click();
    };

    return (
        <Card className="border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md border border-primary/10">
                        <Award className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-display font-bold">
                            {candidateName ?? "Certification Document"}
                        </CardTitle>
                        <CardDescription>View and download the official certificate</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
                <div className="grid lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 aspect-[1.414/1] bg-white border-4 border-border/30 rounded-lg shadow-xl overflow-hidden relative">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-secondary/10">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : error ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary/10 p-6 text-center">
                                <AlertCircle className="w-8 h-8 text-destructive" />
                                <p className="text-sm text-muted-foreground">{error}</p>
                            </div>
                        ) : (
                            <iframe title={`Certificate ${certNumber}`} src={blobUrl ?? undefined} className="w-full h-full border-0" />
                        )}
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-2">
                            <Badge variant="success" className="px-3">Verified</Badge>
                            <h3 className="text-xl font-display font-bold text-foreground">Community Healers Certification</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl border border-border/40 bg-secondary/30">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Certificate #</p>
                                <p className="font-mono font-bold text-foreground text-sm tracking-tighter">{certNumber}</p>
                            </div>
                            <div className="p-3 rounded-xl border border-border/40 bg-secondary/30">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Score</p>
                                <p className="font-bold text-foreground text-sm">{Number(score).toFixed(2)}%</p>
                            </div>
                            <div className="p-3 rounded-xl border border-border/40 bg-secondary/30 col-span-2">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Issued</p>
                                <p className="font-bold text-foreground text-sm">
                                    {new Date(issuedDate).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                className="h-11 gradient-primary text-white font-bold gap-2"
                                disabled={!blobUrl}
                                onClick={handleDownload}
                            >
                                <Download className="w-4 h-4" /> Download PDF
                            </Button>
                            <Button
                                variant="outline"
                                className="h-11 gap-2"
                                disabled={!blobUrl}
                                onClick={() => blobUrl && window.open(blobUrl, "_blank")}
                            >
                                <ExternalLink className="w-4 h-4" /> Open in New Tab
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

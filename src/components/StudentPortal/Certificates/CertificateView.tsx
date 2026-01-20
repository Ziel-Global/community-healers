import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Download, ShieldCheck, QrCode, ExternalLink, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

interface CertificateProps {
    isIssued: boolean;
    certNumber?: string;
    issueDate?: string;
}

export function CertificateView({ isIssued, certNumber, issueDate }: CertificateProps) {
    return (
        <Card className="border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-royal-500/5 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md border border-primary/10">
                        <Award className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-display font-bold">Certification Document</CardTitle>
                        <CardDescription>View and download your official certificate</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                {!isIssued ? (
                    <div className="text-center space-y-6 py-10">
                        <div className="w-24 h-24 rounded-full bg-secondary/30 flex items-center justify-center mx-auto grayscale opacity-40">
                            <Award className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-foreground">Certificate Pending</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                Your certificate will be generated automatically once the ministry verifies your exam results.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-5 gap-8">
                        {/* Certificate Preview Placeholder */}
                        <div className="lg:col-span-2 aspect-[1/1.414] bg-white border-8 border-royal-900/5 rounded-sm shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                            <div className="absolute inset-4 border-2 border-royal-700/20 flex flex-col items-center justify-center p-6 text-center">
                                <ShieldCheck className="w-16 h-16 text-royal-700/30 mb-8" />
                                <div className="space-y-4">
                                    <div className="w-24 h-1 bg-royal-700/20 mx-auto" />
                                    <p className="text-[8px] font-display font-bold text-royal-900/40 uppercase tracking-widest">Certificate of Achievement</p>
                                    <p className="text-sm font-display font-bold text-royal-900/60 pb-4">MUHAMMAD AHMED</p>
                                    <div className="w-16 h-16 border border-royal-700/10 mx-auto flex items-center justify-center">
                                        <QrCode className="w-8 h-8 text-royal-700/20" />
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-royal-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <Button variant="outline" className="bg-white text-royal-900 border-none hover:bg-white/90">
                                    <ExternalLink className="w-4 h-4 mr-2" /> Full View
                                </Button>
                            </div>
                        </div>

                        {/* Certificate Details */}
                        <div className="lg:col-span-3 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Badge variant="success" className="px-3">Verified by Ministry</Badge>
                                    <span className="text-xs text-muted-foreground">Issued on {issueDate}</span>
                                </div>
                                <h3 className="text-2xl font-display font-bold text-foreground">Professional CBT Certification</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    This document certifies that the candidate has successfully completed the required training and passed the examination with requisite standards.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl border border-border/40 bg-secondary/30">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Certificate #</p>
                                    <p className="font-mono font-bold text-foreground tracking-tighter">{certNumber}</p>
                                </div>
                                <div className="p-4 rounded-xl border border-border/40 bg-secondary/30">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Validity</p>
                                    <p className="font-bold text-foreground">Lifetime</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-6">
                                <Button className="flex-1 h-12 gradient-primary text-white font-bold gap-2 shadow-royal">
                                    <Download className="w-4 h-4" /> Download Secure PDF
                                </Button>
                                <Button variant="outline" className="flex-1 h-12 gap-2">
                                    <Printer className="w-4 h-4" /> Print Certificate
                                </Button>
                            </div>

                            <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                                <QrCode className="w-3.5 h-3.5" />
                                Scan QR on certificate for instant online verification
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

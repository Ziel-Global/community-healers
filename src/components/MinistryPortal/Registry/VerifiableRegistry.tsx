import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ShieldCheck, Download, History, QrCode, UserCheck, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";

const registeredCerts = [
    { certNo: "CP-2024-8842", name: "Ahmed Ali", cnic: "42101-XXXXXXX-1", issuedAt: "Jan 19, 2024", authority: "Ministry User 01" },
    { certNo: "CP-2024-8841", name: "Sara Fatima", cnic: "35201-XXXXXXX-2", issuedAt: "Jan 19, 2024", authority: "Supervisor Root" },
];

export function VerifiableRegistry() {
    return (
        <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
            <div className="bg-secondary/40 p-6 border-b border-border/40 space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-lg alumni-sans-subtitle text-foreground uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Certification Registry (Global)
                    </h4>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] font-bold uppercase tracking-tight">System Validated</Badge>
                </div>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by Certificate # or CNIC..."
                        className="pl-12 h-11 bg-white/80 border-border/60 focus:border-primary/40 rounded-xl shadow-inner"
                    />
                </div>
            </div>

            <div className="divide-y divide-border/30">
                {registeredCerts.map((cert) => (
                    <div key={cert.certNo} className="p-5 hover:bg-primary/5 transition-colors group flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                            <QrCode className="w-6 h-6 text-indigo-500" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="alumni-sans-subtitle text-foreground text-sm font-mono tracking-tight">{cert.certNo}</span>
                                <Badge variant="outline" className="text-[8px] uppercase font-bold tracking-tight h-3.5 px-1 bg-white/50">Official Registry Entry</Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                                <p className="text-xs text-foreground alumni-sans-subtitle flex items-center gap-1.5">
                                    <UserCheck className="w-3.5 h-3.5 text-muted-foreground" /> {cert.name}
                                </p>
                                <span className="text-muted-foreground/30 text-[10px]">|</span>
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 uppercase font-medium">
                                    <History className="w-3 h-3" /> Issued {cert.issuedAt}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                            <Button variant="outline" size="sm" className="h-9 px-3 rounded-lg bg-white border-border/60 hover:text-primary gap-2">
                                <Download className="w-3.5 h-3.5" />
                                PDF
                            </Button>
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-white border border-transparent hover:border-border/40">
                                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-secondary/10 border-t border-border/40 text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Public verification enabled via QR Code / Link</p>
            </div>
        </Card>
    );
}

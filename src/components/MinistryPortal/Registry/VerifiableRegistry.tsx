import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ShieldCheck, Download, History, QrCode, UserCheck, ExternalLink, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { toast } from "sonner";

interface CertificateRegistry {
    id: string;
    certificateNumber: string;
    issuedDate: string;
    status: string;
    score: string;
    candidateId: string;
    candidateName: string;
    cnic: string;
    city: string;
    email: string;
}

export function VerifiableRegistry() {
    const [certificates, setCertificates] = useState<CertificateRegistry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchCertificates = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/ministry/certificates/registry');
                const certificatesData: CertificateRegistry[] = response.data.data.data;
                setCertificates(certificatesData);
            } catch (error) {
                console.error("Failed to fetch certificates:", error);
                toast.error("Failed to load certificate registry");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCertificates();
    }, []);

    const filteredCertificates = certificates.filter(cert => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            cert.certificateNumber.toLowerCase().includes(query) ||
            cert.cnic.toLowerCase().includes(query) ||
            cert.candidateName.toLowerCase().includes(query) ||
            cert.email.toLowerCase().includes(query)
        );
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

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
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">Loading registry...</p>
                </div>
            ) : filteredCertificates.length === 0 ? (
                <div className="p-12 text-center">
                    <ShieldCheck className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                        {searchQuery ? "No certificates found matching your search" : "No certificates in registry"}
                    </p>
                    {searchQuery && (
                        <Button
                            variant="link"
                            className="mt-2"
                            onClick={() => setSearchQuery("")}
                        >
                            Clear search
                        </Button>
                    )}
                </div>
            ) : (
                <div className="divide-y divide-border/30">
                    {filteredCertificates.map((cert) => (
                        <div key={cert.id} className="p-5 hover:bg-primary/5 transition-colors group flex items-center gap-6">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                                <QrCode className="w-6 h-6 text-indigo-500" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="alumni-sans-subtitle text-foreground text-sm font-mono tracking-tight">{cert.certificateNumber}</span>
                                    <Badge 
                                        variant="outline" 
                                        className={`text-[8px] uppercase font-bold tracking-tight h-3.5 px-1 ${
                                            cert.status === 'ACTIVE' 
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                                : 'bg-white/50'
                                        }`}
                                    >
                                        {cert.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 mt-2">
                                    <p className="text-xs text-foreground alumni-sans-subtitle flex items-center gap-1.5">
                                        <UserCheck className="w-3.5 h-3.5 text-muted-foreground" /> {cert.candidateName}
                                    </p>
                                    <span className="text-muted-foreground/30 text-[10px]">|</span>
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-medium">
                                        CNIC: {cert.cnic}
                                    </p>
                                    <span className="text-muted-foreground/30 text-[10px]">|</span>
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                        <Award className="w-3 h-3" /> Score: {cert.score}%
                                    </p>
                                </div>
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 uppercase font-medium mt-1">
                                    <History className="w-3 h-3" /> Issued {formatDate(cert.issuedDate)}
                                </p>
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
            )}
            <div className="p-4 bg-secondary/10 border-t border-border/40 text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                    Public verification enabled via QR Code / Link • Total Certificates: {certificates.length}
                </p>
            </div>
        </Card>
    );
}

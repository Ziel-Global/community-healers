import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, FileSignature, CheckCircle2, AlertTriangle, Clock, User, Users } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";

interface IssuanceCandidate {
    certificateNumber: string;
    candidateId: string;
    candidateName: string;
    cnic: string;
    city: string;
    email: string;
    score: number;
}

interface IssuanceLog {
    id: string;
    issuedDate: string;
    issuedByUserId: string;
    issuedByName: string;
    notes: string;
    certificateNumber?: string;
    score?: number;
    candidateId?: string;
    candidateName?: string;
    cnic?: string;
    city?: string;
    email?: string;
    candidateCount?: number;
    candidates?: IssuanceCandidate[];
}

export function MinistryIssuanceLogs() {
    const [logs, setLogs] = useState<IssuanceLog[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/ministry/certificates/issuance-logs');
                const logsData: IssuanceLog[] = response.data.data.data;
                setLogs(logsData);
            } catch (error) {
                console.error("Failed to fetch issuance logs:", error);
                toast.error("Failed to load issuance logs");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    return (
        <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
            <div className="bg-secondary/40 p-4 border-b border-border/40 flex items-center justify-between">
                <h4 className="text-sm alumni-sans-subtitle text-foreground uppercase tracking-widest flex items-center gap-2">
                    <FileSignature className="w-4 h-4 text-primary" />
                    Issuance & Authority Trail
                </h4>
                <Badge variant="outline" className="bg-white/50 border-primary/20 text-primary uppercase text-[9px] font-bold">Authority Action Log</Badge>
            </div>
            {isLoading ? (
                <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">Loading logs...</p>
                </div>
            ) : logs.length === 0 ? (
                <div className="p-12 text-center">
                    <FileSignature className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No issuance logs found</p>
                </div>
            ) : (
                <div className="divide-y divide-border/30">
                    {logs.map((log) => {
                        const isBulk = log.candidateCount && log.candidateCount > 1;
                        const displayName = isBulk 
                            ? `${log.candidateCount} Candidates` 
                            : log.candidateName || "Unknown";
                        
                        return (
                            <div key={log.id} className="p-4 hover:bg-primary/5 transition-colors group">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-black/5 bg-primary/10 text-primary">
                                        {isBulk ? <Users className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="alumni-sans-subtitle text-foreground text-sm">
                                                {isBulk ? "Bulk Certificate Issuance" : "Certificate Issued"}
                                            </span>
                                            <Badge variant="success" className="text-[8px] uppercase font-bold tracking-tight h-3.5 px-1 pb-[1px]">
                                                Success
                                            </Badge>
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                <User className="w-3 h-3" /> {log.issuedByName}
                                                <span className="text-muted-foreground/30">•</span>
                                                Target: {displayName}
                                            </p>
                                            
                                            {!isBulk && log.certificateNumber && (
                                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <FileSignature className="w-3 h-3" />
                                                    {log.certificateNumber}
                                                    {log.score && (
                                                        <>
                                                            <span className="text-muted-foreground/30">•</span>
                                                            Score: {log.score}%
                                                        </>
                                                    )}
                                                </p>
                                            )}
                                        </div>

                                        {isBulk && log.candidates && log.candidates.length > 0 && (
                                            <div className="mt-3 space-y-2 bg-secondary/20 rounded-lg p-3">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Issued Certificates:</p>
                                                <div className="space-y-2">
                                                    {log.candidates.map((candidate) => (
                                                        <div key={candidate.candidateId} className="flex items-center justify-between text-xs bg-white/50 rounded p-2">
                                                            <div className="flex-1">
                                                                <p className="font-medium text-foreground">{candidate.candidateName}</p>
                                                                <p className="text-muted-foreground text-[10px] mt-0.5">
                                                                    {candidate.certificateNumber} • Score: {candidate.score}%
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-secondary/30 px-2 py-1 rounded-lg">
                                            <Clock className="w-3 h-3" />
                                            {getTimeAgo(log.issuedDate)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}

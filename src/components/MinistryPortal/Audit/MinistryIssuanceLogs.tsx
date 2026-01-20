import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, FileSignature, CheckCircle2, AlertTriangle, Clock, User } from "lucide-react";

const logs = [
    { id: 1, action: "Certificate Issued", candidate: "Ahmed Ali", authority: "Admin-Min-01", time: "5m ago", status: "Success" },
    { id: 2, action: "Bulk Approval Start", candidate: "25 Candidates", authority: "Supervisor-M", time: "22m ago", status: "Success" },
    { id: 3, action: "Issuance Error", candidate: "Zain Ali", authority: "Admin-Min-01", time: "1h ago", status: "Failed" },
    { id: 4, action: "Registry Sync", candidate: "System", authority: "Auto-Process", time: "2h ago", status: "Success" },
];

export function MinistryIssuanceLogs() {
    return (
        <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
            <div className="bg-secondary/40 p-4 border-b border-border/40 flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                    <FileSignature className="w-4 h-4 text-primary" />
                    Issuance & Authority Trail
                </h4>
                <Badge variant="outline" className="bg-white/50 border-primary/20 text-primary uppercase text-[9px] font-bold">Authority Action Log</Badge>
            </div>
            <div className="divide-y divide-border/30">
                {logs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-primary/5 transition-colors flex items-center gap-4 group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-black/5 ${log.status === 'Failed' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                            {log.status === 'Failed' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground text-sm">{log.action}</span>
                                <Badge variant={log.status === "Success" ? "success" : "destructive"} className="text-[8px] uppercase font-bold tracking-tight h-3.5 px-1 pb-[1px]">
                                    {log.status}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2 truncate">
                                <User className="w-3 h-3" /> {log.authority}
                                <span className="text-muted-foreground/30">•</span>
                                Target: {log.candidate}
                            </p>
                        </div>

                        <div className="text-right shrink-0">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-secondary/30 px-2 py-1 rounded-lg">
                                <Clock className="w-3 h-3" />
                                {log.time}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

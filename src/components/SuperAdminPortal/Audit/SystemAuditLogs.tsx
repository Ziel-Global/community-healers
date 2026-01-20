import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, User, Lock, FileText, Settings, ShieldCheck, Clock, ExternalLink } from "lucide-react";

const logs = [
    { id: 1, action: "Center Created", user: "Admin (Super)", target: "KHI-012", time: "2m ago", status: "Success", icon: ShieldCheck },
    { id: 2, action: "Config Updated", user: "Admin (Super)", target: "v2.4.0", time: "45m ago", status: "Success", icon: Settings },
    { id: 3, action: "Exam Unlocked", user: "M. Siddique", target: "REG-2024-001", time: "1h ago", status: "Success", icon: Lock },
    { id: 4, action: "Bank Purged", user: "Admin (Super)", target: "v2.3.9", time: "3h ago", status: "Warning", icon: History },
];

export function SystemAuditLogs() {
    return (
        <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
            <div className="bg-secondary/40 p-4 border-b border-border/40 flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                    <History className="w-4 h-4 text-primary" />
                    Global Activity Audit
                </h4>
                <Badge variant="outline" className="bg-white/50 border-primary/20 text-primary uppercase text-[9px] font-bold">Real-time Feed</Badge>
            </div>
            <div className="divide-y divide-border/30">
                {logs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-primary/5 transition-colors flex items-center gap-4 group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-black/5 group-hover:scale-105 transition-transform ${log.status === 'Warning' ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                            <log.icon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground text-sm leading-none">{log.action}</span>
                                <Badge variant={log.status === "Success" ? "success" : "secondary"} className="text-[8px] uppercase font-bold tracking-tight h-3.5 px-1 py-0 min-h-0">
                                    {log.status}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2 truncate">
                                <User className="w-3 h-3" /> {log.user}
                                <span className="text-muted-foreground/30">•</span>
                                <FileText className="w-3 h-3" /> Target: {log.target}
                            </p>
                        </div>

                        <div className="text-right shrink-0">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-secondary/50 px-2 py-1 rounded-lg">
                                <Clock className="w-3 h-3" />
                                {log.time}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-secondary/10 border-t border-border/40 text-center">
                <Button variant="ghost" size="sm" className="text-xs font-bold text-primary gap-2 h-8">
                    View All System Logs <ExternalLink className="w-3.5 h-3.5" />
                </Button>
            </div>
        </Card>
    );
}

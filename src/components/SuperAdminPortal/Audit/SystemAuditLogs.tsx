import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, User, FileText, Settings, ShieldCheck, Clock, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { superAdminService } from "@/services/superAdminService";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export function SystemAuditLogs() {
    const { data: logResponse, isLoading } = useQuery({
        queryKey: ["audit-logs"],
        queryFn: superAdminService.getAuditLogs,
    });

    const logs = logResponse?.data || [];

    const getIcon = (path: string) => {
        if (path.includes("center")) return ShieldCheck;
        if (path.includes("exam-settings")) return Settings;
        if (path.includes("question")) return FileText;
        return History;
    };

    return (
        <Card className="border-border/40 overflow-hidden bg-card/60 backdrop-blur-sm shadow-sm">
            <div className="bg-secondary/40 p-4 border-b border-border/40 flex items-center justify-between">
                <h4 className="text-lg font-bold text-foreground uppercase tracking-widest flex items-center gap-2 alumni-sans-title">
                    <History className="w-4 h-4 text-primary" />
                    Global Activity Audit
                </h4>
                <Badge variant="outline" className="bg-white/50 border-primary/20 text-primary uppercase text-[9px] font-bold">Real-time Feed</Badge>
            </div>
            <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="p-4 flex items-center gap-4">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))
                ) : logs.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground italic">
                        No activity logs found.
                    </div>
                ) : (
                    logs.map((log) => {
                        const Icon = getIcon(log.path);
                        return (
                            <div key={log.id} className="p-4 hover:bg-primary/5 transition-colors flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-black/5 group-hover:scale-105 transition-transform bg-primary/10 text-primary">
                                    <Icon className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="alumni-sans-subtitle text-foreground text-lg leading-none">{log.message}</span>
                                        <Badge variant={log.statusCode < 300 ? "success" : "secondary"} className="text-[8px] uppercase font-bold tracking-tight h-3.5 px-1 py-0 min-h-0">
                                            {log.statusCode < 300 ? "Success" : "Error"}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-2 truncate">
                                        <User className="w-3 h-3" /> System Admin
                                        <span className="text-muted-foreground/30">•</span>
                                        <FileText className="w-3 h-3" /> Path: {log.path}
                                    </p>
                                </div>

                                <div className="text-right shrink-0">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-secondary/50 px-2 py-1 rounded-lg">
                                        <Clock className="w-3 h-3" />
                                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <div className="p-4 bg-secondary/10 border-t border-border/40 text-center">
                <Button variant="ghost" size="sm" className="text-xs font-bold text-primary gap-2 h-8">
                    View All System Logs <ExternalLink className="w-3.5 h-3.5" />
                </Button>
            </div>
        </Card>
    );
}

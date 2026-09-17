import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import type { AttendanceEntry } from "@/services/centerApplicationService";

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

/** Read-only view of each committee member's attend/decline decision — shown identically to Director of Operations and Super Admin. */
export function CommitteeAttendanceCard({ attendance }: { attendance: AttendanceEntry[] }) {
    return (
        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" /> Committee Attendance
                </CardTitle>
            </CardHeader>
            <CardContent>
                {attendance.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No committee member has responded yet.</p>
                ) : (
                    <div className="space-y-2.5">
                        {attendance.map((entry) => (
                            <div
                                key={entry.memberUserId}
                                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30"
                            >
                                <div className="flex items-start gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full gradient-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                        {initials(entry.memberName)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{entry.memberName}</p>
                                        {entry.attending === false && entry.reason && (
                                            <p className="text-xs text-muted-foreground mt-0.5">{entry.reason}</p>
                                        )}
                                        <p className="text-[11px] text-muted-foreground/70 flex items-center gap-1 mt-1">
                                            <Clock className="w-3 h-3" /> {formatDateTime(entry.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={
                                        entry.attending
                                            ? "gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shrink-0"
                                            : "gap-1.5 border-destructive/30 bg-destructive/10 text-destructive shrink-0"
                                    }
                                >
                                    {entry.attending ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                                    {entry.attending ? "Attending" : "Not Attending"}
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

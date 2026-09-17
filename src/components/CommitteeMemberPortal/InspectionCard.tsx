import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Clock, CalendarCheck2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { APPLICATION_STATUS_META } from "@/components/DirectorOperationsPortal/CenterApplications/statusMeta";
import type { CommitteeApplication } from "@/services/committeeMemberService";

function formatDate(iso: string | null): string | null {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function InspectionCard({ application }: { application: CommitteeApplication }) {
    const navigate = useNavigate();
    const meta = APPLICATION_STATUS_META[application.status as keyof typeof APPLICATION_STATUS_META];

    const dateLabel =
        application.status === "INSPECTION_IN_PROGRESS"
            ? formatDate(application.inspectionAssignedAt) && `Assigned ${formatDate(application.inspectionAssignedAt)}`
            : application.status === "SCHEDULED"
              ? formatDate(application.scheduledInspectionDate) && `Scheduled for ${formatDate(application.scheduledInspectionDate)}`
              : application.status === "APPROVED" || application.status === "REJECTED"
                ? formatDate(application.reviewedAt) && `Reviewed ${formatDate(application.reviewedAt)}`
                : formatDate(application.inspectionCompletedAt) && `Submitted ${formatDate(application.inspectionCompletedAt)}`;

    return (
        <Card
            className="group relative overflow-hidden rounded-2xl border-border/40 bg-card shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)] hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            onClick={() => navigate(`/committee/applications/${application.id}`)}
        >
            <div className="absolute inset-x-0 top-0 h-0.5 gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                        <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="alumni-sans-title text-lg text-foreground leading-tight truncate">
                            {application.centerName || "Unnamed Center"}
                        </h3>
                        {application.address && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                                <MapPin className="w-3 h-3 shrink-0" /> {application.address}
                            </p>
                        )}
                        <p className="text-[11px] text-muted-foreground/70 font-mono mt-1">
                            {application.licenseNumber} · {application.cnic}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-end gap-1.5">
                        <Badge variant="outline" className={cn("gap-1.5 text-[11px] font-medium border", meta?.chipClassName)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", meta?.dot)} />
                            {meta?.label ?? application.status}
                        </Badge>
                        {dateLabel && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                {application.status === "APPROVED" || application.status === "REJECTED" ? (
                                    <CalendarCheck2 className="w-3 h-3" />
                                ) : (
                                    <Clock className="w-3 h-3" />
                                )}
                                {dateLabel}
                            </span>
                        )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
            </CardContent>
        </Card>
    );
}

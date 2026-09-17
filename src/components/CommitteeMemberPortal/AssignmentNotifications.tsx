import { useNavigate } from "react-router-dom";
import { CalendarClock, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommitteeApplication } from "@/services/committeeMemberService";

function formatDate(iso: string | null): string | null {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

interface NotificationRowProps {
    application: CommitteeApplication;
    variant: "new" | "upcoming";
}

function NotificationRow({ application, variant }: NotificationRowProps) {
    const navigate = useNavigate();
    const isNew = variant === "new";

    return (
        <button
            onClick={() => navigate(`/committee/applications/${application.id}`)}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border border-l-[3px] border-l-primary text-left transition-all hover:-translate-y-0.5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md bg-primary/[0.03] hover:bg-primary/[0.06]"
        >
            <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                {isNew ? <Sparkles className="w-3.5 h-3.5" /> : <CalendarClock className="w-3.5 h-3.5" />}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground truncate">
                    {application.centerName || "Unnamed Center"}
                </p>
                <p className="text-xs font-medium mt-0.5 text-primary/80">
                    {isNew ? "New assignment — schedule the inspection" : `Scheduled for ${formatDate(application.scheduledInspectionDate)}`}
                </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
        </button>
    );
}

export function AssignmentNotifications({ applications }: { applications: CommitteeApplication[] }) {
    const needsScheduling = applications.filter((a) => a.status === "INSPECTION_IN_PROGRESS");
    const upcoming = applications
        .filter((a) => a.status === "SCHEDULED" && a.scheduledInspectionDate)
        .sort((a, b) => (a.scheduledInspectionDate! < b.scheduledInspectionDate! ? -1 : 1));

    if (needsScheduling.length === 0 && upcoming.length === 0) return null;

    return (
        <div className="grid sm:grid-cols-2 gap-4">
            {needsScheduling.length > 0 && (
                <div className="space-y-2.5">
                    <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Needs Scheduling ({needsScheduling.length})
                    </h2>
                    <div className="space-y-2">
                        {needsScheduling.map((app) => (
                            <NotificationRow key={app.id} application={app} variant="new" />
                        ))}
                    </div>
                </div>
            )}
            {upcoming.length > 0 && (
                <div className="space-y-2.5">
                    <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-1.5">
                        <CalendarClock className="w-3.5 h-3.5" /> Upcoming Inspections ({upcoming.length})
                    </h2>
                    <div className="space-y-2">
                        {upcoming.map((app) => (
                            <NotificationRow key={app.id} application={app} variant="upcoming" />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

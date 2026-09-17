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
            className={cn(
                "w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all hover:-translate-y-0.5",
                isNew
                    ? "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15"
                    : "bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/15",
            )}
        >
            <div
                className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    isNew ? "bg-amber-500/20 text-amber-600" : "bg-violet-500/20 text-violet-600",
                )}
            >
                {isNew ? <Sparkles className="w-4 h-4" /> : <CalendarClock className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">
                    {application.centerName || "Unnamed Center"}
                </p>
                <p className={cn("text-xs font-medium", isNew ? "text-amber-700 dark:text-amber-400" : "text-violet-700 dark:text-violet-400")}>
                    {isNew ? "New assignment — schedule the inspection" : `Scheduled for ${formatDate(application.scheduledInspectionDate)}`}
                </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
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
        <div className="grid sm:grid-cols-2 gap-3">
            {needsScheduling.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide px-1 flex items-center gap-1.5">
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
                <div className="space-y-2">
                    <h2 className="text-xs font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wide px-1 flex items-center gap-1.5">
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

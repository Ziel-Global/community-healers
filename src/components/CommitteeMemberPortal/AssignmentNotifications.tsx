import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, CalendarClock, MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommitteeApplication } from "@/services/committeeMemberService";

function formatShortDate(iso: string | null): string {
    if (!iso) return "Date TBD";
    return new Date(iso).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

function dateParts(iso: string | null) {
    if (!iso) return { day: "—", month: "TBD" };
    const d = new Date(iso);
    return {
        day: d.toLocaleDateString(undefined, { day: "numeric" }),
        month: d.toLocaleDateString(undefined, { month: "short" }).toUpperCase(),
    };
}

function UpcomingTile({ application }: { application: CommitteeApplication }) {
    const navigate = useNavigate();
    const parts = dateParts(application.scheduledInspectionDate);

    return (
        <button
            type="button"
            onClick={() => navigate(`/committee/applications/${application.id}`)}
            className={cn(
                "group relative text-left w-full h-full overflow-hidden rounded-[18px] border border-[#e7eee9] bg-white",
                "shadow-[0_10px_30px_#163a2b08] transition-all duration-300",
                "hover:-translate-y-1 hover:shadow-[0_18px_40px_#163a2b12] hover:border-[#c9dbc0]"
            )}
        >
            <div className="absolute inset-x-0 top-0 h-[3px] bg-[#164c3e]" />
            <div className="p-4 flex items-start gap-3.5 min-h-[96px]">
                <div className="w-[48px] h-[56px] shrink-0 self-start rounded-[11px] bg-[#174c3e] flex flex-col items-center justify-center shadow-[0_8px_20px_rgba(23,76,62,0.22)]">
                    <p className="text-[9px] font-bold tracking-[0.14em] text-[#d7f88c] leading-none">{parts.month}</p>
                    <p className="text-lg font-display font-semibold text-white leading-none mt-1 tabular-nums">
                        {parts.day}
                    </p>
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-center gap-1 py-0.5">
                    <p className="text-sm font-semibold text-[#183d34] truncate leading-snug">
                        {application.centerName || "Unnamed Center"}
                    </p>
                    <p className="text-xs text-[#6d8474] flex items-center gap-1 min-w-0">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{application.address || "Address not provided"}</span>
                    </p>
                    <p className="text-[11px] text-[#93a087] flex items-center gap-1.5 mt-0.5">
                        <CalendarClock className="w-3 h-3 shrink-0" />
                        <span className="truncate">{formatShortDate(application.scheduledInspectionDate)}</span>
                    </p>
                </div>
            </div>
        </button>
    );
}

function NeedsSchedulingTile({ application }: { application: CommitteeApplication }) {
    const navigate = useNavigate();

    return (
        <button
            type="button"
            onClick={() => navigate(`/committee/applications/${application.id}`)}
            className={cn(
                "group relative text-left w-full overflow-hidden rounded-[18px] border border-amber-200/70 bg-[#fffbf5]",
                "shadow-[0_10px_30px_#163a2b08] transition-all duration-300",
                "hover:-translate-y-1 hover:shadow-[0_18px_40px_#163a2b12] hover:border-amber-300"
            )}
        >
            <div className="absolute inset-x-0 top-0 h-[3px] bg-amber-500" />
            <div className="p-4 sm:p-5 flex gap-3.5">
                <div className="w-11 h-11 rounded-[14px] bg-amber-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-700" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#183d34] truncate">
                        {application.centerName || "Unnamed Center"}
                    </p>
                    <p className="text-xs text-amber-800/80 mt-1">New assignment — open to prepare the visit</p>
                    {application.address && (
                        <p className="text-[11px] text-[#6d8474] flex items-center gap-1 mt-1.5 truncate">
                            <MapPin className="w-3 h-3 shrink-0" /> {application.address}
                        </p>
                    )}
                </div>
            </div>
        </button>
    );
}

interface AssignmentNotificationsProps {
    applications: CommitteeApplication[];
    /** Limit tiles on the dashboard; omit for full lists. */
    limit?: number;
    showLinks?: boolean;
}

export function AssignmentNotifications({
    applications,
    limit = 4,
    showLinks = true,
}: AssignmentNotificationsProps) {
    const needsScheduling = applications.filter((a) => a.status === "INSPECTION_IN_PROGRESS");
    const upcoming = applications
        .filter((a) => a.status === "SCHEDULED" && a.scheduledInspectionDate)
        .sort((a, b) => (a.scheduledInspectionDate! < b.scheduledInspectionDate! ? -1 : 1));

    if (needsScheduling.length === 0 && upcoming.length === 0) return null;

    const upcomingShown = upcoming.slice(0, limit);
    const needsShown = needsScheduling.slice(0, limit);

    return (
        <div className="space-y-5">
            {needsScheduling.length > 0 && (
                <section className="rounded-[20px] border border-[#d5e0d4] bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)] overflow-hidden">
                    <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-[#e7eee9] flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6d8474] flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Needs preparation
                            </p>
                            <h2 className="text-lg font-semibold text-[#183d34] tracking-tight mt-0.5">
                                Newly assigned ({needsScheduling.length})
                            </h2>
                        </div>
                        {showLinks && (
                            <Link
                                to="/committee/assignments"
                                className="text-xs font-semibold text-[#164c3e] hover:underline inline-flex items-center gap-1 shrink-0 pt-1"
                            >
                                All assignments <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>
                    <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {needsShown.map((app) => (
                            <NeedsSchedulingTile key={app.id} application={app} />
                        ))}
                    </div>
                </section>
            )}

            {upcoming.length > 0 && (
                <section className="rounded-[20px] border border-[#d5e0d4] bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)] overflow-hidden">
                    <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-[#e7eee9] flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6d8474] flex items-center gap-1.5">
                                <CalendarClock className="w-3.5 h-3.5" /> Schedule
                            </p>
                            <h2 className="text-lg font-semibold text-[#183d34] tracking-tight mt-0.5">
                                Upcoming inspections ({upcoming.length})
                            </h2>
                        </div>
                        {showLinks && (
                            <Link
                                to="/committee/assignments"
                                className="text-xs font-semibold text-[#164c3e] hover:underline inline-flex items-center gap-1 shrink-0 pt-1"
                            >
                                View board <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>
                    <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-fr">
                        {upcomingShown.map((app) => (
                            <UpcomingTile key={app.id} application={app} />
                        ))}
                    </div>
                    {upcoming.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                            <Building2 className="w-8 h-8 text-[#c9d6c8] mb-2" />
                            <p className="text-sm text-[#6d8474]">No upcoming dates yet</p>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}

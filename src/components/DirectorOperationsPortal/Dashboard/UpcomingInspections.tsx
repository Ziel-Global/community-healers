import { Link } from "react-router-dom";
import { ArrowRight, Building2, CalendarClock, MapPin } from "lucide-react";
import type { CenterApplicationSummary } from "@/services/centerApplicationService";

function formatInspectionDate(iso: string | null): string {
    if (!iso) return "Date TBD";
    return new Date(iso).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

interface UpcomingInspectionsProps {
    applications: CenterApplicationSummary[];
    cityNameById: Map<string, string>;
}

export function UpcomingInspections({ applications, cityNameById }: UpcomingInspectionsProps) {
    const items = applications
        .filter((app) => app.status === "SCHEDULED")
        .sort((a, b) => {
            const aTime = a.scheduledInspectionDate ? new Date(a.scheduledInspectionDate).getTime() : Number.MAX_SAFE_INTEGER;
            const bTime = b.scheduledInspectionDate ? new Date(b.scheduledInspectionDate).getTime() : Number.MAX_SAFE_INTEGER;
            return aTime - bTime;
        })
        .slice(0, 6);

    return (
        <section className="rounded-[20px] border border-[#d5e0d4] bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)] overflow-hidden flex flex-col h-full">
            <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3 border-b border-[#e7eee9] flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6d8474]">Calendar</p>
                    <h2 className="text-lg font-semibold text-[#183d34] tracking-tight mt-0.5">Upcoming inspections</h2>
                </div>
                <Link
                    to="/bureau/applications"
                    className="text-xs font-semibold text-[#164c3e] hover:underline inline-flex items-center gap-1 shrink-0 pt-1"
                >
                    Board <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            <div className="flex-1 p-3 sm:p-4">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                        <div className="w-11 h-11 rounded-xl bg-[#f3f8ed] flex items-center justify-center mb-3">
                            <CalendarClock className="w-5 h-5 text-[#6d8474]" />
                        </div>
                        <p className="text-sm font-medium text-[#183d34]">No inspections scheduled</p>
                        <p className="text-xs text-[#6d8474] mt-1 max-w-[220px]">
                            Once the committee picks a date, it will appear here.
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {items.map((app) => {
                            const city = app.cityId ? cityNameById.get(app.cityId) : null;

                            return (
                                <li key={app.id}>
                                    <Link
                                        to={`/bureau/applications/${app.id}`}
                                        className="flex items-center gap-3 rounded-xl border border-[#e7eee9] bg-[#f8faf7] px-3.5 py-3 hover:border-[#c9d6c8] hover:bg-white transition-colors"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-[#e8f0ea] flex items-center justify-center shrink-0">
                                            <Building2 className="w-4 h-4 text-[#164c3e]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-[#183d34] truncate">
                                                {app.centerName || "Untitled center"}
                                            </p>
                                            {city && (
                                                <p className="text-[11px] text-[#6d8474] inline-flex items-center gap-0.5 mt-0.5">
                                                    <MapPin className="w-3 h-3" /> {city}
                                                </p>
                                            )}
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-[#6d8474]">When</p>
                                            <p className="text-xs font-semibold text-[#183d34] mt-0.5">
                                                {formatInspectionDate(app.scheduledInspectionDate)}
                                            </p>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </section>
    );
}

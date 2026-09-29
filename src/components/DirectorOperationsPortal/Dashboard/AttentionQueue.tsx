import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, Building2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { APPLICATION_STATUS_META } from "@/components/DirectorOperationsPortal/CenterApplications/statusMeta";
import type { CenterApplicationSummary } from "@/services/centerApplicationService";

function daysAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
}

interface AttentionQueueProps {
    applications: CenterApplicationSummary[];
    cityNameById: Map<string, string>;
}

export function AttentionQueue({ applications, cityNameById }: AttentionQueueProps) {
    const items = applications
        .filter(
            (app) =>
                app.status === "INSPECTION_PENDING" ||
                app.status === "UNDER_REVIEW" ||
                Boolean(app.chairmanReturnReason && app.status === "INSPECTION_PENDING")
        )
        .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
        .slice(0, 8);

    return (
        <section className="rounded-[20px] border border-[#d5e0d4] bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)] overflow-hidden flex flex-col h-full">
            <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3 border-b border-[#e7eee9] flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6d8474]">Needs attention</p>
                    <h2 className="text-lg font-semibold text-[#183d34] tracking-tight mt-0.5">Action queue</h2>
                </div>
                <Link
                    to="/bureau/applications"
                    className="text-xs font-semibold text-[#164c3e] hover:underline inline-flex items-center gap-1 shrink-0 pt-1"
                >
                    View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            <div className="flex-1 p-3 sm:p-4">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                        <div className="w-11 h-11 rounded-xl bg-[#f3f8ed] flex items-center justify-center mb-3">
                            <AlertCircle className="w-5 h-5 text-[#71a64b]" />
                        </div>
                        <p className="text-sm font-medium text-[#183d34]">Nothing waiting on you</p>
                        <p className="text-xs text-[#6d8474] mt-1 max-w-[220px]">
                            New submissions and under-review decisions will show up here.
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {items.map((app) => {
                            const meta = APPLICATION_STATUS_META[app.status];
                            const city = app.cityId ? cityNameById.get(app.cityId) : null;
                            const returned = Boolean(app.chairmanReturnReason);

                            return (
                                <li key={app.id}>
                                    <Link
                                        to={`/bureau/applications/${app.id}`}
                                        className={cn(
                                            "flex items-center gap-3 rounded-xl border border-[#e7eee9] bg-[#f8faf7] px-3.5 py-3",
                                            "hover:border-[#c9d6c8] hover:bg-white transition-colors"
                                        )}
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-[#e8f0ea] flex items-center justify-center shrink-0">
                                            <Building2 className="w-4 h-4 text-[#164c3e]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-[#183d34] truncate">
                                                {app.centerName || "Untitled center"}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                                                {city && (
                                                    <span className="text-[11px] text-[#6d8474] inline-flex items-center gap-0.5">
                                                        <MapPin className="w-3 h-3" /> {city}
                                                    </span>
                                                )}
                                                <span className="text-[11px] text-[#93a087]">{daysAgo(app.updatedAt)}</span>
                                                {returned && (
                                                    <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                                                        Returned
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span
                                            className={cn(
                                                "shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md border",
                                                meta.chipClassName
                                            )}
                                        >
                                            {meta.label}
                                        </span>
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

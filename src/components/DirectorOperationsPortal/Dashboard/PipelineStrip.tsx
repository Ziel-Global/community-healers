import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { APPLICATION_STATUS_META } from "@/components/DirectorOperationsPortal/CenterApplications/statusMeta";
import type { CenterApplicationStatus } from "@/services/centerApplicationService";

const FLOW_STATUSES: CenterApplicationStatus[] = [
    "INSPECTION_PENDING",
    "PENDING_CHAIRMAN_REVIEW",
    "INSPECTION_IN_PROGRESS",
    "SCHEDULED",
    "UNDER_REVIEW",
];

const TERMINAL_STATUSES: CenterApplicationStatus[] = ["APPROVED", "REJECTED"];

interface PipelineStripProps {
    countByStatus: Map<string, number>;
}

export function PipelineStrip({ countByStatus }: PipelineStripProps) {
    const steps = FLOW_STATUSES;
    const trackInsetPct = 100 / (steps.length * 2);

    return (
        <section className="rounded-[20px] border border-[#d5e0d4] bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)] overflow-hidden">
            <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3 border-b border-[#e7eee9]">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6d8474]">Application pipeline</p>
                <h2 className="text-lg font-semibold text-[#183d34] tracking-tight mt-0.5">Where every submission sits</h2>
            </div>

            <div className="px-4 sm:px-6 py-6">
                {/* Main flow */}
                <div className="relative">
                    <div
                        className="pointer-events-none absolute top-5 h-[3px] -translate-y-1/2 rounded-full bg-[#c9d6c8] hidden sm:block"
                        style={{ left: `${trackInsetPct}%`, right: `${trackInsetPct}%` }}
                        aria-hidden
                    />

                    <ol
                        className="relative z-10 grid gap-4 sm:gap-0"
                        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
                    >
                        {steps.map((status, index) => {
                            const meta = APPLICATION_STATUS_META[status];
                            const count = countByStatus.get(status) ?? 0;
                            const hasWork = count > 0;

                            return (
                                <li key={status} className="flex flex-col items-center text-center">
                                    <Link
                                        to="/bureau/applications"
                                        className={cn(
                                            "group flex flex-col items-center w-full rounded-xl transition-colors",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold tabular-nums transition-all",
                                                hasWork
                                                    ? "bg-[#164c3e] text-white shadow-[0_6px_16px_rgba(22,76,62,0.28)]"
                                                    : "bg-white border-[1.5px] border-[#c9d6c8] text-[#93a087]"
                                            )}
                                        >
                                            {count}
                                        </span>
                                        <span
                                            className={cn(
                                                "mt-2.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.06em] leading-tight px-1",
                                                hasWork ? "text-[#183d34]" : "text-[#93a087]"
                                            )}
                                        >
                                            {meta.label}
                                        </span>
                                        {index < steps.length - 1 && (
                                            <span className="sm:hidden mt-2 w-px h-4 bg-[#c9d6c8]" aria-hidden />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ol>
                </div>

                {/* Terminal outcomes */}
                <div className="mt-6 pt-5 border-t border-[#e7eee9] grid grid-cols-2 gap-3 max-w-md mx-auto">
                    {TERMINAL_STATUSES.map((status) => {
                        const meta = APPLICATION_STATUS_META[status];
                        const count = countByStatus.get(status) ?? 0;
                        const isApproved = status === "APPROVED";

                        return (
                            <Link
                                key={status}
                                to="/bureau/applications"
                                className={cn(
                                    "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:-translate-y-0.5",
                                    isApproved
                                        ? "border-[#c9dbc0] bg-[#f3f8ed] hover:border-[#71a64b]/40"
                                        : "border-[#e8d5d5] bg-[#faf5f5] hover:border-red-300/50"
                                )}
                            >
                                <span
                                    className={cn(
                                        "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold tabular-nums",
                                        isApproved ? "bg-[#164c3e] text-white" : "bg-red-600 text-white"
                                    )}
                                >
                                    {count}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6d8474]">
                                        {meta.label}
                                    </p>
                                    <p className="text-xs text-[#183d34] font-medium truncate">
                                        {isApproved ? "Centers confirmed" : "Not proceeding"}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

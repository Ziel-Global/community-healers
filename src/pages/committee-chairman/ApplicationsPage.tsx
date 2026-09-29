import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ClipboardList, Loader2, MapPin } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { cn } from "@/lib/utils";
import { APPLICATION_STATUS_META } from "@/components/DirectorOperationsPortal/CenterApplications/statusMeta";
import {
    AssignmentsViewToggle,
    type AssignmentsView,
} from "@/components/CommitteeMemberPortal/AssignmentsViewToggle";
import { ChairmanApplicationsTable } from "@/components/committee-chairman/ChairmanApplicationsTable";
import { useChairmanApplications } from "@/hooks/queries/useCommitteeChairmanQueries";
import type { CenterApplicationSummary } from "@/services/centerApplicationService";
import { committeeChairmanNavItems } from "../CommitteeChairmanPortal";

type ApplicationFilter = "all" | "pending" | "approved";

function sortApplications(applications: CenterApplicationSummary[]) {
    return [...applications].sort((a, b) => {
        const aPending = a.status === "PENDING_CHAIRMAN_REVIEW" ? 0 : 1;
        const bPending = b.status === "PENDING_CHAIRMAN_REVIEW" ? 0 : 1;
        if (aPending !== bPending) return aPending - bPending;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function emptyMessage(filter: ApplicationFilter): string {
    if (filter === "pending") return "No applications awaiting your review";
    if (filter === "approved") return "No approved applications yet";
    return "No applications yet";
}

export default function CommitteeChairmanApplicationsPage() {
    const navigate = useNavigate();
    const { data: applications = [], isLoading } = useChairmanApplications();
    const [filter, setFilter] = useState<ApplicationFilter>("all");
    const [view, setView] = useState<AssignmentsView>("table");
    const appliedDefaultFilter = useRef(false);

    const awaitingCount = applications.filter((a) => a.status === "PENDING_CHAIRMAN_REVIEW").length;
    const approvedCount = applications.filter((a) => a.status === "APPROVED").length;

    useEffect(() => {
        if (isLoading || appliedDefaultFilter.current) return;
        appliedDefaultFilter.current = true;
        setFilter(awaitingCount > 0 ? "pending" : "all");
    }, [isLoading, awaitingCount]);

    const displayed = useMemo(() => {
        let list = applications;
        if (filter === "pending") {
            list = applications.filter((a) => a.status === "PENDING_CHAIRMAN_REVIEW");
        } else if (filter === "approved") {
            list = applications.filter((a) => a.status === "APPROVED");
        }
        return sortApplications(list);
    }, [applications, filter]);

    const filters: { value: ApplicationFilter; label: string; count: number }[] = [
        { value: "all", label: "All", count: applications.length },
        { value: "pending", label: "Pending", count: awaitingCount },
        { value: "approved", label: "Approved", count: approvedCount },
    ];

    return (
        <DashboardLayout
            title="Applications"
            subtitle={
                awaitingCount > 0
                    ? `${awaitingCount} awaiting your review`
                    : "Center applications for your committee"
            }
            portalType="committee-chairman"
            navItems={committeeChairmanNavItems}
        >
            <div className="max-w-[1600px] mx-auto space-y-5 pb-12">
                {!isLoading && applications.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                        <div className="inline-flex rounded-[10px] border border-[#c9d6c8] bg-[#f4f7f3] p-1 gap-1 overflow-x-auto">
                            {filters.map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => setFilter(item.value)}
                                    className={cn(
                                        "h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all",
                                        filter === item.value
                                            ? "bg-[#164c3e] text-white shadow-[0_4px_12px_rgba(22,76,62,0.22)]"
                                            : "text-[#6d8474] hover:text-[#183d34] hover:bg-white/70"
                                    )}
                                >
                                    {item.label} ({item.count})
                                </button>
                            ))}
                        </div>
                        <AssignmentsViewToggle view={view} onChange={setView} />
                    </div>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="text-center py-16 rounded-[20px] border border-dashed border-[#c9d6c8] bg-white">
                        <ClipboardList className="w-12 h-12 text-[#c9d6c8] mx-auto mb-3" />
                        <p className="text-[#183d34] font-medium">{emptyMessage(filter)}</p>
                    </div>
                ) : view === "table" ? (
                    <ChairmanApplicationsTable applications={displayed} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {displayed.map((application) => {
                            const meta = APPLICATION_STATUS_META[application.status];
                            const isAwaiting = application.status === "PENDING_CHAIRMAN_REVIEW";

                            return (
                                <button
                                    key={application.id}
                                    type="button"
                                    onClick={() =>
                                        navigate(`/committee-chairman/applications/${application.id}`)
                                    }
                                    className={cn(
                                        "group relative text-left w-full overflow-hidden rounded-[18px] border border-[#e7eee9] bg-white",
                                        "shadow-[0_10px_30px_#163a2b08] transition-all duration-300",
                                        "hover:-translate-y-1 hover:shadow-[0_18px_40px_#163a2b12] hover:border-[#c9dbc0]",
                                        isAwaiting && "ring-1 ring-[#164c3e]/15"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "absolute inset-x-0 top-0 h-[3px]",
                                            isAwaiting ? "bg-[#a08a55]" : "bg-[#164c3e]"
                                        )}
                                    />
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="w-11 h-11 rounded-[14px] bg-[#e8f0ea] flex items-center justify-center shrink-0">
                                                <Building2
                                                    className="w-5 h-5 text-[#164c3e]"
                                                    strokeWidth={1.75}
                                                />
                                            </div>
                                            {isAwaiting && (
                                                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md bg-[#164c3e] text-white">
                                                    Action needed
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-[#183d34] tracking-tight truncate">
                                                {application.centerName || "Untitled center"}
                                            </h3>
                                            {application.address && (
                                                <p className="text-xs text-[#6d8474] flex items-center gap-1 mt-1.5 truncate">
                                                    <MapPin className="w-3 h-3 shrink-0" />
                                                    {application.address}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#e7eee9]">
                                            <span
                                                className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md border",
                                                    meta?.chipClassName
                                                )}
                                            >
                                                {meta?.label ?? application.status}
                                            </span>
                                            <span className="text-[11px] text-[#93a087] tabular-nums">
                                                Updated {formatDate(application.updatedAt)}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

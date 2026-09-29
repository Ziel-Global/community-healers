import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Clock, CalendarCheck2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { APPLICATION_STATUS_META } from "@/components/DirectorOperationsPortal/CenterApplications/statusMeta";
import type { CommitteeApplication } from "@/services/committeeMemberService";

function formatDate(iso: string | null): string | null {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

interface InspectionCardProps {
    application: CommitteeApplication;
    /** Compact card for grids; default is a fuller row-friendly card. */
    variant?: "row" | "tile";
}

export function InspectionCard({ application, variant = "row" }: InspectionCardProps) {
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

    if (variant === "tile") {
        return (
            <button
                type="button"
                onClick={() => navigate(`/committee/applications/${application.id}`)}
                className={cn(
                    "group relative text-left w-full overflow-hidden rounded-[18px] border border-[#e7eee9] bg-white",
                    "shadow-[0_10px_30px_#163a2b08] transition-all duration-300",
                    "hover:-translate-y-1 hover:shadow-[0_18px_40px_#163a2b12] hover:border-[#c9dbc0]"
                )}
            >
                <div className="absolute inset-x-0 top-0 h-[3px] bg-[#164c3e] opacity-80" />
                <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="w-11 h-11 rounded-[14px] bg-[#e8f0ea] flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5 text-[#164c3e]" strokeWidth={1.75} />
                        </div>
                        <span
                            className={cn(
                                "text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md border",
                                meta?.chipClassName
                            )}
                        >
                            {meta?.label ?? application.status}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-[#183d34] tracking-tight truncate">
                            {application.centerName || "Unnamed Center"}
                        </h3>
                        {application.address && (
                            <p className="text-xs text-[#6d8474] flex items-start gap-1 mt-1.5 line-clamp-2">
                                <MapPin className="w-3 h-3 shrink-0 mt-0.5" /> {application.address}
                            </p>
                        )}
                    </div>
                    {dateLabel && (
                        <p className="text-[11px] text-[#93a087] flex items-center gap-1.5 pt-1 border-t border-[#e7eee9]">
                            <Clock className="w-3 h-3" /> {dateLabel}
                        </p>
                    )}
                </div>
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={() => navigate(`/committee/applications/${application.id}`)}
            className={cn(
                "group relative w-full text-left overflow-hidden rounded-[18px] border border-[#e7eee9] bg-white",
                "shadow-[0_8px_24px_#163a2b08] transition-all duration-300",
                "hover:-translate-y-0.5 hover:shadow-[0_14px_32px_#163a2b12] hover:border-[#c9dbc0]"
            )}
        >
            <div className="absolute inset-y-0 left-0 w-[3px] bg-[#164c3e] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-[14px] bg-[#e8f0ea] flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-[#164c3e]" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold tracking-tight text-[#183d34] truncate">
                            {application.centerName || "Unnamed Center"}
                        </h3>
                        {application.address && (
                            <p className="text-xs text-[#6d8474] flex items-center gap-1 mt-1 truncate">
                                <MapPin className="w-3 h-3 shrink-0" /> {application.address}
                            </p>
                        )}
                        <p className="text-[11px] text-[#93a087] font-mono mt-1 truncate">
                            {application.licenseNumber} · {application.cnic}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex flex-col items-end gap-1.5">
                        <span
                            className={cn(
                                "text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md border",
                                meta?.chipClassName
                            )}
                        >
                            {meta?.label ?? application.status}
                        </span>
                        {dateLabel && (
                            <span className="text-[10px] text-[#6d8474] flex items-center gap-1">
                                {application.status === "APPROVED" || application.status === "REJECTED" ? (
                                    <CalendarCheck2 className="w-3 h-3" />
                                ) : (
                                    <Clock className="w-3 h-3" />
                                )}
                                {dateLabel}
                            </span>
                        )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#c9d6c8] group-hover:text-[#164c3e] group-hover:translate-x-0.5 transition-all" />
                </div>
            </div>
        </button>
    );
}

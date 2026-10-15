import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { committeeNavItems } from "../CommitteeMemberPortal";
import { ArrowLeft, Building2, CalendarClock, CheckCircle2, Loader2, MapPin } from "lucide-react";
import {
  useCommitteeApplicationDetail,
  useMyInspectionReport,
} from "@/hooks/queries/useCommitteeMemberQueries";
import { MyInspectionAttendanceCard } from "@/components/CommitteeMemberPortal/MyInspectionAttendanceCard";

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function dateParts(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString(undefined, { day: "numeric" }),
    month: d.toLocaleDateString(undefined, { month: "short" }).toUpperCase(),
    weekday: d.toLocaleDateString(undefined, { weekday: "long" }),
    year: d.getFullYear(),
  };
}

export default function CommitteeApplicationDetailPage() {
  const { applicationId = "" } = useParams();
  const { data, isLoading } = useCommitteeApplicationDetail(applicationId);
  const { data: myReport } = useMyInspectionReport(applicationId);

  const inspectionPath = `/committee/applications/${applicationId}/inspection`;

  if (isLoading) {
    return (
      <DashboardLayout title="Loading..." portalType="committee" navItems={committeeNavItems}>
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  const { application, myReport: myReportOnDetail, inspection } = data;
  const submittedAt = myReport?.submittedAt ?? myReportOnDetail?.submittedAt ?? null;
  const isReportSubmitted = !!submittedAt;
  const isScheduled = application.status === "SCHEDULED";
  const isInspectionOpen = inspection?.isOpen ?? true;
  const scheduledDate = inspection?.scheduledInspectionDate ?? application.scheduledInspectionDate;
  const parts = dateParts(scheduledDate);

  return (
    <DashboardLayout
      title={application.centerName || "Application"}
      subtitle={application.address || undefined}
      portalType="committee"
      navItems={committeeNavItems}
    >
      <div className="max-w-3xl mx-auto space-y-5 pb-12">
        <Link
          to="/committee/assignments"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6d8474] hover:text-[#164c3e] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to assignments
        </Link>

        {!isScheduled ? (
          <section className="rounded-[20px] border border-[#d5e0d4] bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)] p-6 sm:p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#e8f0ea] flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-5 h-5 text-[#164c3e]" />
            </div>
            <p className="text-sm text-[#6d8474] leading-relaxed max-w-md mx-auto">
              This application is{" "}
              <span className="font-semibold text-[#183d34]">{application.status}</span>. Your inspection checklist
              opens once the chairman schedules and forwards it.
            </p>
          </section>
        ) : (
          <>
            {isReportSubmitted && (
              <div className="p-4 rounded-[14px] bg-[#f3f8ed] border border-[#c9dbc0] text-sm text-[#355c45] flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#426f36]" />
                <span>
                  Report submitted to the chairman
                  {submittedAt && ` on ${formatDate(submittedAt)}`}.
                </span>
              </div>
            )}

            {/* Schedule hero */}
            <section className="rounded-[20px] border border-[#d5e0d4] bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)] overflow-hidden">
              <div className="p-5 sm:p-6 flex items-center gap-4">
                {parts ? (
                  <div className="w-[64px] h-[72px] shrink-0 rounded-[14px] bg-[#174c3e] flex flex-col items-center justify-center shadow-[0_8px_20px_rgba(23,76,62,0.22)]">
                    <p className="text-[10px] font-bold tracking-[0.14em] text-[#d7f88c] leading-none">{parts.month}</p>
                    <p className="text-2xl font-display font-semibold text-white leading-none mt-1.5 tabular-nums">
                      {parts.day}
                    </p>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-[14px] bg-[#e8f0ea] flex items-center justify-center shrink-0">
                    <CalendarClock className="w-6 h-6 text-[#164c3e]" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6d8474]">
                    Scheduled inspection
                  </p>
                  <p className="text-lg font-semibold text-[#183d34] tracking-tight mt-0.5">
                    {formatDate(scheduledDate) ?? "Not scheduled yet"}
                  </p>
                  {parts && (
                    <p className="text-xs text-[#93a087] mt-1">
                      {parts.weekday} · {parts.year}
                    </p>
                  )}
                  {application.address && (
                    <p className="text-xs text-[#6d8474] flex items-center gap-1 mt-2 truncate">
                      <MapPin className="w-3 h-3 shrink-0" /> {application.address}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {!isInspectionOpen && inspection?.message && (
              <div className="p-4 rounded-[14px] bg-[#fffbf5] border border-amber-200/80 text-sm text-amber-900">
                {inspection.message}
              </div>
            )}

            <MyInspectionAttendanceCard applicationId={applicationId} inspectionPath={inspectionPath} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

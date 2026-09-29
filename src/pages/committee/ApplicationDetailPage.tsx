import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { committeeNavItems } from "../CommitteeMemberPortal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  Loader2,
  MapPin,
  Pencil,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useCommitteeApplicationDetail,
  useSetAttendance,
  useMyInspectionReport,
} from "@/hooks/queries/useCommitteeMemberQueries";
import { getApiErrorMessage } from "@/lib/errors";

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
  const navigate = useNavigate();
  const { data, isLoading } = useCommitteeApplicationDetail(applicationId);
  const { data: myReport } = useMyInspectionReport(applicationId);
  const attendanceMutation = useSetAttendance(applicationId);
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [editingAttendance, setEditingAttendance] = useState(false);

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

  const { application, attendance, myAttendance, myReport: myReportOnDetail, inspection } = data;
  const submittedAt = myReport?.submittedAt ?? myReportOnDetail?.submittedAt ?? null;
  const isReportSubmitted = !!submittedAt;
  const isScheduled = application.status === "SCHEDULED";
  const isEditable = isScheduled && !isReportSubmitted;
  const isAttending = myAttendance?.attending === true;
  const hasResponded = myAttendance?.attending === true || myAttendance?.attending === false;
  const showRsvpControls = isEditable && (!hasResponded || editingAttendance);
  const isInspectionOpen = inspection?.isOpen ?? true;
  const scheduledDate = inspection?.scheduledInspectionDate ?? application.scheduledInspectionDate;
  const canContinueToInspection = isReportSubmitted || (isAttending && isInspectionOpen);
  const parts = dateParts(scheduledDate);

  const handleAttend = () => {
    attendanceMutation.mutate(
      { attending: true },
      {
        onSuccess: () => {
          toast.success("Marked as attending");
          setShowDeclineReason(false);
          setDeclineReason("");
          setEditingAttendance(false);
          if (isInspectionOpen) {
            navigate(inspectionPath);
          }
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "Failed to update attendance")),
      },
    );
  };

  const handleDecline = () => {
    if (!declineReason.trim()) return;
    attendanceMutation.mutate(
      { attending: false, reason: declineReason.trim() },
      {
        onSuccess: () => {
          toast.success("Marked as not attending");
          setShowDeclineReason(false);
          setDeclineReason("");
          setEditingAttendance(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error, "Failed to update attendance")),
      },
    );
  };

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

            {/* Attendance */}
            <section className="rounded-[20px] border border-[#d5e0d4] bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)] overflow-hidden">
              <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-[#e7eee9]">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6d8474] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Committee
                </p>
                <h2 className="text-lg font-semibold text-[#183d34] tracking-tight mt-0.5">Attendance</h2>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                {isEditable && hasResponded && !editingAttendance && (
                  <div className="flex items-start justify-between gap-3 p-4 rounded-[14px] border border-[#e7eee9] bg-[#f8faf7]">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#183d34]">
                        You marked: {isAttending ? "Attending" : "Can't attend"}
                      </p>
                      {myAttendance?.attending === false && myAttendance.reason && (
                        <p className="text-xs text-[#6d8474] mt-1">Reason: {myAttendance.reason}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 shrink-0 border-[#c9d6c8] text-[#183d34] hover:bg-white"
                      onClick={() => {
                        setEditingAttendance(true);
                        setShowDeclineReason(false);
                        setDeclineReason(myAttendance?.reason ?? "");
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                  </div>
                )}

                {showRsvpControls && (
                  <div className="space-y-3">
                    <p className="text-sm text-[#6d8474]">Will you personally attend this inspection?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <Button
                        className={cn(
                          "h-11 gap-2 rounded-[10px]",
                          myAttendance?.attending === true
                            ? "bg-[#164c3e] hover:bg-[#12382d] text-white shadow-[0_8px_20px_rgba(22,76,62,0.22)]"
                            : "bg-[#e8f0ea] text-[#164c3e] hover:bg-[#dce8df] border-0"
                        )}
                        disabled={attendanceMutation.isPending}
                        onClick={handleAttend}
                      >
                        <UserCheck className="w-4 h-4" /> I'll Attend
                      </Button>
                      <Button
                        variant="outline"
                        className={cn(
                          "h-11 gap-2 rounded-[10px]",
                          myAttendance?.attending === false
                            ? "bg-destructive hover:bg-destructive/90 text-white border-destructive"
                            : "border-[#c9d6c8] text-[#183d34] hover:bg-[#f8faf7]"
                        )}
                        disabled={attendanceMutation.isPending}
                        onClick={() => setShowDeclineReason(true)}
                      >
                        <UserX className="w-4 h-4" /> Can't Attend
                      </Button>
                    </div>
                    {showDeclineReason && (
                      <div className="space-y-2.5 pt-1">
                        <Textarea
                          placeholder="Why can't you attend? (required)"
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-[9px]"
                            disabled={!declineReason.trim() || attendanceMutation.isPending}
                            onClick={handleDecline}
                          >
                            {attendanceMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[#6d8474]"
                            onClick={() => {
                              setShowDeclineReason(false);
                              setDeclineReason("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6d8474] mb-2.5">
                    Responses ({attendance.length})
                  </p>
                  {attendance.length === 0 ? (
                    <p className="text-sm text-[#6d8474] py-4 text-center rounded-[14px] border border-dashed border-[#c9d6c8] bg-[#f8faf7]">
                      No one has responded yet.
                    </p>
                  ) : (
                    <ul className="rounded-[14px] border border-[#e7eee9] overflow-hidden divide-y divide-[#e7eee9]">
                      {attendance.map((entry) => (
                        <li
                          key={entry.memberUserId}
                          className="flex items-start justify-between gap-3 px-4 py-3.5 bg-white hover:bg-[#f8faf7] transition-colors"
                        >
                          <div className="min-w-0 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#e8f0ea] flex items-center justify-center shrink-0 text-xs font-bold text-[#164c3e]">
                              {entry.memberName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#183d34] truncate">{entry.memberName}</p>
                              {entry.attending === false && entry.reason && (
                                <p className="text-xs text-[#6d8474] mt-0.5 line-clamp-2">{entry.reason}</p>
                              )}
                            </div>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md border",
                              entry.attending
                                ? "border-[#c9dbc0] bg-[#eef6df] text-[#426f36]"
                                : "border-red-200 bg-red-50 text-red-700"
                            )}
                          >
                            {entry.attending ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                            {entry.attending ? "Attending" : "Not attending"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {canContinueToInspection && (
                  <Button
                    className="w-full h-11 gap-2 rounded-[10px] bg-[#164c3e] hover:bg-[#12382d] text-white shadow-[0_8px_20px_rgba(22,76,62,0.22)]"
                    onClick={() => navigate(inspectionPath)}
                  >
                    Continue to inspection
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
                {isAttending && !isInspectionOpen && !isReportSubmitted && (
                  <p className="text-xs text-[#6d8474] text-center">
                    Checklist unlocks on the scheduled inspection day.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

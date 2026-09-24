import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { committeeNavItems } from "../CommitteeMemberPortal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, UserCheck, UserX, Users, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
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

export default function CommitteeApplicationDetailPage() {
  const { applicationId = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useCommitteeApplicationDetail(applicationId);
  const { data: myReport } = useMyInspectionReport(applicationId);
  const attendanceMutation = useSetAttendance(applicationId);
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const inspectionPath = `/committee/applications/${applicationId}/inspection`;

  if (isLoading) {
    return (
      <DashboardLayout title="Loading..." portalType="committee" navItems={committeeNavItems}>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  const { application, attendance, myAttendance, myReport: myReportOnDetail } = data;
  const submittedAt = myReport?.submittedAt ?? myReportOnDetail?.submittedAt ?? null;
  const isReportSubmitted = !!submittedAt;
  const isScheduled = application.status === "SCHEDULED";
  const isEditable = isScheduled && !isReportSubmitted;
  const isAttending = myAttendance?.attending === true;

  const handleAttend = () => {
    attendanceMutation.mutate(
      { attending: true },
      {
        onSuccess: () => {
          toast.success("Marked as attending");
          setShowDeclineReason(false);
          setDeclineReason("");
          navigate(inspectionPath);
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
      <div className="max-w-3xl mx-auto space-y-4">
        {!isScheduled ? (
          <Card className="border-border/40">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              This application is <strong>{application.status}</strong>. Your inspection checklist opens once the chairman
              schedules and forwards it.
            </CardContent>
          </Card>
        ) : (
          <>
            {isReportSubmitted && (
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Report submitted to the chairman
                {submittedAt && ` on ${formatDate(submittedAt)}`}.
              </div>
            )}

            <Card className="border-border/40">
              <CardContent className="p-5 flex items-center gap-2.5">
                <CalendarClock className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Scheduled Inspection Date</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatDate(application.scheduledInspectionDate) ?? "Not scheduled yet"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Committee Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditable && (
                  <div className="space-y-3 pb-4 border-b border-border/30">
                    <p className="text-xs text-muted-foreground">Will you personally attend this inspection?</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={myAttendance?.attending === true ? "default" : "outline"}
                        className={
                          myAttendance?.attending === true
                            ? "gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "gap-1.5"
                        }
                        disabled={attendanceMutation.isPending}
                        onClick={handleAttend}
                      >
                        <UserCheck className="w-3.5 h-3.5" /> I'll Attend
                      </Button>
                      <Button
                        size="sm"
                        variant={myAttendance?.attending === false ? "default" : "outline"}
                        className={
                          myAttendance?.attending === false
                            ? "gap-1.5 bg-destructive hover:bg-destructive/90 text-white"
                            : "gap-1.5"
                        }
                        disabled={attendanceMutation.isPending}
                        onClick={() => setShowDeclineReason(true)}
                      >
                        <UserX className="w-3.5 h-3.5" /> Can't Attend
                      </Button>
                    </div>
                    {myAttendance?.attending === false && !showDeclineReason && (
                      <p className="text-xs text-muted-foreground">Reason: {myAttendance.reason}</p>
                    )}
                    {showDeclineReason && (
                      <div className="space-y-2">
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
                            disabled={!declineReason.trim() || attendanceMutation.isPending}
                            onClick={handleDecline}
                          >
                            {attendanceMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                            Confirm
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setShowDeclineReason(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {attendance.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No one has responded yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {attendance.map((entry) => (
                      <div key={entry.memberUserId} className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{entry.memberName}</p>
                          {entry.attending === false && entry.reason && (
                            <p className="text-xs text-muted-foreground mt-0.5">{entry.reason}</p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            entry.attending
                              ? "gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shrink-0"
                              : "gap-1.5 border-destructive/30 bg-destructive/10 text-destructive shrink-0"
                          }
                        >
                          {entry.attending ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {entry.attending ? "Attending" : "Not Attending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {(isAttending || isReportSubmitted) && (
                  <Button className="w-full gap-2" onClick={() => navigate(inspectionPath)}>
                    Continue to inspection
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

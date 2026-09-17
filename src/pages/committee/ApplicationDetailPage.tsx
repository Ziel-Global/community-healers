import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { committeeNavItems } from "../CommitteeMemberPortal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Camera, Loader2, ImageIcon, CalendarClock, UserCheck, UserX, Users, ClipboardList, Building2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import {
  useCommitteeApplicationDetail,
  useUploadEvidence,
  useSetChecklistChecked,
  useApproveInspection,
  useRejectInspection,
  useSetAttendance,
} from "@/hooks/queries/useCommitteeMemberQueries";
import { getApiErrorMessage } from "@/lib/errors";
import { CommentThread } from "@/components/CommentThread";
import { ScheduleInspectionDialog } from "@/components/ScheduleInspectionDialog";
import { CameraCaptureDialog } from "@/components/CameraCaptureDialog";
import type { CommitteeChecklistItem, ChecklistCategory } from "@/services/committeeMemberService";

/** One clear photo proves an item was inspected — no need for a second angle. */
const MIN_EVIDENCE = 1;

const CATEGORY_ORDER: ChecklistCategory[] = ["OPERATIONS_COMPLIANCE", "BUILDING_FACILITIES", "STAFF_TRAINERS"];
const CATEGORY_META: Record<ChecklistCategory, { label: string; icon: typeof ClipboardList }> = {
  OPERATIONS_COMPLIANCE: { label: "Operations & Compliance", icon: ClipboardList },
  BUILDING_FACILITIES: { label: "Building & Facilities", icon: Building2 },
  STAFF_TRAINERS: { label: "Staff & Trainers", icon: GraduationCap },
};

function isItemComplete(item: CommitteeChecklistItem): boolean {
  return item.requiresPhoto ? item.evidence.length >= MIN_EVIDENCE : item.checked;
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export default function CommitteeApplicationDetailPage() {
  const { applicationId = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useCommitteeApplicationDetail(applicationId);
  const uploadMutation = useUploadEvidence(applicationId);
  const checkedMutation = useSetChecklistChecked(applicationId);
  const approveMutation = useApproveInspection(applicationId);
  const rejectMutation = useRejectInspection(applicationId);
  const attendanceMutation = useSetAttendance(applicationId);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [cameraTargetItemId, setCameraTargetItemId] = useState<string | null>(null);
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (isLoading) {
    return (
      <DashboardLayout title="Loading..." portalType="committee" navItems={committeeNavItems}>
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  const { application, checklist, attendance, myAttendance } = data;
  // The checklist only unlocks once the committee has picked an inspection date.
  const needsScheduling = application.status === "INSPECTION_IN_PROGRESS";
  const isEditable = application.status === "SCHEDULED";
  const isReadOnly = !isEditable;
  const allDocumented = checklist.every(isItemComplete);
  const groupedChecklist = CATEGORY_ORDER.map((category) => ({
    category,
    items: checklist.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  const handleFileSelected = (checklistItemId: string, file: File | null) => {
    if (!file) return;
    setUploadingItemId(checklistItemId);
    uploadMutation.mutate(
      { checklistItemId, photo: file },
      {
        onSuccess: () => {
          toast.success("Evidence photo uploaded");
          setUploadingItemId(null);
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, "Failed to upload photo"));
          setUploadingItemId(null);
        },
      },
    );
  };

  const handleToggleChecked = (checklistItemId: string, checked: boolean) => {
    checkedMutation.mutate(
      { checklistItemId, checked },
      {
        onError: (error) => toast.error(getApiErrorMessage(error, "Failed to update checklist item")),
      },
    );
  };

  const handleAttend = () => {
    attendanceMutation.mutate(
      { attending: true },
      {
        onSuccess: () => {
          toast.success("Marked as attending");
          setShowDeclineReason(false);
          setDeclineReason("");
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

  const handleApprove = () => {
    approveMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Application approved — the center and its admin login are now live");
        navigate("/committee");
      },
      onError: (error) => toast.error(getApiErrorMessage(error, "Failed to approve application")),
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    rejectMutation.mutate(rejectReason.trim(), {
      onSuccess: () => {
        toast.success("Application rejected");
        setShowRejectDialog(false);
        navigate("/committee");
      },
      onError: (error) => toast.error(getApiErrorMessage(error, "Failed to reject application")),
    });
  };

  return (
    <DashboardLayout
      title={application.centerName || "Application"}
      subtitle={application.address || undefined}
      portalType="committee"
      navItems={committeeNavItems}
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {needsScheduling ? (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6 text-center space-y-3">
              <CalendarClock className="w-10 h-10 text-primary mx-auto" />
              <h2 className="text-lg font-semibold text-foreground">Schedule the inspection first</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Pick a date and leave a note for the rest of your committee before the checklist unlocks —
                e.g. "We will visit this center for inspection on this date."
              </p>
              <Button className="gradient-primary text-white gap-2 mt-2" onClick={() => setShowScheduleDialog(true)}>
                <CalendarClock className="w-4 h-4" /> Schedule Inspection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {isReadOnly && (
              <div className="p-4 rounded-xl bg-secondary/40 border border-border/40 text-sm text-muted-foreground">
                This application's status is <strong>{application.status}</strong> — checklist is read-only.
              </div>
            )}

            <Card className="border-border/40">
              <CardContent className="p-5 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <CalendarClock className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Scheduled Inspection Date</p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatDate(application.scheduledInspectionDate) ?? "Not scheduled yet"}
                    </p>
                  </div>
                </div>
                {isEditable && (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowScheduleDialog(true)}>
                    <CalendarClock className="w-3.5 h-3.5" /> Reschedule / Comment
                  </Button>
                )}
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
                        className={myAttendance?.attending === true ? "gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" : "gap-1.5"}
                        disabled={attendanceMutation.isPending}
                        onClick={handleAttend}
                      >
                        <UserCheck className="w-3.5 h-3.5" /> I'll Attend
                      </Button>
                      <Button
                        size="sm"
                        variant={myAttendance?.attending === false ? "default" : "outline"}
                        className={myAttendance?.attending === false ? "gap-1.5 bg-destructive hover:bg-destructive/90 text-white" : "gap-1.5"}
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
              </CardContent>
            </Card>

            {groupedChecklist.map(({ category, items }) => {
              const meta = CATEGORY_META[category];
              const Icon = meta.icon;
              const completeCount = items.filter(isItemComplete).length;

              return (
                <div key={category} className="space-y-2.5">
                  <div className="flex items-center gap-2 px-1">
                    <Icon className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-wide">{meta.label}</h3>
                    <span className="text-[11px] text-muted-foreground font-semibold bg-secondary/70 rounded-full min-w-[36px] text-center px-1.5 py-0.5">
                      {completeCount}/{items.length}
                    </span>
                  </div>

                  {items.map((item) =>
                    item.requiresPhoto ? (
                      <Card key={item.checklistItemId} className="border-border/40">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{item.label}</CardTitle>
                            {isItemComplete(item) && (
                              <Badge variant="success" className="gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Documented
                              </Badge>
                            )}
                          </div>
                          {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <ImageIcon className="w-4 h-4" />
                              {item.evidence.length} / {MIN_EVIDENCE} photo required
                            </div>
                            {!isReadOnly && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={uploadingItemId === item.checklistItemId}
                                onClick={() => setCameraTargetItemId(item.checklistItemId)}
                              >
                                {uploadingItemId === item.checklistItemId ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Camera className="w-4 h-4 mr-2" />
                                )}
                                {isItemComplete(item) ? "Retake / Add Photo" : "Upload Photo"}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <label
                        key={item.checklistItemId}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border border-border/40 bg-card transition-colors ${
                          isReadOnly ? "" : "cursor-pointer hover:bg-secondary/30"
                        }`}
                      >
                        <Checkbox
                          checked={item.checked}
                          disabled={isReadOnly || checkedMutation.isPending}
                          onCheckedChange={(checked) => handleToggleChecked(item.checklistItemId, checked === true)}
                          className="mt-0.5"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                          )}
                        </div>
                      </label>
                    ),
                  )}
                </div>
              );
            })}

            {isEditable && (
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-2"
                  disabled={!allDocumented || rejectMutation.isPending}
                  onClick={() => setShowRejectDialog(true)}
                >
                  <XCircle className="w-4 h-4" /> Reject
                </Button>
                <Button
                  className="gradient-primary text-white gap-2"
                  disabled={!allDocumented || approveMutation.isPending}
                  onClick={handleApprove}
                >
                  {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Approve
                </Button>
              </div>
            )}
            {isEditable && !allDocumented && (
              <p className="text-xs text-muted-foreground text-right -mt-2">
                Every checklist item must be checked or photographed before you can decide.
              </p>
            )}
          </>
        )}

        <Card className="border-border/40">
          <CardContent className="p-5">
            {/* Comments are only added via the Schedule/Reschedule dialog, not a freeform box here. */}
            <CommentThread applicationId={applicationId} canPost={false} />
          </CardContent>
        </Card>
      </div>

      <ScheduleInspectionDialog
        applicationId={applicationId}
        open={showScheduleDialog}
        onClose={() => setShowScheduleDialog(false)}
        currentScheduledDate={application.scheduledInspectionDate}
      />

      <CameraCaptureDialog
        open={!!cameraTargetItemId}
        onOpenChange={(open) => !open && setCameraTargetItemId(null)}
        onCapture={(file) => {
          if (cameraTargetItemId) handleFileSelected(cameraTargetItemId, file);
          setCameraTargetItemId(null);
        }}
        title="Capture Evidence Photo"
        facingMode="environment"
        allowFileFallbackHint={false}
      />

      <Dialog open={showRejectDialog} onOpenChange={(open) => { setShowRejectDialog(open); if (!open) setRejectReason(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" /> Reject Application
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This is the committee's final decision — the applicant will be notified of the rejection and the reason below.
            </p>
            <Textarea
              placeholder="Reason for rejection (required)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={handleReject}
            >
              {rejectMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Rejection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  IdCard,
  Loader2,
  MapPin,
  Phone,
  Send,
  Undo2,
  UserCheck,
  Users,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { APPLICATION_STATUS_META } from "@/components/DirectorOperationsPortal/CenterApplications/statusMeta";
import { CommitteeAttendanceCard } from "@/components/DirectorOperationsPortal/CenterApplications/CommitteeAttendanceCard";
import { CommentThread } from "@/components/CommentThread";
import { ForwardWithScheduleDialog } from "@/components/committee-chairman/ForwardWithScheduleDialog";
import {
  useChairmanApplicationDetail,
  useForwardChairmanApplication,
  useReturnChairmanApplication,
} from "@/hooks/queries/useCommitteeChairmanQueries";
import { getApiErrorMessage } from "@/lib/errors";
import { directorOperationsCenterApplicationService } from "@/services/centerApplicationService";
import { useToast } from "@/hooks/use-toast";
import { committeeChairmanNavItems } from "../CommitteeChairmanPortal";

const MIN_RETURN_REASON = 5;

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Not scheduled";
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export default function CommitteeChairmanApplicationDetailPage() {
  const { applicationId = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, isLoading, isError, error } = useChairmanApplicationDetail(applicationId);
  const forwardMutation = useForwardChairmanApplication(applicationId);
  const returnMutation = useReturnChairmanApplication(applicationId);

  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  if (isLoading) {
    return (
      <DashboardLayout title="Loading..." portalType="committee-chairman" navItems={committeeChairmanNavItems}>
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (isError || !data) {
    return (
      <DashboardLayout title="Application" portalType="committee-chairman" navItems={committeeChairmanNavItems}>
        <p className="text-sm text-muted-foreground">
          {isError ? getApiErrorMessage(error, "Could not load this application.") : "Application not found."}
        </p>
        <Button variant="ghost" size="sm" className="mt-4 gap-2" onClick={() => navigate("/committee-chairman/applications")}>
          <ArrowLeft className="w-4 h-4" /> Back to applications
        </Button>
      </DashboardLayout>
    );
  }

  const { application, attendance } = data;
  const canAct = application.status === "PENDING_CHAIRMAN_REVIEW";
  const isScheduled = application.status === "SCHEDULED";
  const meta = APPLICATION_STATUS_META[application.status];

  const handleForward = (scheduledInspectionDate: string) => {
    forwardMutation.mutate(scheduledInspectionDate, {
      onSuccess: () => {
        toast({
          title: "Inspection scheduled",
          description: "Committee members can now complete their individual inspection reports.",
        });
        setShowForwardDialog(false);
        navigate("/committee-chairman/applications");
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "Could not forward", description: getApiErrorMessage(err) });
      },
    });
  };

  const handleReturn = () => {
    const reason = returnReason.trim();
    if (reason.length < MIN_RETURN_REASON) {
      toast({ variant: "destructive", title: "Reason too short", description: `Please enter at least ${MIN_RETURN_REASON} characters.` });
      return;
    }
    returnMutation.mutate(reason, {
      onSuccess: () => {
        toast({ title: "Returned to Bureau", description: "The application was sent back unassigned." });
        setShowReturnDialog(false);
        setReturnReason("");
        navigate("/committee-chairman/applications");
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "Could not return", description: getApiErrorMessage(err) });
      },
    });
  };

  return (
    <DashboardLayout
      title={application.centerName || "Center Application"}
      subtitle={application.address || undefined}
      portalType="committee-chairman"
      navItems={committeeChairmanNavItems}
    >
      <div className="max-w-4xl mx-auto space-y-5 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2 w-fit" onClick={() => navigate("/committee-chairman/applications")}>
            <ArrowLeft className="w-4 h-4" /> Back to applications
          </Button>
          <Badge variant={meta?.badgeVariant ?? "outline"} className="gap-1.5 text-xs w-fit">
            <span className={`w-1.5 h-1.5 rounded-full ${meta?.dot ?? "bg-slate-400"}`} />
            {meta?.label ?? application.status}
          </Badge>
        </div>

        {canAct && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <p className="text-sm text-foreground">
                Review the application, pick an inspection date, and forward to all committee members — or return it to the Bureau.
              </p>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Button variant="outline" className="gap-2" onClick={() => setShowReturnDialog(true)} disabled={returnMutation.isPending}>
                  <Undo2 className="w-4 h-4" /> Return to Bureau
                </Button>
                <Button className="gradient-primary text-white gap-2" onClick={() => setShowForwardDialog(true)} disabled={forwardMutation.isPending}>
                  {forwardMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Schedule &amp; forward
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isScheduled && (
          <Card className="border-border/40">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Inspection is scheduled for {formatDate(application.scheduledInspectionDate)}. Review member reports and make the final decision.
              </p>
              <Button
                variant="outline"
                className="shrink-0"
                onClick={() => navigate(`/committee-chairman/inspection-reports/${application.id}`)}
              >
                View inspection reports
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Application details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <IdCard className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">CNIC:</span> {application.cnic}
            </div>
            <div className="flex items-center gap-2">
              <IdCard className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">License:</span> {application.licenseNumber}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">City:</span> {application.city?.name ?? "—"}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Center phone:</span> {application.centerPhone ?? "—"}
            </div>
            <div className="sm:col-span-2 text-muted-foreground">{application.address}</div>
            {application.buildingArea != null && (
              <div className="sm:col-span-2 text-muted-foreground">
                Building: {application.buildingArea} sq ft · capacity {application.buildingCapacity ?? "—"}
                {application.buildingOwnership ? ` · ${application.buildingOwnership}` : ""}
              </div>
            )}
            {application.isJointVenture && (
              <div className="sm:col-span-2 flex items-center gap-2">
                <Badge variant="outline" className="text-[11px]">Joint venture</Badge>
                {application.jointVentureLicenseNumber && (
                  <span className="text-xs text-muted-foreground font-mono">{application.jointVentureLicenseNumber}</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {application.staff.length > 0 && (
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Staff ({application.staff.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {application.staff.map((member) => (
                <div key={member.id} className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-secondary/30">
                  <div className="min-w-0">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      CNIC {member.cnic}{member.qualification ? ` · ${member.qualification}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {member.documentObjectKey && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="View supporting document"
                        onClick={async () => {
                          const blob = await directorOperationsCenterApplicationService.getStaffDocumentBlob(member.id);
                          window.open(URL.createObjectURL(blob), "_blank");
                        }}
                      >
                        <FileText className="w-3.5 h-3.5 text-primary" />
                      </Button>
                    )}
                    <Badge variant="outline" className="text-[11px]">{member.category}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {application.committee && (
          <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" /> Committee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {application.committee.name}</p>
              <ul className="space-y-2">
                {application.committee.members.map((member) => {
                  const name = [member.firstName, member.lastName].filter(Boolean).join(" ") || member.email;
                  return (
                    <li key={member.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-secondary/30">
                      <span>{name}</span>
                      {member.role === "COMMITTEE_CHAIRMAN" ? (
                        <Badge variant="default">Chairman</Badge>
                      ) : (
                        <Badge variant="outline">Member</Badge>
                      )}
                    </li>
                  );
                })}
              </ul>
              {application.inspectionAssignedAt && (
                <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Clock className="w-3.5 h-3.5" /> Assigned {formatDateTime(application.inspectionAssignedAt)}
                </p>
              )}
              {application.scheduledInspectionDate && (
                <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <CalendarClock className="w-3.5 h-3.5" /> Scheduled: {formatDate(application.scheduledInspectionDate)}
                </p>
              )}
              {application.chairmanReviewedAt && (
                <p className="text-xs text-muted-foreground">
                  Chairman reviewed {formatDateTime(application.chairmanReviewedAt)}
                  {application.chairmanReviewedBy
                    ? ` by ${[application.chairmanReviewedBy.firstName, application.chairmanReviewedBy.lastName].filter(Boolean).join(" ") || application.chairmanReviewedBy.email}`
                    : ""}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <CommentThread applicationId={application.id} canPost={true} />

        {application.committee && attendance.length > 0 && <CommitteeAttendanceCard attendance={attendance} />}

        {application.status === "REJECTED" && application.rejectionReason && (
          <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <p className="text-sm font-medium text-destructive mb-1">Rejection reason</p>
            <p className="text-sm text-muted-foreground">{application.rejectionReason}</p>
          </div>
        )}

        {application.status === "APPROVED" && (
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-sm text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Approved {formatDateTime(application.reviewedAt)} — center is live.
            </p>
          </div>
        )}
      </div>

      <ForwardWithScheduleDialog
        open={showForwardDialog}
        onOpenChange={setShowForwardDialog}
        onConfirm={handleForward}
        loading={forwardMutation.isPending}
      />

      <Dialog open={showReturnDialog} onOpenChange={(open) => { if (!open) setReturnReason(""); setShowReturnDialog(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return to Bureau</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="return-reason">Reason for return (required)</Label>
            <Textarea
              id="return-reason"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              rows={4}
              placeholder="Explain what the Bureau or applicant should fix before inspection…"
              disabled={returnMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">At least {MIN_RETURN_REASON} characters.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)} disabled={returnMutation.isPending}>Cancel</Button>
            <Button variant="destructive" onClick={handleReturn} disabled={returnMutation.isPending}>
              {returnMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Return application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

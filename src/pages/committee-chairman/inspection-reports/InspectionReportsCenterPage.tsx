import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  FileCheck,
  Loader2,
  ThumbsDown,
  ThumbsUp,
  UserCheck,
  UserX,
  X,
  XCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useChairmanApplicationDetail,
  useChairmanApprove,
  useChairmanReject,
  useInspectionReports,
} from "@/hooks/queries/useCommitteeChairmanQueries";
import { getApiErrorMessage } from "@/lib/errors";
import { useToast } from "@/hooks/use-toast";
import { committeeChairmanNavItems } from "../../CommitteeChairmanPortal";

const MIN_REJECT_REASON = 5;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function avatarClasses(attending: boolean | null): string {
  if (attending === true) {
    return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  }
  if (attending === false) {
    return "bg-destructive/15 text-destructive";
  }
  return "bg-secondary text-muted-foreground";
}

function memberCardBorder(attending: boolean | null): string {
  if (attending === true) return "border-emerald-500/40";
  if (attending === false) return "border-destructive/40";
  return "border-border/40";
}

export default function InspectionReportsCenterPage() {
  const { applicationId = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: appDetail, isLoading: appLoading } = useChairmanApplicationDetail(applicationId);
  const { data: reports, isLoading: reportsLoading } = useInspectionReports(applicationId);
  const approveMutation = useChairmanApprove(applicationId);
  const rejectMutation = useChairmanReject(applicationId);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const isLoading = appLoading || reportsLoading;
  const application = appDetail?.application;
  const readyToDecide = reports?.readyToDecide ?? false;

  const handleApprove = () => {
    approveMutation.mutate(undefined, {
      onSuccess: () => {
        toast({ title: "Center approved", description: "The center and admin login are now live." });
        navigate("/committee-chairman/inspection-reports");
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "Could not approve", description: getApiErrorMessage(err) });
      },
    });
  };

  const handleReject = () => {
    const reason = rejectReason.trim();
    if (reason.length < MIN_REJECT_REASON) {
      toast({
        variant: "destructive",
        title: "Reason too short",
        description: `Please enter at least ${MIN_REJECT_REASON} characters.`,
      });
      return;
    }
    rejectMutation.mutate(reason, {
      onSuccess: () => {
        toast({ title: "Center rejected" });
        setShowRejectDialog(false);
        navigate("/committee-chairman/inspection-reports");
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "Could not reject", description: getApiErrorMessage(err) });
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Loading..." portalType="committee-chairman" navItems={committeeChairmanNavItems}>
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (!application || !reports) {
    return (
      <DashboardLayout title="Inspection reports" portalType="committee-chairman" navItems={committeeChairmanNavItems}>
        <p className="text-sm text-muted-foreground">Could not load this center.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/committee-chairman/inspection-reports")}>
          Back
        </Button>
      </DashboardLayout>
    );
  }

  const respondedCount = reports.members.filter(
    (m) => m.attending === true || m.attending === false,
  ).length;

  return (
    <DashboardLayout
      title={application.centerName || "Inspection reports"}
      subtitle={application.address || undefined}
      portalType="committee-chairman"
      navItems={committeeChairmanNavItems}
    >
      <div className="max-w-3xl mx-auto space-y-5 pb-12">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 -ml-2"
          onClick={() => navigate("/committee-chairman/inspection-reports")}
        >
          <ArrowLeft className="w-4 h-4" /> All scheduled centers
        </Button>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-border/40 rounded-xl h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-1.5 h-full">
              <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-2xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                {reports.summary.attending}
              </p>
              <p className="text-xs text-muted-foreground">Attending</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 rounded-xl h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-1.5 h-full">
              <UserX className="w-5 h-5 text-destructive" />
              <p className="text-2xl font-semibold tabular-nums text-destructive">
                {reports.summary.notAttending}
              </p>
              <p className="text-xs text-muted-foreground">Not attending</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 rounded-xl h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-1.5 h-full">
              <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <p className="text-2xl font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                {reports.summary.submitted}
              </p>
              <p className="text-xs text-muted-foreground">Submitted</p>
            </CardContent>
          </Card>

          <Card className="border-border/40 rounded-xl h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-1.5 h-full">
              <div className="flex items-stretch w-full">
                <div className="flex-1 flex flex-col items-center gap-1.5 px-1">
                  <ThumbsUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-2xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {reports.summary.recommendApprove}
                  </p>
                </div>
                <div className="w-px bg-border self-stretch my-0.5" />
                <div className="flex-1 flex flex-col items-center gap-1.5 px-1">
                  <ThumbsDown className="w-5 h-5 text-destructive" />
                  <p className="text-2xl font-semibold tabular-nums text-destructive">
                    {reports.summary.recommendReject}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Recommendation</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground px-1">Committee members</h2>
          {reports.members.map((member) => (
            <Card
              key={member.memberUserId}
              className={`${memberCardBorder(member.attending)} ${
                member.submitted ? "cursor-pointer hover:border-primary/30" : ""
              }`}
              onClick={() => {
                if (member.submitted) {
                  navigate(
                    `/committee-chairman/inspection-reports/${applicationId}/members/${member.memberUserId}`,
                  );
                }
              }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarClasses(
                    member.attending,
                  )}`}
                >
                  {initials(member.memberName)}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-medium text-foreground truncate">{member.memberName}</p>
                  {member.attending === true && (
                    <p className="text-xs flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      Attending
                    </p>
                  )}
                  {member.attending === false && (
                    <p className="text-xs flex items-start gap-1.5 text-destructive">
                      <X className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="min-w-0 break-words">
                        {member.absenceReason?.trim() || "Not attending"}
                      </span>
                    </p>
                  )}
                  {member.attending == null && (
                    <p className="text-xs text-muted-foreground">Attendance not set</p>
                  )}
                  {member.submitted && member.recommendation && (
                    <p className="text-xs text-muted-foreground">
                      Recommends <strong className="text-foreground">{member.recommendation}</strong>
                    </p>
                  )}
                </div>

                <Badge variant={member.submitted ? "default" : "outline"} className="shrink-0">
                  {member.submitted ? "Submitted" : "Pending"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Final decision</CardTitle>
            <p className="text-sm text-muted-foreground font-normal">
              {respondedCount} of {reports.members.length} members have responded
            </p>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="border-destructive/40 text-destructive gap-2 flex-1"
              disabled={!readyToDecide || rejectMutation.isPending || approveMutation.isPending}
              onClick={() => setShowRejectDialog(true)}
            >
              <XCircle className="w-4 h-4" /> Reject center
            </Button>
            <Button
              className="gradient-primary text-white gap-2 flex-1"
              disabled={!readyToDecide || approveMutation.isPending || rejectMutation.isPending}
              onClick={handleApprove}
            >
              {approveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Approve center
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this center</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason (required)</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              disabled={rejectMutation.isPending}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending}>
              {rejectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

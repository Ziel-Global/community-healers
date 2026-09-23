import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
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

        <Card className="border-border/40">
          <CardContent className="p-4 text-sm text-muted-foreground flex flex-wrap gap-4">
            <span>Attending: {reports.summary.attending}</span>
            <span>Submitted: {reports.summary.submitted}</span>
            <span>Recommend approve: {reports.summary.recommendApprove}</span>
            <span>Recommend reject: {reports.summary.recommendReject}</span>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground px-1">Committee members</h2>
          {reports.members.map((member) => (
            <Card
              key={member.memberUserId}
              className={`border-border/40 ${member.submitted ? "cursor-pointer hover:border-primary/30" : ""}`}
              onClick={() => {
                if (member.submitted) {
                  navigate(
                    `/committee-chairman/inspection-reports/${applicationId}/members/${member.memberUserId}`,
                  );
                }
              }}
            >
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{member.memberName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {member.attending === false
                      ? `Not attending${member.absenceReason ? `: ${member.absenceReason}` : ""}`
                      : member.attending
                        ? "Attending"
                        : "Attendance not set"}
                  </p>
                  {member.submitted && member.recommendation && (
                    <p className="text-xs mt-1">
                      Recommends <strong>{member.recommendation}</strong>
                    </p>
                  )}
                </div>
                <Badge variant={member.submitted ? "default" : "outline"}>
                  {member.submitted ? "Submitted" : "Pending"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Final decision</CardTitle>
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

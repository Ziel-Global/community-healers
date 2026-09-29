import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  FileCheck,
  Loader2,
  ThumbsDown,
  ThumbsUp,
  UserCheck,
  Users,
  UserX,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
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

const headCell =
  "h-11 px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6d8474] bg-[#f4f7f3]";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function avatarClasses(attending: boolean | null): string {
  if (attending === true) return "bg-[#eef6df] text-[#426f36]";
  if (attending === false) return "bg-red-50 text-red-700";
  return "bg-[#e8f0ea] text-[#6d8474]";
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  iconWell,
  iconColor,
  valueClass,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
  iconWell: string;
  iconColor: string;
  valueClass?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[18px] border border-[#e7eee9] bg-white shadow-[0_10px_30px_#163a2b08]">
      <div className={cn("absolute inset-x-0 top-0 h-[3px]", accent)} />
      <div className="p-4 flex flex-col h-full min-h-[120px]">
        <div className={cn("w-9 h-9 rounded-[11px] flex items-center justify-center", iconWell)}>
          <Icon className={cn("w-4 h-4", iconColor)} strokeWidth={1.75} />
        </div>
        <p className={cn("mt-3 text-2xl font-display font-semibold tabular-nums tracking-tight text-[#183d34]", valueClass)}>
          {value}
        </p>
        <p className="mt-auto pt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#6d8474]">{label}</p>
      </div>
    </div>
  );
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
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const isLoading = appLoading || reportsLoading;
  const application = appDetail?.application;
  const readyToDecide = reports?.readyToDecide ?? false;

  const handleApprove = () => {
    approveMutation.mutate(undefined, {
      onSuccess: () => {
        toast({ title: "Center approved", description: "The center and admin login are now live." });
        setShowApproveDialog(false);
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
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!application || !reports) {
    return (
      <DashboardLayout title="Inspection reports" portalType="committee-chairman" navItems={committeeChairmanNavItems}>
        <p className="text-sm text-[#6d8474]">Could not load this center.</p>
        <Button variant="ghost" className="mt-4 text-[#6d8474]" onClick={() => navigate("/committee-chairman/inspection-reports")}>
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
      <div className="max-w-4xl mx-auto space-y-5 pb-12">
        <Link
          to="/committee-chairman/inspection-reports"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6d8474] hover:text-[#164c3e] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All scheduled centers
        </Link>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Attending"
            value={reports.summary.attending}
            icon={UserCheck}
            accent="bg-[#71a64b]"
            iconWell="bg-[#eef6df]"
            iconColor="text-[#426f36]"
            valueClass="text-[#426f36]"
          />
          <StatCard
            label="Not attending"
            value={reports.summary.notAttending}
            icon={UserX}
            accent="bg-red-500"
            iconWell="bg-red-50"
            iconColor="text-red-600"
            valueClass="text-red-600"
          />
          <StatCard
            label="Submitted"
            value={reports.summary.submitted}
            icon={FileCheck}
            accent="bg-[#164c3e]"
            iconWell="bg-[#e8f0ea]"
            iconColor="text-[#164c3e]"
          />
          <div className="relative overflow-hidden rounded-[18px] border border-[#e7eee9] bg-white shadow-[0_10px_30px_#163a2b08]">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-[#a08a55]" />
            <div className="p-4 flex flex-col h-full min-h-[120px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6d8474]">Recommendation</p>
              <div className="mt-3 flex items-stretch gap-0 flex-1">
                <div className="flex-1 flex flex-col items-center justify-center gap-1">
                  <ThumbsUp className="w-4 h-4 text-[#426f36]" />
                  <p className="text-2xl font-display font-semibold tabular-nums text-[#426f36]">
                    {reports.summary.recommendApprove}
                  </p>
                </div>
                <div className="w-px bg-[#e7eee9] self-stretch my-1" />
                <div className="flex-1 flex flex-col items-center justify-center gap-1">
                  <ThumbsDown className="w-4 h-4 text-red-600" />
                  <p className="text-2xl font-display font-semibold tabular-nums text-red-600">
                    {reports.summary.recommendReject}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-[20px] border border-[#d5e0d4] bg-white overflow-hidden shadow-[0_12px_40px_rgba(22,76,62,0.06)]">
          <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-[#e7eee9]">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6d8474] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Committee
            </p>
            <h2 className="text-lg font-semibold text-[#183d34] tracking-tight mt-0.5">Members</h2>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#e7eee9] hover:bg-[#f4f7f3]">
                  <TableHead className={headCell}>Member</TableHead>
                  <TableHead className={headCell}>Attendance</TableHead>
                  <TableHead className={cn(headCell, "hidden sm:table-cell")}>Recommendation</TableHead>
                  <TableHead className={headCell}>Report</TableHead>
                  <TableHead className={cn(headCell, "w-12 text-right")}>
                    <span className="sr-only">Open</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.members.map((member) => (
                  <TableRow
                    key={member.memberUserId}
                    className={cn(
                      "border-b border-[#e7eee9] last:border-0 transition-colors",
                      member.submitted
                        ? "cursor-pointer hover:bg-[#f8faf7]"
                        : "hover:bg-[#f8faf7]/60"
                    )}
                    onClick={() => {
                      if (member.submitted) {
                        navigate(
                          `/committee-chairman/inspection-reports/${applicationId}/members/${member.memberUserId}`,
                        );
                      }
                    }}
                  >
                    <TableCell className="px-4 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                            avatarClasses(member.attending)
                          )}
                        >
                          {initials(member.memberName)}
                        </div>
                        <p className="text-sm font-semibold text-[#183d34] truncate">{member.memberName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3.5">
                      {member.attending === true && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#426f36]">
                          <Check className="w-3.5 h-3.5" /> Attending
                        </span>
                      )}
                      {member.attending === false && (
                        <div className="min-w-0 max-w-[200px]">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
                            <X className="w-3.5 h-3.5 shrink-0" /> Not attending
                          </span>
                          {member.absenceReason?.trim() && (
                            <p className="text-[11px] text-[#6d8474] mt-0.5 truncate">{member.absenceReason}</p>
                          )}
                        </div>
                      )}
                      {member.attending == null && (
                        <span className="text-xs text-[#93a087]">Not set</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 hidden sm:table-cell">
                      {member.submitted && member.recommendation ? (
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md border",
                            member.recommendation === "APPROVE"
                              ? "border-[#c9dbc0] bg-[#eef6df] text-[#426f36]"
                              : "border-red-200 bg-red-50 text-red-700"
                          )}
                        >
                          {member.recommendation}
                        </span>
                      ) : (
                        <span className="text-xs text-[#93a087]">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3.5">
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md border",
                          member.submitted
                            ? "border-[#c9dbc0] bg-[#eef6df] text-[#426f36]"
                            : "border-[#e7eee9] bg-[#f4f7f3] text-[#6d8474]"
                        )}
                      >
                        {member.submitted ? "Submitted" : "Pending"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-right">
                      {member.submitted ? (
                        <ChevronRight className="w-4 h-4 text-[#c9d6c8] inline-block" />
                      ) : (
                        <span className="inline-block w-4" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="rounded-[20px] border border-[#d5e0d4] bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)] overflow-hidden">
          <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-[#e7eee9]">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6d8474]">Outcome</p>
            <h2 className="text-lg font-semibold text-[#183d34] tracking-tight mt-0.5">Final decision</h2>
            <p className="text-sm text-[#6d8474] mt-1">
              {respondedCount} of {reports.members.length} members have responded
              {!readyToDecide && " — waiting until the committee is ready to decide"}
            </p>
          </div>
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-2.5">
            <Button
              variant="outline"
              className="h-11 gap-2 flex-1 rounded-[10px] border-red-200 text-red-700 hover:bg-red-50"
              disabled={!readyToDecide || rejectMutation.isPending || approveMutation.isPending}
              onClick={() => setShowRejectDialog(true)}
            >
              <XCircle className="w-4 h-4" /> Reject center
            </Button>
            <Button
              className="h-11 gap-2 flex-1 rounded-[10px] bg-[#164c3e] hover:bg-[#12382d] text-white shadow-[0_8px_20px_rgba(22,76,62,0.22)]"
              disabled={!readyToDecide || approveMutation.isPending || rejectMutation.isPending}
              onClick={() => setShowApproveDialog(true)}
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve center
            </Button>
          </div>
        </section>
      </div>

      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="rounded-2xl border-[#d5e0d4] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#183d34]">Approve this center?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#6d8474] leading-relaxed">
            You are about to approve{" "}
            <span className="font-semibold text-[#183d34]">
              {application.centerName || "this center"}
            </span>
            . The center and admin login will go live. This can’t be undone from here.
          </p>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="border-[#c9d6c8] rounded-[10px]"
              onClick={() => setShowApproveDialog(false)}
              disabled={approveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              className="rounded-[10px] bg-[#164c3e] hover:bg-[#12382d] text-white gap-2"
              onClick={handleApprove}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Confirm approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="rounded-2xl border-[#d5e0d4] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#183d34]">Reject this center?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#6d8474] leading-relaxed">
            Rejecting{" "}
            <span className="font-semibold text-[#183d34]">
              {application.centerName || "this center"}
            </span>{" "}
            will close the application. Please provide a clear reason for the record.
          </p>
          <div className="space-y-2">
            <Label htmlFor="reject-reason" className="text-[#183d34]">
              Reason (required)
            </Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              disabled={rejectMutation.isPending}
              placeholder="Explain why this center is being rejected…"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="border-[#c9d6c8] rounded-[10px]"
              onClick={() => setShowRejectDialog(false)}
              disabled={rejectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-[10px] gap-2"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Confirm reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

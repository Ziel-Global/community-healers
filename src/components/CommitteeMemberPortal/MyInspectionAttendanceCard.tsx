import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle, ArrowRight, Clock, Loader2, Pencil, UserCheck, Users, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/errors";
import {
    useCommitteeApplicationDetail,
    useMyInspectionReport,
    useMyRescheduleRequests,
    useRequestReschedule,
    useSetAttendance,
} from "@/hooks/queries/useCommitteeMemberQueries";

/** "Something came up" — request the chairman reschedule or accept this absence. Lives inside the same card since it only makes sense once a member has said they'll attend. */
function RequestRescheduleSection({ applicationId }: { applicationId: string }) {
    const { data: requests } = useMyRescheduleRequests(applicationId);
    const requestMutation = useRequestReschedule(applicationId);
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");

    const pending = requests?.find((r) => r.status === "PENDING") ?? null;

    if (pending) {
        return (
            <div className="p-3.5 rounded-[12px] bg-[#fffbf5] border border-amber-200/80 text-sm text-amber-900 flex items-start gap-2.5">
                <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="min-w-0">
                    <p className="font-medium">Reschedule requested — waiting on the chairman</p>
                    <p className="text-xs text-amber-800/80 mt-0.5">{pending.reason}</p>
                </div>
            </div>
        );
    }

    const handleSubmit = () => {
        if (!reason.trim()) return;
        requestMutation.mutate(reason.trim(), {
            onSuccess: () => {
                toast.success("Reschedule request sent to the chairman");
                setOpen(false);
                setReason("");
            },
            onError: (error) => toast.error(getApiErrorMessage(error, "Failed to send reschedule request")),
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-[#6d8474] hover:text-[#b14c4c] transition-colors py-1"
            >
                <AlertTriangle className="w-3.5 h-3.5" /> Something came up? Request a reschedule
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request a reschedule</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <p className="text-sm text-muted-foreground">
                            This notifies the chairman, who can reschedule the whole inspection or accept just your
                            absence so the rest of the committee can continue.
                        </p>
                        <Textarea
                            placeholder="What came up? (required)"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            disabled={!reason.trim() || requestMutation.isPending}
                            onClick={handleSubmit}
                        >
                            {requestMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                            Send request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

/**
 * "Will you personally attend?" RSVP + the committee's responses + a way
 * into the checklist/report — shared between a Committee Member's and the
 * Committee Chairman's own portals. Both roles hit the same
 * `/internal/committee/*` endpoints with their own userId as the actor, so
 * this card is identical either way; only `inspectionPath` differs (which
 * portal's inspection-work route to continue into).
 *
 * Self-contained: fetches its own data rather than taking it as props, since
 * the two parent pages (Member's ApplicationDetailPage, Chairman's) read the
 * *rest* of the application from differently-shaped endpoints — this one
 * stays on the member-scoped detail query both portals already share.
 */
export function MyInspectionAttendanceCard({
    applicationId,
    inspectionPath,
}: {
    applicationId: string;
    inspectionPath: string;
}) {
    const navigate = useNavigate();
    const { data } = useCommitteeApplicationDetail(applicationId);
    const { data: myReport } = useMyInspectionReport(applicationId);
    const attendanceMutation = useSetAttendance(applicationId);
    const [showDeclineReason, setShowDeclineReason] = useState(false);
    const [declineReason, setDeclineReason] = useState("");
    const [editingAttendance, setEditingAttendance] = useState(false);
    const [confirmAttend, setConfirmAttend] = useState(false);

    if (!data) return null;

    const { application, attendance, myAttendance, myReport: myReportOnDetail, inspection, checklist } = data;
    const submittedAt = myReport?.submittedAt ?? myReportOnDetail?.submittedAt ?? null;
    const isReportSubmitted = !!submittedAt;
    const isScheduled = application.status === "SCHEDULED";
    if (!isScheduled) return null;

    const isEditable = isScheduled && !isReportSubmitted;
    const isAttending = myAttendance?.attending === true;
    const hasResponded = myAttendance?.attending === true || myAttendance?.attending === false;
    const showRsvpControls = isEditable && (!hasResponded || editingAttendance);
    const isInspectionOpen = inspection?.isOpen ?? true;
    const hasStartedChecklist = (checklist ?? []).some((item) => item.checked || item.evidence.length > 0);
    const continueLabel = isReportSubmitted ? "View my report" : hasStartedChecklist ? "Continue inspection" : "Start Inspection";
    const canContinueToInspection = isReportSubmitted || (isAttending && isInspectionOpen);
    const scheduledIso = inspection?.scheduledInspectionDate ?? application.scheduledInspectionDate;
    const scheduledDateLabel = scheduledIso
        ? new Date(scheduledIso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
        : null;

    const handleAttend = () => {
        attendanceMutation.mutate(
            { attending: true },
            {
                onSuccess: () => {
                    toast.success("Marked as attending");
                    setShowDeclineReason(false);
                    setDeclineReason("");
                    setEditingAttendance(false);
                    if (isInspectionOpen) navigate(inspectionPath);
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
        <section className="rounded-[20px] border border-[#d5e0d4] bg-white shadow-[0_12px_40px_rgba(22,76,62,0.06)] overflow-hidden">
            <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-[#e7eee9]">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6d8474] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Committee
                </p>
                <h2 className="text-lg font-semibold text-[#183d34] tracking-tight mt-0.5">My Attendance</h2>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
                {isReportSubmitted && (
                    <div className="p-3.5 rounded-[12px] bg-[#f3f8ed] border border-[#c9dbc0] text-sm text-[#355c45]">
                        Report submitted{submittedAt && ` on ${new Date(submittedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}`}.
                    </div>
                )}

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
                            <AlertDialog open={confirmAttend} onOpenChange={setConfirmAttend}>
                                <Button
                                    className={cn(
                                        "h-11 gap-2 rounded-[10px]",
                                        myAttendance?.attending === true
                                            ? "bg-[#164c3e] hover:bg-[#12382d] text-white shadow-[0_8px_20px_rgba(22,76,62,0.22)]"
                                            : "bg-[#e8f0ea] text-[#164c3e] hover:bg-[#dce8df] border-0",
                                    )}
                                    disabled={attendanceMutation.isPending}
                                    onClick={() => setConfirmAttend(true)}
                                >
                                    <UserCheck className="w-4 h-4" /> I'll Attend
                                </Button>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm you'll attend?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {scheduledDateLabel
                                                ? `You're confirming you'll personally attend the inspection on ${scheduledDateLabel}. The rest of the committee and the chairman will see this.`
                                                : "You're confirming you'll personally attend this inspection. The rest of the committee and the chairman will see this."}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => {
                                                handleAttend();
                                                setConfirmAttend(false);
                                            }}
                                        >
                                            Confirm attendance
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button
                                variant="outline"
                                className={cn(
                                    "h-11 gap-2 rounded-[10px]",
                                    myAttendance?.attending === false
                                        ? "bg-destructive hover:bg-destructive/90 text-white border-destructive"
                                        : "border-[#c9d6c8] text-[#183d34] hover:bg-[#f8faf7]",
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
                                                : "border-red-200 bg-red-50 text-red-700",
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
                        {continueLabel}
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                )}
                {isAttending && !isInspectionOpen && !isReportSubmitted && (
                    <p className="text-xs text-[#6d8474] text-center">
                        Checklist unlocks on the scheduled inspection day.
                    </p>
                )}
                {isEditable && isAttending && <RequestRescheduleSection applicationId={applicationId} />}
            </div>
        </section>
    );
}

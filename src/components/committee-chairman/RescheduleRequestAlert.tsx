import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AlertTriangle, CalendarClock, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { getApiErrorMessage } from "@/lib/errors";
import { useResolveRescheduleRequest } from "@/hooks/queries/useCommitteeChairmanQueries";
import type { RescheduleRequestAlert } from "@/services/committeeChairmanService";

const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * One pending "something came up" flag. Two resolutions: pick a new date for
 * the whole inspection, or accept just this person's absence so the rest of
 * the committee can continue — both call the same resolve endpoint, which
 * decides what "ready to decide" means from here.
 */
export function RescheduleRequestAlertCard({ request }: { request: RescheduleRequestAlert }) {
    const resolveMutation = useResolveRescheduleRequest();
    const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
    const [newDate, setNewDate] = useState("");
    const [confirmAcceptAbsence, setConfirmAcceptAbsence] = useState(false);

    const handleAcceptAbsence = () => {
        resolveMutation.mutate(
            { requestId: request.id, resolution: "ABSENCE_ACCEPTED" },
            {
                onSuccess: () => toast.success(`${request.requestedByName}'s absence accepted — the rest of the committee can continue`),
                onError: (error) => toast.error(getApiErrorMessage(error, "Failed to accept absence")),
            },
        );
    };

    const handleReschedule = () => {
        if (!newDate) return;
        resolveMutation.mutate(
            { requestId: request.id, resolution: "RESCHEDULED", scheduledInspectionDate: newDate },
            {
                onSuccess: () => {
                    toast.success("Inspection rescheduled");
                    setShowRescheduleDialog(false);
                    setNewDate("");
                },
                onError: (error) => toast.error(getApiErrorMessage(error, "Failed to reschedule")),
            },
        );
    };

    return (
        <div className="p-4 rounded-[14px] border border-amber-200/80 bg-[#fffbf5]">
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-amber-900">
                        {request.requestedByName}
                        {request.centerName ? ` — ${request.centerName}` : ""} requested a reschedule
                    </p>
                    <p className="text-xs text-amber-800/80 mt-0.5">{request.reason}</p>
                    <Link
                        to={`/committee-chairman/applications/${request.applicationId}`}
                        className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-900 hover:underline mt-1.5"
                    >
                        View application <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
                <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-amber-300 text-amber-900 hover:bg-amber-100/60"
                    onClick={() => setShowRescheduleDialog(true)}
                    disabled={resolveMutation.isPending}
                >
                    <CalendarClock className="w-3.5 h-3.5" /> Reschedule inspection
                </Button>
                <AlertDialog open={confirmAcceptAbsence} onOpenChange={setConfirmAcceptAbsence}>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-amber-900 hover:bg-amber-100/60"
                        onClick={() => setConfirmAcceptAbsence(true)}
                        disabled={resolveMutation.isPending}
                    >
                        {resolveMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                        Accept absence, continue with others
                    </Button>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Accept {request.requestedByName}'s absence?</AlertDialogTitle>
                            <AlertDialogDescription>
                                They'll be marked as not attending, with the reason they gave. The rest of the
                                committee continues as scheduled, and the decision won't wait on their report.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    handleAcceptAbsence();
                                    setConfirmAcceptAbsence(false);
                                }}
                            >
                                Accept absence
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reschedule inspection</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label htmlFor="new-inspection-date">New inspection date</Label>
                        <Input
                            id="new-inspection-date"
                            type="date"
                            value={newDate}
                            min={todayIso()}
                            onChange={(e) => setNewDate(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            This resolves every pending reschedule request on this application, not just this one.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>Cancel</Button>
                        <Button disabled={!newDate || resolveMutation.isPending} onClick={handleReschedule}>
                            {resolveMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                            Confirm new date
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export function RescheduleRequestAlertList({ requests }: { requests: RescheduleRequestAlert[] }) {
    if (!requests.length) return null;
    return (
        <div className="space-y-3">
            {requests.map((request) => (
                <RescheduleRequestAlertCard key={request.id} request={request} />
            ))}
        </div>
    );
}

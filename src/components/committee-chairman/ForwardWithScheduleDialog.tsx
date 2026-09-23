import { useState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ForwardWithScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (scheduledInspectionDate: string) => void;
  loading?: boolean;
}

export function ForwardWithScheduleDialog({
  open,
  onOpenChange,
  onConfirm,
  loading,
}: ForwardWithScheduleDialogProps) {
  const [date, setDate] = useState("");

  const minDate = new Date().toISOString().slice(0, 10);

  const handleConfirm = () => {
    if (!date) return;
    onConfirm(date);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setDate("");
    onOpenChange(next);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-primary" />
            Schedule and forward to members
          </AlertDialogTitle>
          <AlertDialogDescription>
            Choose the inspection date. All committee members will be notified and can begin their individual
            inspection reports on that visit.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="chairman-inspection-date">Inspection date</Label>
          <Input
            id="chairman-inspection-date"
            type="date"
            min={minDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button
            className="gradient-primary text-white"
            disabled={!date || loading}
            onClick={handleConfirm}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Forward to committee"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

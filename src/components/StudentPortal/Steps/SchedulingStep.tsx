import { WizardStepProps } from "../CandidateWizard";
import { ExamSlotPicker } from "../Scheduling/ExamSlotPicker";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

import { format } from "date-fns";

export function SchedulingStep({ onNext, onBack }: WizardStepProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

  const handleNext = async () => {
    if (!selectedDate) return;

    setIsScheduling(true);
    try {
      // Use local date formatting to prevent timezone shifts
      const examDate = format(selectedDate, 'yyyy-MM-dd');
      await api.post('/candidates/me/schedule', { examDate });

      setIsScheduled(true);
      toast({
        title: "Exam Scheduled",
        description: `Your exam has been scheduled for ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`,
      });

      onNext();
    } catch (error: any) {
      console.error("Scheduling error:", error);
      toast({
        title: "Scheduling Failed",
        description: error.response?.data?.message || "Failed to schedule exam. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const canProceed = selectedDate !== undefined;

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="bg-card border border-border/60 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-3xl text-foreground alumni-sans-title">
              Schedule Your Exam
            </h2>
            <p className="text-sm text-muted-foreground">
              Select your preferred exam date and complete the payment
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <ExamSlotPicker
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onSchedule={handleNext}
          isScheduling={isScheduling}
          isScheduled={isScheduled}
        />
      </div>

      {/* Date Selection Status */}
      {!canProceed && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            ⚠️ Please select an exam date to complete your scheduling
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-border/60">
        <Button onClick={onBack} variant="outline" size="lg" className="group w-full sm:w-auto">
          <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Payment
        </Button>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
            Step 3 of 3 • Scheduling
          </div>
          <Button
            onClick={handleNext}
            size="lg"
            disabled={!canProceed || isScheduling}
            className="group w-full sm:w-auto order-1 sm:order-2"
          >
            {isScheduling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                Complete Registration
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

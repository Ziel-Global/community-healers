import { useTranslation } from "react-i18next";
import { WizardStepProps } from "../CandidateWizard";
import { ExamSlotPicker } from "../Scheduling/ExamSlotPicker";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

import { format } from "date-fns";

export function SchedulingStep({ onNext, onBack }: WizardStepProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

  const handleNext = async () => {
    if (!selectedDate) return;

    setIsScheduling(true);
    try {
      // Standard format YYYY-MM-DD for backend
      const examDate = format(selectedDate, 'yyyy-MM-dd');
      await api.post('/candidates/me/schedule', { examDate });

      setIsScheduled(true);
      toast({
        title: t('scheduling.examScheduledTitle'),
        description: t('scheduling.examScheduledDesc', { date: format(selectedDate, 'EEEE, MMMM d, yyyy') }),
      });

      onNext();
    } catch (error: any) {
      console.error("Scheduling error details:", error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || t('scheduling.failedToSchedule');
      toast({
        title: t('scheduling.schedulingFailed'),
        description: errorMessage,
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
              {t('scheduling.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('scheduling.description')}
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
            {t('scheduling.warning')}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-border/60">
        <Button onClick={onBack} variant="outline" size="lg" className="group w-full sm:w-auto">
          <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          {t('scheduling.backToPayment')}
        </Button>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
            {t('scheduling.stepInfo')}
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
                {t('scheduling.scheduling')}
              </>
            ) : (
              <>
                {t('scheduling.completeRegistration')}
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

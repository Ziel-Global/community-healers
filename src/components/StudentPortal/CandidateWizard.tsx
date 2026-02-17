import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WizardStep {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType<WizardStepProps>;
}

export interface WizardStepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

interface CandidateWizardProps {
  steps: WizardStep[];
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
}

export function CandidateWizard({ steps, initialStep = 0, onStepChange, onComplete }: CandidateWizardProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set(prev).add(currentStep));
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange?.(nextStep);
    } else {
      // Last step completed
      setCompletedSteps(prev => new Set(prev).add(currentStep));
      onComplete?.();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Step Progress Indicator */}
      <div className="mb-4 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card border border-border/60 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <h2 className="font-bold text-xl sm:text-3xl text-foreground alumni-sans-title">
              {t('wizard.applicationProgress')}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {t('wizard.completeAllSteps')}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs sm:text-sm text-muted-foreground">{t('wizard.currentStep')}</p>
            <p className="text-xl sm:text-2xl font-bold text-primary">
              {currentStep + 1}/{steps.length}
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-4 sm:top-5 left-0 right-0 h-0.5 bg-border/40">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{
                width: `${(currentStep / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          {/* Steps */}
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;
            const isPast = index < currentStep;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center gap-1 sm:gap-2 relative z-10"
                style={{ width: `${100 / steps.length}%` }}
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted || isPast
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : isCurrent
                        ? "bg-primary/20 border-2 border-primary text-primary animate-pulse"
                        : "bg-secondary border-2 border-border text-muted-foreground"
                    }`}
                >
                  {isCompleted || isPast ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Circle className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" />
                  )}
                </div>
                <div className="text-center px-1">
                  <p
                    className={`text-[10px] sm:text-xs font-medium ${isCurrent
                        ? "text-primary font-semibold"
                        : isCompleted || isPast
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[8px] sm:text-[10px] text-muted-foreground hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="mt-4 sm:mt-8">
        <CurrentStepComponent
          onNext={handleNext}
          onBack={handleBack}
          isFirstStep={currentStep === 0}
          isLastStep={currentStep === steps.length - 1}
        />
      </div>
    </div>
  );
}

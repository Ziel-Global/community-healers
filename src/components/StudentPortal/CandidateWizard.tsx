import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { StepSuccessModal } from "./StepSuccessModal";

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
  isRepayment?: boolean;
  onRequiresRepayment?: () => void;
}

interface CandidateWizardProps {
  steps: WizardStep[];
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
  isRepayment?: boolean;
  onRequiresRepayment?: () => void;
}

export function CandidateWizard({
  steps,
  initialStep = 0,
  onStepChange,
  onComplete,
  isRepayment = false,
  onRequiresRepayment,
}: CandidateWizardProps) {
  const { t } = useTranslation();
  const clampStep = (step: number) =>
    Math.min(Math.max(step, 0), Math.max(steps.length - 1, 0));
  const [currentStep, setCurrentStep] = useState(() => clampStep(initialStep));
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [successModalData, setSuccessModalData] = useState<{ open: boolean; titleEn: string; titleUr: string }>({
    open: false,
    titleEn: "",
    titleUr: "",
  });

  useEffect(() => {
    setCurrentStep(clampStep(initialStep));
  }, [initialStep, steps.length]);

  // The repayment flow changes the wizard from three steps to two. Use a
  // safe index while React applies the new URL step, so a scheduling error
  // cannot briefly try to render steps[2] from the two-step wizard.
  const safeCurrentStep = clampStep(currentStep);

  const handleNext = () => {
    const currentStepObj = steps[safeCurrentStep];
    
    // Determine the right text based on the step id
    let titleEn = "Step completed successfully.";
    let titleUr = "مرحلہ کامیابی سے مکمل ہو گیا۔";
    
    if (currentStepObj.id === 1) { // Registration
      titleEn = "Registration completed successfully.";
      titleUr = "رجسٹریشن کامیابی سے مکمل ہو گئی۔";
    } else if (currentStepObj.id === 2) { // Payment
      titleEn = "Payment verified successfully.";
      titleUr = "ادائیگی کی تصدیق کامیابی سے ہو گئی۔";
    } else if (currentStepObj.id === 3) { // Scheduling
      titleEn = "Exam scheduled successfully.";
      titleUr = "امتحان کا شیڈول کامیابی سے طے ہو گیا۔";
    }

    setSuccessModalData({
      open: true,
      titleEn,
      titleUr,
    });

    // Auto-advance after 3 seconds
    setTimeout(() => {
      setSuccessModalData(prev => ({ ...prev, open: false }));
      
      if (safeCurrentStep < steps.length - 1) {
        setCompletedSteps(prev => new Set(prev).add(safeCurrentStep));
        const nextStep = safeCurrentStep + 1;
        setCurrentStep(nextStep);
        onStepChange?.(nextStep);
      } else {
        // Last step completed
        setCompletedSteps(prev => new Set(prev).add(safeCurrentStep));
        onComplete?.();
      }
    }, 3000);
  };

  const handleBack = () => {
    if (safeCurrentStep > 0) {
      const prevStep = safeCurrentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
    }
  };

  const CurrentStepComponent = steps[safeCurrentStep]?.component;

  if (!CurrentStepComponent) {
    return null;
  }

  const progressPct =
    steps.length > 1 ? (safeCurrentStep / (steps.length - 1)) * 100 : 100;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-5 sm:mb-8 rounded-2xl border border-[#e7eee9] bg-white p-5 sm:p-7 shadow-[0_8px_30px_#163a2b08]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#42634f] mb-2 flex items-center gap-2">
              <span className="block w-5 h-0.5 bg-[#3a725b]" />
              {t('wizard.applicationProgress')}
            </p>
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-[#183d34] tracking-tight">
              {t('wizard.completeAllSteps')}
            </h2>
          </div>
          <div className="text-left sm:text-right rounded-xl bg-[#f5f8f2] border border-[#e7eee9] px-4 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-[#658075]">{t('wizard.currentStep')}</p>
            <p className="text-xl font-display font-bold text-primary">
              {safeCurrentStep + 1}
              <span className="text-[#a0ad94] font-medium">/{steps.length}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-[8%] right-[8%] h-0.5 bg-[#dde9db]">
            <div
              className="h-full bg-[#71a64b] transition-all duration-500 shadow-[0_0_10px_#94d66466]"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === safeCurrentStep;
            const isPast = index < safeCurrentStep;
            const done = isCompleted || isPast;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center gap-2 relative z-10"
                style={{ width: `${100 / steps.length}%` }}
              >
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-[14px] flex items-center justify-center transition-all duration-300 border ${
                    done
                      ? "bg-[#e7f2db] border-[#c7ddb5] text-[#426f36]"
                      : isCurrent
                        ? "bg-primary border-primary text-[#d7f88c] shadow-[0_0_0_6px_#d4e9bb50] -translate-y-0.5"
                        : "bg-[#f4f7f2] border-[#e0e9dc] text-[#8b9b8a]"
                  }`}
                >
                  {done ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                  ) : (
                    <span className="text-xs sm:text-sm font-display font-semibold">
                      {index + 1}
                    </span>
                  )}
                </div>
                <div className="text-center px-1">
                  <p
                    className={`text-[11px] sm:text-xs font-semibold ${
                      isCurrent
                        ? "text-[#173e30]"
                        : done
                          ? "text-[#355c45]"
                          : "text-[#8b9b8a]"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10px] text-[#6d7b70] hidden sm:block mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        <CurrentStepComponent
          onNext={handleNext}
          onBack={handleBack}
          isFirstStep={safeCurrentStep === 0}
          isLastStep={safeCurrentStep === steps.length - 1}
          isRepayment={isRepayment}
          onRequiresRepayment={onRequiresRepayment}
        />
      </div>

      <StepSuccessModal
        open={successModalData.open}
        titleEn={successModalData.titleEn}
        titleUr={successModalData.titleUr}
      />
    </div>
  );
}

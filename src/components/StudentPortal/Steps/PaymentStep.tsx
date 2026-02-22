import { useTranslation } from "react-i18next";
import { WizardStepProps } from "../CandidateWizard";
import { FeePaymentCard } from "../Payments/FeePaymentCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Wallet, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export function PaymentStep({ onNext, onBack }: WizardStepProps) {
  const { t } = useTranslation();
  const [isPaid, setIsPaid] = useState(false);
  const [isQRGenerated, setIsQRGenerated] = useState(false);

  const handleGenerateQR = () => {
    setIsQRGenerated(true);
  };

  const handlePayment = () => {
    // Payment logic would go here
    setIsPaid(true);
  };

  const handleNext = () => {
    if (isPaid) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="bg-card border border-border/60 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">
              {t('payment.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('payment.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Card - Centered */}
      <div className="max-w-md mx-auto">
        <FeePaymentCard
          type="registration"
          amount={3000}
          isPaid={isPaid}
          isQRGenerated={isQRGenerated}
          onPay={handlePayment}
          onGenerateQR={handleGenerateQR}
        />
      </div>

      {/* Success Message */}
      {isPaid && (
        <div className="max-w-md mx-auto bg-green-500/10 border border-green-500/30 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-semibold text-foreground">{t('payment.successful')}</p>
              <p className="text-sm text-muted-foreground">{t('payment.successDesc')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Warning */}
      {!isPaid && (
        <div className="max-w-md mx-auto bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            {t('payment.warning')}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-border/60">
        <Button onClick={onBack} variant="outline" size="lg" className="group w-full sm:w-auto">
          <ChevronLeft className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 rtl:-scale-x-100 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
          {t('payment.backToRegistration')}
        </Button>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
            {t('payment.stepInfo')}
          </div>
          <Button
            onClick={handleNext}
            size="lg"
            disabled={!isPaid}
            className="group w-full sm:w-auto order-1 sm:order-2"
          >
            {t('payment.continueToScheduling')}
            <ChevronRight className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0 rtl:-scale-x-100 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}

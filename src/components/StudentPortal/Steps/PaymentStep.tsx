import { useTranslation } from "react-i18next";
import { WizardStepProps } from "../CandidateWizard";
import { FeePaymentCard } from "../Payments/FeePaymentCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Wallet, CheckCircle2, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  usePaymentStatus,
  useInitiatePayment,
  useConfirmPayment,
} from "@/hooks/queries/useCandidateQueries";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/errors";
import { getSecondsUntilExpiry } from "@/utils/payment";

interface ActivePaymentDetails {
  transactionId: string;
  orderId: string;
  amount: number;
  expiresAt: string | null;
  qrCodeBase64: string | null;
  paidAt: string | null;
}

export function PaymentStep({ onNext, onBack, isFirstStep, isRepayment = false }: WizardStepProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  // DEV covers local `vite dev`; VITE_ENABLE_PAYMENT_SIMULATION is the
  // build-time opt-in for staging/test deployments that need the same
  // bypass without a real bank payment. Never set it on a production build.
  const isLocalDev = import.meta.env.DEV || import.meta.env.VITE_ENABLE_PAYMENT_SIMULATION === "true";

  const [isPaid, setIsPaid] = useState(false);
  const [isQRGenerated, setIsQRGenerated] = useState(false);
  const [isQrExpired, setIsQrExpired] = useState(false);
  const [expirySecondsLeft, setExpirySecondsLeft] = useState<number | null>(null);
  const [activePayment, setActivePayment] = useState<ActivePaymentDetails | null>(null);

  const shouldPollStatus = isQRGenerated && !isPaid;
  const {
    data: paymentStatusData,
    isLoading: isCheckingStatus,
    refetch: refetchPaymentStatus,
  } = usePaymentStatus({
    enabled: !isRepayment || isQRGenerated || isPaid,
    refetchInterval: shouldPollStatus ? 3000 : false,
  });

  const initiatePaymentMutation = useInitiatePayment();
  const confirmPaymentMutation = useConfirmPayment();

  const applyPaidState = useCallback((details: Partial<ActivePaymentDetails>) => {
    setIsPaid(true);
    setIsQRGenerated(false);
    setIsQrExpired(false);
    setExpirySecondsLeft(null);
    setActivePayment((prev) => ({
      transactionId: details.transactionId ?? prev?.transactionId ?? "",
      orderId: details.orderId ?? prev?.orderId ?? "",
      amount: details.amount ?? prev?.amount ?? 0,
      expiresAt: null,
      qrCodeBase64: null,
      paidAt: details.paidAt ?? new Date().toISOString(),
    }));
  }, []);

  const applyInitiatedState = useCallback((details: ActivePaymentDetails) => {
    setIsPaid(false);
    setIsQRGenerated(true);
    setIsQrExpired(false);
    setActivePayment(details);
  }, []);

  useEffect(() => {
    if (isRepayment || !paymentStatusData) return;

    if (paymentStatusData.status === "PAID" || paymentStatusData.canProceedToExam) {
      applyPaidState({
        transactionId: paymentStatusData.transactionId ?? undefined,
        orderId: paymentStatusData.orderId ?? undefined,
        amount: paymentStatusData.amount ?? undefined,
        paidAt: paymentStatusData.paidAt ?? undefined,
      });
      return;
    }

    if (
      paymentStatusData.status === "INITIATED" &&
      paymentStatusData.qrCodeBase64 &&
      paymentStatusData.transactionId
    ) {
      const secondsLeft = getSecondsUntilExpiry(paymentStatusData.expiresAt);
      if (secondsLeft === 0) {
        setIsQrExpired(true);
        setIsQRGenerated(false);
        return;
      }

      applyInitiatedState({
        transactionId: paymentStatusData.transactionId,
        orderId: paymentStatusData.orderId ?? "",
        amount: paymentStatusData.amount ?? 0,
        expiresAt: paymentStatusData.expiresAt ?? null,
        qrCodeBase64: paymentStatusData.qrCodeBase64,
        paidAt: null,
      });
    }
  }, [paymentStatusData, isRepayment, applyPaidState, applyInitiatedState]);

  useEffect(() => {
    if (!shouldPollStatus || !paymentStatusData) return;

    if (paymentStatusData.status === "PAID" || paymentStatusData.canProceedToExam) {
      applyPaidState({
        transactionId: paymentStatusData.transactionId ?? undefined,
        orderId: paymentStatusData.orderId ?? undefined,
        amount: paymentStatusData.amount ?? undefined,
        paidAt: paymentStatusData.paidAt ?? undefined,
      });
    }
  }, [paymentStatusData, shouldPollStatus, applyPaidState]);

  useEffect(() => {
    if (!isQRGenerated || !activePayment?.expiresAt || isPaid) {
      setExpirySecondsLeft(null);
      return;
    }

    const tick = () => {
      const secondsLeft = getSecondsUntilExpiry(activePayment.expiresAt);
      if (secondsLeft === null) return;

      if (secondsLeft <= 0) {
        setIsQrExpired(true);
        setIsQRGenerated(false);
        setExpirySecondsLeft(0);
        return;
      }

      setExpirySecondsLeft(secondsLeft);
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [isQRGenerated, activePayment?.expiresAt, isPaid]);

  const handleGenerateQR = () => {
    if (isCheckingStatus || initiatePaymentMutation.isPending) return;

    initiatePaymentMutation.mutate(undefined, {
      onSuccess: (data) => {
        if (data?.qrCodeBase64 && data?.transactionId) {
          applyInitiatedState({
            transactionId: data.transactionId,
            orderId: data.orderId ?? "",
            amount: data.amount ?? 0,
            expiresAt: data.expiresAt ?? null,
            qrCodeBase64: data.qrCodeBase64,
            paidAt: null,
          });
          void refetchPaymentStatus();
        } else {
          toast({
            title: t("payment.qrErrorTitle"),
            description: t("payment.qrErrorDesc"),
            variant: "destructive",
          });
        }
      },
      onError: (error) => {
        toast({
          title: t("payment.qrErrorTitle"),
          description: getApiErrorMessage(error, t("payment.qrErrorRetry")),
          variant: "destructive",
        });
      },
    });
  };

  const handleSimulateLocalPayment = () => {
    const transactionId = activePayment?.transactionId;
    if (!transactionId) return;

    confirmPaymentMutation.mutate(
      {
        transactionId,
        bankTransactionRef: `LOCAL-STAN-${Date.now()}`,
      },
      {
        onSuccess: () => {
          applyPaidState({
            transactionId,
            orderId: activePayment?.orderId,
            amount: activePayment?.amount,
            paidAt: new Date().toISOString(),
          });
          toast({
            title: t("payment.simulateSuccessTitle"),
            description: t("payment.simulateSuccessDesc"),
          });
        },
        onError: (error) => {
          toast({
            title: t("payment.simulateErrorTitle"),
            description: getApiErrorMessage(error, t("payment.simulateErrorDesc")),
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleNext = () => {
    if (isPaid) {
      onNext();
    }
  };

  const displayAmount = activePayment?.amount ?? paymentStatusData?.amount ?? undefined;
  const qrCodeBase64 =
    initiatePaymentMutation.data?.qrCodeBase64 ??
    activePayment?.qrCodeBase64 ??
    paymentStatusData?.qrCodeBase64 ??
    null;

  return (
    <div className="space-y-8 relative">
      {isCheckingStatus && !isQRGenerated && !isPaid && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">
              {t("payment.loadingStatus")}
            </p>
          </div>
        </div>
      )}

      <div className="bg-card border border-border/60 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">
              {isRepayment ? t("payment.repaymentTitle") : t("payment.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isRepayment ? t("payment.repaymentDescription") : t("payment.description")}
            </p>
          </div>
        </div>
      </div>

      {isRepayment && (
        <div className="max-w-md mx-auto bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {t("payment.repaymentNotice")}
          </p>
        </div>
      )}

      {isQrExpired && !isPaid && (
        <div className="max-w-md mx-auto bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3">
          <RefreshCw className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-destructive">{t("payment.qrExpiredTitle")}</p>
            <p className="text-sm text-muted-foreground">{t("payment.qrExpiredDesc")}</p>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto">
        <FeePaymentCard
          type={isRepayment ? "exam" : "registration"}
          amount={displayAmount}
          isPaid={isPaid}
          isQRGenerated={isQRGenerated}
          isLoadingQR={initiatePaymentMutation.isPending}
          qrCodeBase64={qrCodeBase64}
          isPolling={shouldPollStatus}
          isLoadingSimulate={confirmPaymentMutation.isPending}
          isLocalDev={isLocalDev}
          expirySecondsLeft={expirySecondsLeft}
          transactionId={activePayment?.transactionId}
          orderId={activePayment?.orderId}
          paidAt={activePayment?.paidAt}
          onGenerateQR={handleGenerateQR}
          onSimulateLocalPayment={handleSimulateLocalPayment}
        />
      </div>

      {isPaid && (
        <div className="max-w-md mx-auto bg-green-500/10 border border-green-500/30 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-semibold text-foreground">{t("payment.successful")}</p>
              <p className="text-sm text-muted-foreground">{t("payment.successDesc")}</p>
            </div>
          </div>
        </div>
      )}

      {!isPaid && !isRepayment && (
        <div className="max-w-md mx-auto bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-sm text-amber-700 dark:text-amber-400">{t("payment.warning")}</p>
        </div>
      )}

      {isLocalDev && isQRGenerated && !isPaid && (
        <div className="max-w-md mx-auto bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">{t("payment.localDevHint")}</p>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-border/60">
        {!isFirstStep && !isRepayment ? (
          <Button onClick={onBack} variant="outline" size="lg" className="group w-full sm:w-auto">
            <ChevronLeft className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 rtl:-scale-x-100 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
            {t("payment.backToRegistration")}
          </Button>
        ) : (
          <div className="hidden sm:block" />
        )}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
            {isRepayment ? t("payment.repaymentStepInfo") : t("payment.stepInfo")}
          </div>
          <Button
            onClick={handleNext}
            size="lg"
            disabled={!isPaid}
            className="group w-full sm:w-auto order-1 sm:order-2"
          >
            {t("payment.continueToScheduling")}
            <ChevronRight className="w-4 h-4 ml-2 rtl:mr-2 rtl:ml-0 rtl:-scale-x-100 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}

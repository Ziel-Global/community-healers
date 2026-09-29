import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  ArrowRight,
  Landmark,
  Loader2,
  QrCode,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatExpiryCountdown,
  formatPaymentAmount,
  formatPaymentDate,
  toQrImageSrc,
} from "@/utils/payment";

interface FeePaymentCardProps {
  type: "registration" | "exam";
  amount?: number | null;
  isPaid?: boolean;
  isQRGenerated?: boolean;
  isLoadingQR?: boolean;
  isPolling?: boolean;
  isLoadingSimulate?: boolean;
  isLocalDev?: boolean;
  expirySecondsLeft?: number | null;
  qrCodeBase64?: string | null;
  transactionId?: string | null;
  orderId?: string | null;
  paidAt?: string | null;
  onGenerateQR?: () => void;
  onSimulateLocalPayment?: () => void;
}

export function FeePaymentCard({
  type,
  amount,
  isPaid = false,
  isQRGenerated = false,
  isLoadingQR = false,
  isPolling = false,
  isLoadingSimulate = false,
  isLocalDev = false,
  expirySecondsLeft = null,
  qrCodeBase64 = null,
  transactionId = null,
  orderId = null,
  paidAt = null,
  onGenerateQR,
  onSimulateLocalPayment,
}: FeePaymentCardProps) {
  const { t } = useTranslation();
  const title = type === "registration" ? t("payment.registrationFee") : t("payment.examFee");
  const description =
    type === "registration" ? t("payment.registrationFeeDesc") : t("payment.examFeeDesc");
  const qrImageSrc = toQrImageSrc(qrCodeBase64);
  const showGenerateButton = !isPaid && (!isQRGenerated || !qrImageSrc);

  return (
    <Card
      className={cn(
        "border-[#e7eee9] overflow-hidden text-card-foreground rounded-2xl shadow-[0_8px_24px_#163a2b08]",
        isPaid && "ring-1 ring-[#c7ddb5]",
      )}
    >
      <div className={cn("h-1.5", isPaid ? "bg-[#71a64b]" : "bg-primary")} />
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl sm:text-2xl font-display font-semibold text-[#183d34] tracking-tight">{title}</CardTitle>
            <CardDescription className="text-[#64736d]">{description}</CardDescription>
          </div>
          {isPaid && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e7f2db] border border-[#c7ddb5] text-[#426f36] text-xs font-bold uppercase tracking-wider shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t("payment.paid")}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">
            PKR {amount != null ? formatPaymentAmount(amount) : "—"}
          </span>
          <span className="text-muted-foreground text-sm font-medium">
            {t("payment.includedTaxes")}
          </span>
        </div>

        {!isPaid ? (
          <div className="space-y-4 text-center">
            {showGenerateButton ? (
              <Button
                onClick={onGenerateQR}
                disabled={isLoadingQR}
                className="w-full h-12 ss-cta"
              >
                {isLoadingQR ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("payment.generatingQr")}
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    {t("payment.generateQr")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="bg-white p-4 rounded-xl inline-block border-2 border-primary/20 shadow-sm mx-auto">
                  {qrImageSrc ? (
                    <img
                      src={qrImageSrc}
                      alt={t("payment.qrAlt")}
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-muted-foreground text-sm">
                      {t("payment.qrUnavailable")}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t("payment.scanQr", {
                      amount: amount != null ? formatPaymentAmount(amount) : "—",
                    })}
                  </p>

                  {expirySecondsLeft != null && expirySecondsLeft > 0 && (
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                      {t("payment.qrExpiresIn", {
                        time: formatExpiryCountdown(expirySecondsLeft),
                      })}
                    </p>
                  )}

                  {isPolling && (
                    <div className="flex items-center justify-center gap-2 text-sm text-primary">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("payment.waitingForPayment")}
                    </div>
                  )}
                </div>

                {transactionId && (
                  <div className="rounded-lg border border-border/50 bg-secondary/20 px-3 py-2 text-left text-xs space-y-1">
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">{t("payment.transactionId")}</span>
                      <span className="font-mono font-medium break-all">{transactionId}</span>
                    </div>
                    {orderId && (
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">{t("payment.orderId")}</span>
                        <span className="font-mono font-medium break-all">{orderId}</span>
                      </div>
                    )}
                  </div>
                )}

                {isLocalDev && onSimulateLocalPayment && (
                  <div className="space-y-2 pt-2 border-t border-dashed">
                    <p className="text-xs text-muted-foreground">{t("payment.simulateLocalHint")}</p>
                    <Button
                      onClick={onSimulateLocalPayment}
                      disabled={isLoadingSimulate}
                      variant="outline"
                      className="w-full h-11 border-[#bdcfc2] text-[#355c45] hover:bg-[#f3f8ed]"
                    >
                      {isLoadingSimulate ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t("payment.simulatingPayment")}
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          {t("payment.simulateLocalPayment")}
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <Button
                  onClick={onGenerateQR}
                  disabled={isLoadingQR}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  {isLoadingQR ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {t("payment.regenerateQr")}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 space-y-2">
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{t("payment.transactionId")}</span>
                <span className="font-mono font-medium break-all text-end">
                  {transactionId || "—"}
                </span>
              </div>
              {orderId && (
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{t("payment.orderId")}</span>
                  <span className="font-mono font-medium break-all text-end">{orderId}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("payment.paymentDate")}</span>
                <span className="font-medium">{formatPaymentDate(paidAt)}</span>
              </div>
              <div className="flex justify-between text-sm text-success pt-2 border-t border-border/20">
                <span className="font-semibold">{t("payment.status")}</span>
                <span className="font-bold">{t("payment.success")}</span>
              </div>
            </div>
            <Button variant="outline" className="w-full h-10 gap-2" disabled>
              <Landmark className="w-4 h-4" />
              {t("payment.downloadReceipt")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Wallet, Landmark, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeePaymentCardProps {
    type: "registration" | "exam";
    amount: number;
    isPaid?: boolean;
    onPay?: () => void;
}

export function FeePaymentCard({ type, amount, isPaid = false, onPay }: FeePaymentCardProps) {
    const { t } = useTranslation();
    const title = type === "registration" ? t('payment.registrationFee') : t('payment.examFee');
    const description = type === "registration"
        ? t('payment.registrationFeeDesc')
        : t('payment.examFeeDesc');

    return (
        <Card className={cn(
            "border-border/40 overflow-hidden text-card-foreground",
            isPaid ? "ring-2 ring-success/30" : "shadow-md"
        )}>
            <div className={cn(
                "h-2",
                isPaid ? "bg-success" : "gradient-primary"
            )} />
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold alumni-sans-title">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    {isPaid && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t('payment.paid')}
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">PKR {amount.toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm font-medium">{t('payment.includedTaxes')}</span>
                </div>

                {!isPaid ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/50 hover:border-primary/30 transition-all gap-2 group">
                                <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-xs font-semibold">{t('payment.creditDebit')}</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/60 bg-secondary/30 hover:bg-secondary/50 hover:border-primary/30 transition-all gap-2 group">
                                <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <Wallet className="w-5 h-5 text-primary" />
                                </div>
                                <span className="text-xs font-semibold">{t('payment.mobileWallet')}</span>
                            </button>
                        </div>

                        <Button onClick={onPay} className="w-full h-12 gradient-white font-semibold text-white shadow-royal hover:opacity-90">
                            {t('payment.payNow')}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-secondary/20 border border-border/40 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t('payment.transactionId')}</span>
                                <span className="font-mono font-medium">#CP-98124712</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{t('payment.paymentDate')}</span>
                                <span className="font-medium">Jan 20, 2024</span>
                            </div>
                            <div className="flex justify-between text-sm text-success pt-2 border-t border-border/20">
                                <span className="font-semibold">{t('payment.status')}</span>
                                <span className="font-bold">{t('payment.success')}</span>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full h-10 gap-2">
                            <Landmark className="w-4 h-4" />
                            {t('payment.downloadReceipt')}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

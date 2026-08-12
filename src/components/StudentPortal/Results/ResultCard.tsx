import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, XCircle, ArrowRight, Download, RefreshCw, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultProps {
    score: number;
    status: "pass" | "fail" | "absent";
    date: string;
}

export function ResultCard({ score, status, date }: ResultProps) {
    const { t } = useTranslation();
    const isPass = status === "pass";

    return (
        <Card className="border-border/40 shadow-royal overflow-hidden max-w-2xl mx-auto">
            <div className={cn(
                "h-2",
                isPass ? "bg-success" : "bg-destructive"
            )} />
            <CardHeader className="text-center space-y-4 py-8">
                <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center shadow-lg relative">
                    <div className={cn(
                        "absolute inset-0 rounded-full animate-ping opacity-20",
                        isPass ? "bg-success" : "bg-destructive"
                    )} />
                    <div className={cn(
                        "w-full h-full rounded-full flex items-center justify-center relative z-10",
                        isPass ? "bg-success text-white" : "bg-destructive text-white"
                    )}>
                        {isPass ? <Award className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                    </div>
                </div>
                <div>
                    <CardTitle className="text-3xl font-display font-bold">
                        {isPass ? t('examResult.passedTitle') : t('examResult.failedTitle')}
                    </CardTitle>
                    <CardDescription className="text-lg">
                        {isPass
                            ? t('examResult.passedMessage')
                            : status === "absent" ? t('examResult.absentMessage') : t('examResult.failedMessage')}
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent className="space-y-8 pb-10">
                <div className="flex justify-center items-center gap-12">
                    <div className="text-center">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{t('examResult.yourScore')}</p>
                        <p className={cn(
                            "text-5xl font-display font-black",
                            isPass ? "text-success" : "text-destructive"
                        )}>{score}%</p>
                    </div>
                    <div className="h-12 w-px bg-border/60" />
                    <div className="text-center">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{t('examResult.status')}</p>
                        <Badge variant={isPass ? "success" : "destructive"} className="px-4 py-1 text-sm font-bold uppercase tracking-wider">
                            {status}
                        </Badge>
                    </div>
                </div>

                <div className="bg-secondary/20 rounded-2xl p-6 border border-border/40 space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{t('examResult.examinationDate')}</span>
                        <span className="font-semibold">{date}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{t('examResult.passingThreshold')}</span>
                        <span className="font-semibold">60%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{t('examResult.totalQuestions')}</span>
                        <span className="font-semibold">20</span>
                    </div>
                </div>

                {isPass ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-4 items-center">
                            <Star className="w-6 h-6 text-primary" />
                            <p className="text-sm font-medium text-foreground">
                                {t('examResult.certificateProcessing')}
                            </p>
                        </div>
                        <Button className="w-full h-12 gradient-primary text-white font-bold gap-2 shadow-lg">
                            <Download className="w-4 h-4" /> {t('examResult.goToCertificates')}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-center text-sm text-muted-foreground">
                            {t('examResult.reattemptEligible')}
                        </p>
                        <Button className="w-full h-12 gradient-secondary font-bold gap-2 shadow-md">
                            <RefreshCw className="w-4 h-4" /> {t('examResult.scheduleReattempt')}
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

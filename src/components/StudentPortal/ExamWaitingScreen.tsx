import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, MapPin, AlertCircle, CheckCircle2, PlayCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface ExamWaitingScreenProps {
  examDate: Date;
  onStartExam: () => void;
}

export function ExamWaitingScreen({ examDate, onStartExam }: ExamWaitingScreenProps) {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [canStartExam, setCanStartExam] = useState(false);

  useEffect(() => {
    // Auto-start exam after 2 seconds
    const autoStartTimer = setTimeout(() => {
      onStartExam();
    }, 2000);

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Check if exam time has arrived (exam date at 10:00 AM)
      const examDateTime = new Date(examDate);
      examDateTime.setHours(10, 0, 0, 0);

      setCanStartExam(now >= examDateTime);
    }, 1000);

    return () => {
      clearTimeout(autoStartTimer);
      clearInterval(timer);
    };
  }, [examDate, onStartExam]);

  const examDateTime = new Date(examDate);
  examDateTime.setHours(10, 0, 0, 0);

  const getTimeRemaining = () => {
    const diff = examDateTime.getTime() - currentTime.getTime();

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const timeRemaining = getTimeRemaining();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-2">
      <div className="max-w-2xl w-full space-y-4 sm:space-y-6">
        {/* Main Status Card */}
        <Card className="border-border/40 shadow-xl">
          <CardHeader className="text-center pb-3 sm:pb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              {canStartExam ? (
                <PlayCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-pulse" />
              ) : (
                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold alumni-sans-title">
              {canStartExam ? t('examWaiting.examReady') : t('examWaiting.examNotStarted')}
            </CardTitle>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              {canStartExam
                ? t('examWaiting.canBegin')
                : t('examWaiting.availableAtTime')
              }
            </p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
            {/* Exam Details */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-xl bg-secondary/30 border border-border/40 text-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto mb-1 sm:mb-2" />
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">{t('examWaiting.date')}</p>
                <p className="font-bold text-foreground text-xs sm:text-base">
                  {examDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-secondary/30 border border-border/40 text-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto mb-1 sm:mb-2" />
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">{t('examWaiting.time')}</p>
                <p className="font-bold text-foreground text-xs sm:text-base">10:00 AM</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-secondary/30 border border-border/40 text-center">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto mb-1 sm:mb-2" />
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">{t('examWaiting.center')}</p>
                <p className="font-bold text-foreground text-xs sm:text-base">LHR-003</p>
              </div>
            </div>

            {/* Countdown Timer or Ready Status */}
            {!canStartExam && timeRemaining ? (
              <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                <p className="text-center text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{t('examWaiting.timeUntilExam')}</p>
                <div className="grid grid-cols-4 gap-2 sm:gap-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-3xl font-bold text-primary">{timeRemaining.days}</div>
                    <div className="text-[9px] sm:text-xs text-muted-foreground uppercase">{t('examWaiting.days')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-3xl font-bold text-primary">{timeRemaining.hours}</div>
                    <div className="text-[9px] sm:text-xs text-muted-foreground uppercase">{t('examWaiting.hours')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-3xl font-bold text-primary">{timeRemaining.minutes}</div>
                    <div className="text-[9px] sm:text-xs text-muted-foreground uppercase">{t('examWaiting.min')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-3xl font-bold text-primary">{timeRemaining.seconds}</div>
                    <div className="text-[9px] sm:text-xs text-muted-foreground uppercase">{t('examWaiting.sec')}</div>
                  </div>
                </div>
              </div>
            ) : canStartExam ? (
              <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                  <p className="font-bold text-foreground text-base sm:text-lg">{t('examWaiting.examWindowOpen')}</p>
                </div>
                <Button
                  onClick={onStartExam}
                  size="lg"
                  className="w-full font-bold text-base sm:text-lg h-12 sm:h-14 shadow-lg"
                >
                  <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {t('examWaiting.startExamNow')}
                </Button>
              </div>
            ) : null}

            {/* Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-2">
                  <p className="font-semibold text-foreground">{t('examWaiting.importantInstructions')}</p>
                  <ul className="space-y-0.5 sm:space-y-1">
                    <li>• {t('examWaiting.stableInternet')}</li>
                    <li>• {t('examWaiting.twentyQuestions')}</li>
                    <li>• {t('examWaiting.cannotPause')}</li>
                    <li>• {t('examWaiting.completeInOneSitting')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, MapPin, AlertCircle, CheckCircle2, PlayCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface ExamWaitingScreenProps {
  examDate: Date;
  onStartExam: () => void;
}

export function ExamWaitingScreen({ examDate, onStartExam }: ExamWaitingScreenProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [canStartExam, setCanStartExam] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Check if exam time has arrived (exam date at 10:00 AM)
      const examDateTime = new Date(examDate);
      examDateTime.setHours(10, 0, 0, 0);
      
      setCanStartExam(now >= examDateTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [examDate]);

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
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Main Status Card */}
        <Card className="border-border/40 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              {canStartExam ? (
                <PlayCircle className="w-10 h-10 text-primary animate-pulse" />
              ) : (
                <Clock className="w-10 h-10 text-primary" />
              )}
            </div>
            <CardTitle className="text-3xl font-bold alumni-sans-title">
              {canStartExam ? "Exam is Ready!" : "Exam Not Started Yet"}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {canStartExam 
                ? "You can now begin your certification exam"
                : "Your exam will be available at the scheduled time"
              }
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Exam Details */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 text-center">
                <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Exam Date</p>
                <p className="font-bold text-foreground">
                  {examDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 text-center">
                <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Start Time</p>
                <p className="font-bold text-foreground">10:00 AM</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 text-center">
                <MapPin className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Center</p>
                <p className="font-bold text-foreground">LHR-003</p>
              </div>
            </div>

            {/* Countdown Timer or Ready Status */}
            {!canStartExam && timeRemaining ? (
              <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                <p className="text-center text-sm text-muted-foreground mb-4">Time until exam starts</p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{timeRemaining.days}</div>
                    <div className="text-xs text-muted-foreground uppercase">Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{timeRemaining.hours}</div>
                    <div className="text-xs text-muted-foreground uppercase">Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{timeRemaining.minutes}</div>
                    <div className="text-xs text-muted-foreground uppercase">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{timeRemaining.seconds}</div>
                    <div className="text-xs text-muted-foreground uppercase">Seconds</div>
                  </div>
                </div>
              </div>
            ) : canStartExam ? (
              <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <p className="font-bold text-foreground text-lg">Exam Window is Open</p>
                </div>
                <Button 
                  onClick={onStartExam}
                  size="lg"
                  className="w-full font-bold text-lg h-14 shadow-lg"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Start Exam Now
                </Button>
              </div>
            ) : null}

            {/* Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="font-semibold text-foreground">Important Instructions:</p>
                  <ul className="space-y-1">
                    <li>• Ensure you have a stable internet connection</li>
                    <li>• The exam duration is 20 minutes with 20 questions</li>
                    <li>• Once started, the exam cannot be paused</li>
                    <li>• You must complete the exam in one sitting</li>
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

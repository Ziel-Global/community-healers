import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Calendar, MapPin, Clock, PartyPopper, FileText, Shield, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface RegistrationCompleteScreenProps {
  examDate: Date;
  centerName: string;
  centerId: string;
}

export function RegistrationCompleteScreen({ examDate, centerName, centerId }: RegistrationCompleteScreenProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-2">
      <div className="max-w-2xl w-full space-y-4 sm:space-y-6">
        {/* Success Banner */}
        <Card className="border-green-500/30 shadow-xl bg-gradient-to-br from-green-500/5 to-emerald-500/5">
          <CardHeader className="text-center pb-3 sm:pb-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 dark:text-green-400" />
            </div>
            <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/40 text-sm px-4 py-1.5 mx-auto mb-3">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Registration Complete
            </Badge>
            <CardTitle className="text-2xl sm:text-3xl font-bold alumni-sans-title text-foreground">
              Congratulations! 🎉
            </CardTitle>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Your registration has been completed and your exam has been scheduled successfully
            </p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
            {/* Exam Schedule Card */}
            <div className="p-4 sm:p-6 rounded-xl bg-card border border-border/60 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Exam Schedule</h3>
                  <p className="text-xs text-muted-foreground">Your scheduled examination details</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                  <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">Date</p>
                  <p className="font-bold text-foreground text-sm sm:text-base">
                    {format(examDate, 'MMMM d, yyyy')}
                  </p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                  <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">Time</p>
                  <p className="font-bold text-foreground text-sm sm:text-base">10:00 AM</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                  <MapPin className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground mb-1">Center</p>
                  <p className="font-bold text-foreground text-sm sm:text-base">{centerId}</p>
                </div>
              </div>
            </div>

            {/* Center Details */}
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/40">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">{centerName}</p>
                  <p className="text-sm text-muted-foreground">Your assigned examination center</p>
                </div>
              </div>
            </div>

            {/* What's Next Section */}
            <div className="p-4 sm:p-5 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="font-semibold text-foreground text-base">What's Next?</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Visit your assigned center on the scheduled date</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Bring your original CNIC for identity verification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>The center admin will initiate your exam</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>20 questions in 20 minutes - be prepared!</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Status Summary */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                <p className="text-xs font-medium text-foreground">Registration</p>
                <p className="text-[10px] text-green-600 dark:text-green-400">Complete</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                <p className="text-xs font-medium text-foreground">Payment</p>
                <p className="text-[10px] text-green-600 dark:text-green-400">Received</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                <p className="text-xs font-medium text-foreground">Exam</p>
                <p className="text-[10px] text-green-600 dark:text-green-400">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

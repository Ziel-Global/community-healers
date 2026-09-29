import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, MapPin, Clock, PartyPopper, FileText, Shield, AlertCircle, User, RefreshCw, Phone } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import { formatTimeLabel } from "@/utils/time";

interface RegistrationCompleteScreenProps {
  examDate: Date | string;
  centerName: string;
  centerId: string;
  centerPhone?: string | null;
  examStartTime?: string;
  arriveByTime?: string;
  verificationMessage?: string;
  wasAutoRescheduled?: boolean;
  onGoToProfile: () => void;
}

export function RegistrationCompleteScreen({
  examDate,
  centerName,
  centerId,
  centerPhone,
  examStartTime,
  arriveByTime,
  verificationMessage,
  wasAutoRescheduled,
  onGoToProfile,
}: RegistrationCompleteScreenProps) {
  const { t } = useTranslation();
  const dateObj = (() => {
    try {
      if (!examDate) return new Date();
      return typeof examDate === 'string' ? parseISO(examDate) : examDate;
    } catch (e) {
      return new Date();
    }
  })();

  const datePart = (() => {
    try {
      return format(dateObj, 'yyyy-MM-dd');
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  })();

  const startLabel = formatTimeLabel(examStartTime, { fallback: "—", datePart });
  const arriveLabel = formatTimeLabel(arriveByTime, { fallback: "", datePart });

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-2">
      <div className="max-w-2xl w-full space-y-4 sm:space-y-6">
        <Card className="border-[#d8e4bc] shadow-[0_16px_40px_#163a2b0c] bg-gradient-to-br from-[#edf5df] to-white rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-3 sm:pb-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#e7f2db] border border-[#c7ddb5] flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="w-10 h-10 sm:w-12 sm:h-12 text-[#426f36]" />
            </div>
            <Badge className="bg-[#e7f2db] text-[#426f36] border-[#c7ddb5] text-sm px-4 py-1.5 mx-auto mb-3 hover:bg-[#e7f2db]">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              {t('complete.registrationComplete')}
            </Badge>
            <CardTitle className="text-2xl sm:text-3xl font-display font-semibold text-[#183d34] tracking-tight">
              {t('complete.congratulations')}
            </CardTitle>
            <p className="text-sm sm:text-base text-[#64736d] mt-2">
              {t('complete.successMessage')}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
            {wasAutoRescheduled && (
              <div className="p-3 rounded-xl ss-status-warn flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-[#5c4e2a] mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  {t('complete.autoRescheduledNotice')}
                </p>
              </div>
            )}

            <div className="p-4 sm:p-6 rounded-2xl bg-white border border-[#e7eee9] shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-[13px] bg-[#e9f1e3] flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#3c6445]" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-[#183d34]">{t('complete.examSchedule')}</h3>
                  <p className="text-xs text-[#64736d]">{t('complete.scheduledDetails')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-xl bg-[#f5f8f2] border border-[#e7eee9] text-center">
                  <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-xs text-[#658075] mb-1">{t('complete.date')}</p>
                  <p className="font-semibold text-[#183d34] text-sm sm:text-base">
                    {format(dateObj, 'MMMM d, yyyy')}
                  </p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-[#f5f8f2] border border-[#e7eee9] text-center">
                  <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-xs text-[#658075] mb-1">{t('complete.time')}</p>
                  <p className="font-semibold text-[#183d34] text-sm sm:text-base">{startLabel}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-[#f5f8f2] border border-[#e7eee9] text-center">
                  <MapPin className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-xs text-[#658075] mb-1">{t('complete.center')}</p>
                  <p className="font-semibold text-[#183d34] text-sm sm:text-base">{centerId}</p>
                </div>
              </div>

              {arriveLabel && (
                <div className="mt-3 p-3 rounded-xl bg-[#f5f8f2] border border-[#e7eee9] text-center sm:text-left">
                  <p className="text-xs text-[#658075] mb-0.5">{t('complete.arriveBy')}</p>
                  <p className="font-semibold text-[#183d34]">{arriveLabel}</p>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-[#f5f8f2] border border-[#e7eee9]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-[#183d34]">{centerName}</p>
                  <p className="text-sm text-[#64736d]">{t('complete.assignedCenter')}</p>
                  {centerPhone && (
                    <p className="text-sm text-[#64736d] flex items-center gap-1.5 mt-1">
                      <Phone className="w-3.5 h-3.5" />
                      {centerPhone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl ss-status-info">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#378456] mt-0.5 flex-shrink-0" />
                <div className="text-sm text-[#64736d] space-y-2">
                  <p className="font-semibold text-[#183d34] text-base">{t('complete.whatsNext')}</p>
                  {verificationMessage && (
                    <p className="text-[#183d34]/90">{verificationMessage}</p>
                  )}
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#426f36] mt-0.5 flex-shrink-0" />
                      <span>{t('complete.visitCenter')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t('complete.bringCNIC')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t('complete.centerAdminExam')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{t('complete.questionsTime')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: t('complete.registrationLabel'), status: t('complete.complete') },
                { label: t('complete.paymentLabel'), status: t('complete.received') },
                { label: t('complete.examLabel'), status: t('complete.scheduledLabel') },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-[#e7f2db] border border-[#c7ddb5] text-center">
                  <CheckCircle2 className="w-5 h-5 text-[#426f36] mx-auto mb-1" />
                  <p className="text-xs font-medium text-[#183d34]">{item.label}</p>
                  <p className="text-[10px] text-[#426f36]">{item.status}</p>
                </div>
              ))}
            </div>

            <Button
              onClick={onGoToProfile}
              variant="outline"
              size="lg"
              className="w-full gap-2"
            >
              <User className="w-4 h-4" />
              {t('complete.goToProfile')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

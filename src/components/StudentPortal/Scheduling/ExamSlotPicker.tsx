import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { AlertCircle, CalendarDays, CheckCircle2, Loader2 } from "lucide-react";

interface ExamSlotPickerProps {
    selectedDate: Date | undefined;
    onDateSelect: (date: Date | undefined) => void;
    onSchedule: () => void;
    isScheduling: boolean;
    isScheduled: boolean;
}

export function ExamSlotPicker({ selectedDate, onDateSelect, onSchedule, isScheduling, isScheduled }: ExamSlotPickerProps) {
    const { t } = useTranslation();

    return (
        <Card className="border-[#e7eee9] shadow-[0_8px_24px_#163a2b08] overflow-hidden rounded-2xl">
            <CardHeader className="bg-[#f5f8f2] border-b border-[#e7eee9] p-4 sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[13px] bg-white flex items-center justify-center border border-[#e0e9dc] shrink-0">
                        <CalendarDays className="w-5 h-5 text-[#3c6445]" />
                    </div>
                    <div className="min-w-0">
                        <CardTitle className="text-lg sm:text-xl font-display font-semibold text-[#183d34] tracking-tight">{t('scheduling.selectExamDate')}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-[#64736d]">{t('scheduling.choosePreferredDate')}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 min-w-0">
                        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0" dir="ltr">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={onDateSelect}
                                className="rounded-xl border border-[#e7eee9] mx-auto bg-white w-fit pointer-events-auto"
                                disabled={(date) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const limit = new Date();
                                    limit.setDate(today.getDate() + 30);
                                    return date < today || date > limit || isScheduled;
                                }}
                            />
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-[#5a7064] bg-[#f3f8ed] p-3 rounded-xl border border-[#dce7d6]">
                            <AlertCircle className="w-3.5 h-3.5 text-[#378456] shrink-0" />
                            <span>{t('scheduling.selectWithin30Days')}</span>
                        </div>
                    </div>

                    {selectedDate && (
                        <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className={`p-4 sm:p-6 rounded-2xl border ${isScheduled ? 'ss-status-success' : 'ss-status-info'}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${isScheduled ? 'bg-[#e7f2db]' : 'bg-white border border-[#dce7d6]'}`}>
                                        <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 ${isScheduled ? 'text-[#426f36]' : 'text-primary'}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-[#183d34] text-sm sm:text-base">
                                            {isScheduled ? t('scheduling.examScheduled') : t('scheduling.dateSelected')}
                                        </h4>
                                        <p className="text-xs sm:text-sm text-[#64736d]">
                                            {isScheduled ? t('scheduling.examConfirmed') : t('scheduling.confirmToSchedule')}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 p-3 sm:p-4 rounded-xl bg-white border border-[#e7eee9]">
                                    <p className="text-xs text-[#658075] mb-1">{t('scheduling.examDate')}</p>
                                    <p className="text-base sm:text-lg font-display font-semibold text-[#183d34]">
                                        {selectedDate.toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>

                                {!isScheduled && (
                                    <Button
                                        className="w-full mt-4"
                                        size="lg"
                                        onClick={onSchedule}
                                        disabled={isScheduling}
                                    >
                                        {isScheduling ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                {t('scheduling.scheduling')}
                                            </>
                                        ) : (
                                            t('scheduling.scheduleExam')
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { AlertCircle, CalendarDays, CheckCircle2 } from "lucide-react";

interface ExamSlotPickerProps {
    selectedDate: Date | undefined;
    onDateSelect: (date: Date | undefined) => void;
}

export function ExamSlotPicker({ selectedDate, onDateSelect }: ExamSlotPickerProps) {

    return (
        <Card className="border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border/40 p-4 sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/50 backdrop-blur-md flex items-center justify-center border border-primary/20 shadow-sm shrink-0">
                        <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <CardTitle className="text-lg sm:text-2xl font-bold alumni-sans-title">Select Exam Date</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Choose your preferred exam date</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 min-w-0">
                        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={onDateSelect}
                                className="rounded-md border border-border/40 mx-auto shadow-inner w-fit pointer-events-auto"
                                disabled={(date) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const limit = new Date();
                                    limit.setDate(today.getDate() + 30);
                                    return date < today || date > limit;
                                }}
                            />
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                            <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>Select any date within the next 30 days</span>
                        </div>
                    </div>

                    {selectedDate && (
                        <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-foreground text-sm sm:text-base">Date Selected</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground">Your exam date has been set</p>
                                    </div>
                                </div>
                                <div className="mt-4 p-3 sm:p-4 rounded-lg bg-card border border-border/40">
                                    <p className="text-xs text-muted-foreground mb-1">Exam Date</p>
                                    <p className="text-base sm:text-lg font-bold text-foreground">
                                        {selectedDate.toLocaleDateString('en-US', { 
                                            weekday: 'long',
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                </div>
                                <div className="mt-4 p-3 sm:p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    <p className="text-xs text-blue-700 dark:text-blue-400">
                                        <strong>Note:</strong> Exam will be conducted at 10:00 AM at your assigned center. Please arrive 30 minutes early.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

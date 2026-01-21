import { Button } from "@/components/ui/button";
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
            <CardHeader className="bg-primary/5 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/50 backdrop-blur-md flex items-center justify-center border border-primary/20 shadow-sm">
                        <CalendarDays className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-display font-bold">Select Exam Date</CardTitle>
                        <CardDescription>Choose your preferred exam date</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={onDateSelect}
                            className="rounded-md border border-border/40 mx-auto shadow-inner"
                            disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const limit = new Date();
                                limit.setDate(today.getDate() + 30);
                                return date < today || date > limit;
                            }}
                        />
                        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                            <AlertCircle className="w-3.5 h-3.5 text-primary" />
                            <span>Select any date within the next 30 days</span>
                        </div>
                    </div>

                    {selectedDate && (
                        <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground">Date Selected</h4>
                                        <p className="text-sm text-muted-foreground">Your exam date has been set</p>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 rounded-lg bg-card border border-border/40">
                                    <p className="text-xs text-muted-foreground mb-1">Exam Date</p>
                                    <p className="text-lg font-bold text-foreground">
                                        {selectedDate.toLocaleDateString('en-US', { 
                                            weekday: 'long',
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                </div>
                                <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
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

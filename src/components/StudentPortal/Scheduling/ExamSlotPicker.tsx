import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ArrowRight, AlertCircle, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExamSlotPicker() {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    const slots = [
        { id: "1", time: "09:00 AM", capacity: "12/20", isFull: false },
        { id: "2", time: "11:30 AM", capacity: "18/20", isFull: false },
        { id: "3", time: "02:00 PM", capacity: "20/20", isFull: true },
        { id: "4", time: "04:30 PM", capacity: "05/20", isFull: false },
    ];

    const handleDateSelect = (newDate: Date | undefined) => {
        setDate(newDate);
        setSelectedSlot(null);
        if (newDate) {
            setIsLoadingSlots(true);
            setTimeout(() => setIsLoadingSlots(false), 800);
        }
    };

    return (
        <Card className="border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/50 backdrop-blur-md flex items-center justify-center border border-primary/20 shadow-sm">
                        <CalendarDays className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-display font-bold">Schedule Your Exam</CardTitle>
                        <CardDescription>Select a date and then choose an available time slot</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="flex flex-col md:row-span-2 md:flex-row">
                    <div className="p-6 border-r border-border/40 bg-card">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateSelect}
                            className="rounded-md border border-border/40 mx-auto md:mx-0 shadow-inner"
                            disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const limit = new Date();
                                limit.setDate(today.getDate() + 7);
                                return date < today || date > limit;
                            }}
                        />
                        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-2 rounded-lg border border-primary/10">
                            <AlertCircle className="w-3.5 h-3.5 text-primary" />
                            <span>Select any date within the next 7 days</span>
                        </div>
                    </div>

                    <div className="flex-1 p-6 space-y-6 bg-secondary/10 min-h-[400px]">
                        {!date ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
                                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                                    <Clock className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground">No Date Selected</h4>
                                    <p className="text-sm text-muted-foreground">Please select an exam date from the calendar</p>
                                </div>
                            </div>
                        ) : isLoadingSlots ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-4">
                                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                                <p className="text-sm font-medium text-muted-foreground">Checking slot availability...</p>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary" />
                                        Slots for {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </h4>
                                    <Badge variant="outline" className="text-xs bg-white">{slots.filter(s => !s.isFull).length} Available</Badge>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {slots.map((slot) => (
                                        <button
                                            key={slot.id}
                                            disabled={slot.isFull}
                                            onClick={() => setSelectedSlot(slot.id)}
                                            className={cn(
                                                "p-4 rounded-xl border transition-all text-left group relative overflow-hidden",
                                                selectedSlot === slot.id
                                                    ? "bg-primary text-primary-foreground border-primary shadow-royal scale-[1.02] z-10"
                                                    : slot.isFull
                                                        ? "bg-secondary/40 border-border/40 cursor-not-allowed grayscale opacity-60"
                                                        : "bg-card border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:translate-y-[-2px]"
                                            )}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-bold text-lg">{slot.time}</p>
                                                {selectedSlot === slot.id && <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Selected</Badge>}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs opacity-80">
                                                <Users className="w-3.5 h-3.5" />
                                                <span>{slot.isFull ? "Center Capacity Full" : `${slot.capacity} seats taken`}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {selectedSlot && (
                                    <div className="pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <Button className="w-full h-12 gradient-primary text-white font-semibold shadow-lg group">
                                            Confirm Booking for {slots.find(s => s.id === selectedSlot)?.time}
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                        <p className="text-center text-[10px] text-muted-foreground mt-3">
                                            Note: Center capacity is strictly managed. Rescheduling is allowed up to 24h before.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

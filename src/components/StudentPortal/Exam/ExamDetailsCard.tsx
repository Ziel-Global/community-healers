import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamDetailsProps {
    status: "pending" | "verified" | "attempted";
    date: string;
    time: string;
    center: string;
}

export function ExamDetailsCard({ status, date, time, center }: ExamDetailsProps) {
    return (
        <Card className="border-border/40 shadow-sm overflow-hidden">
            <div className={cn(
                "h-1.5",
                status === "verified" ? "bg-success" : status === "pending" ? "bg-amber-500" : "bg-primary"
            )} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-xl font-display font-bold">CBT Certification Exam</CardTitle>
                    <CardDescription>Your scheduled examination details</CardDescription>
                </div>
                <Badge variant={status === "verified" ? "success" : "secondary"} className="uppercase tracking-wider font-bold text-[10px] px-3">
                    {status}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex gap-3 items-center p-3 rounded-xl bg-secondary/30 border border-border/40">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                            <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Date</p>
                            <p className="text-sm font-semibold">{date}</p>
                        </div>
                    </div>
                    <div className="flex gap-3 items-center p-3 rounded-xl bg-secondary/30 border border-border/40">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Time</p>
                            <p className="text-sm font-semibold">{time}</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-border/60 bg-secondary/10 space-y-3">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Exam Center</p>
                            <p className="text-sm font-semibold">{center}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/20">
                        <div className="text-center">
                            <p className="text-[10px] text-muted-foreground font-medium">Duration</p>
                            <p className="text-xs font-bold">20m</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-muted-foreground font-medium">Questions</p>
                            <p className="text-xs font-bold">20 MCQs</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-muted-foreground font-medium">Format</p>
                            <p className="text-xs font-bold">CBT</p>
                        </div>
                    </div>
                </div>

                {status === "pending" && (
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex gap-3">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        <p className="text-[10px] text-amber-700 leading-normal">
                            Please arrive at the center 30 minutes before your scheduled time for biometric verification.
                        </p>
                    </div>
                )}

                {status === "verified" ? (
                    <Button className="w-full h-11 gradient-primary text-white font-bold shadow-lg">
                        Start Exam Now
                    </Button>
                ) : (
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 h-11">Download Admit Card</Button>
                        <Button variant="outline" className="flex-1 h-11">Reschedule</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

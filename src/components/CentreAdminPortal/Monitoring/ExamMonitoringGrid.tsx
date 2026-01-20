import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, PlayCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const monitorData = [
    { id: 1, name: "Muhammad Ahmed", status: "In Progress", progress: 65, startTime: "09:15 AM", timeLeft: "12m" },
    { id: 2, name: "Fatima Noor", status: "Not Started", progress: 0, startTime: "-", timeLeft: "-" },
    { id: 3, name: "Ali Raza", status: "Completed", progress: 100, startTime: "09:05 AM", timeLeft: "0m" },
    { id: 4, name: "Zainab Bibi", status: "In Progress", progress: 15, startTime: "09:40 AM", timeLeft: "38m" },
];

export function ExamMonitoringGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {monitorData.map((item) => (
                <div
                    key={item.id}
                    className={cn(
                        "p-5 rounded-2xl border transition-all relative overflow-hidden group",
                        item.status === "In Progress" ? "bg-primary/5 border-primary/30 shadow-md ring-1 ring-primary/20" : "bg-card border-border/40"
                    )}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="font-bold text-foreground truncate max-w-[120px]">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Progress</p>
                        </div>
                        <Badge
                            variant={item.status === "Completed" ? "success" : item.status === "In Progress" ? "default" : "secondary"}
                            className="px-2 py-0 text-[10px] uppercase font-bold tracking-tighter"
                        >
                            {item.status}
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        <Progress value={item.progress} className="h-1.5" />

                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                    <PlayCircle className="w-3 h-3" />
                                    Started: {item.startTime}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold">
                                    <Clock className="w-3 h-3 text-primary" />
                                    Remaining: {item.timeLeft}
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="text-lg font-bold text-foreground">{item.progress}%</span>
                            </div>
                        </div>
                    </div>

                    {item.status === "In Progress" && (
                        <div className="absolute top-0 right-0 p-1 pointer-events-none">
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

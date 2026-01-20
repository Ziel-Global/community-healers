import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface Step {
    id: string;
    label: string;
    status: "complete" | "current" | "pending";
}

interface ProfileStatusTrackerProps {
    steps: Step[];
    percentage: number;
}

export function ProfileStatusTracker({ steps, percentage }: ProfileStatusTrackerProps) {
    return (
        <div className="space-y-6 p-6 rounded-2xl bg-card border border-border/40 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h3 className="text-lg font-display font-semibold text-foreground">Profile Completion</h3>
                    <p className="text-sm text-muted-foreground">Complete all steps to proceed to exam scheduling</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-primary">{percentage}%</span>
                </div>
            </div>

            <Progress value={percentage} className="h-2 bg-secondary" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all",
                            step.status === "complete" ? "bg-success/5 border-success/20" :
                                step.status === "current" ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20" :
                                    "bg-secondary/20 border-border/40"
                        )}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            step.status === "complete" ? "bg-success/20 text-success" :
                                step.status === "current" ? "bg-primary/20 text-primary" :
                                    "bg-muted text-muted-foreground"
                        )}>
                            {step.status === "complete" ? <CheckCircle2 className="w-5 h-5" /> :
                                step.status === "current" ? <Clock className="w-5 h-5" /> :
                                    <Circle className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className={cn(
                                "text-xs font-semibold uppercase tracking-wider",
                                step.status === "complete" ? "text-success" :
                                    step.status === "current" ? "text-primary" :
                                        "text-muted-foreground"
                            )}>
                                {step.status}
                            </p>
                            <p className="text-sm font-medium text-foreground">{step.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

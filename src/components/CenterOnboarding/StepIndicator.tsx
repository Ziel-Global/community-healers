import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WizardStep {
    label: string;
    icon: LucideIcon;
}

interface StepIndicatorProps {
    steps: WizardStep[];
    /** 1-indexed — which step is currently active. */
    currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    return (
        <div className="flex items-center">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isComplete = stepNumber < currentStep;
                const isCurrent = stepNumber === currentStep;
                const Icon = step.icon;

                return (
                    <div key={step.label} className={cn("flex items-center", index < steps.length - 1 && "flex-1")}>
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className={cn(
                                    "w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                                    isComplete
                                        ? "gradient-primary text-white shadow-primary"
                                        : isCurrent
                                          ? "bg-card border-2 border-primary text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]"
                                          : "bg-secondary text-muted-foreground border border-border/60"
                                )}
                            >
                                {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-4.5 h-4.5" />}
                            </div>
                            <span
                                className={cn(
                                    "text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap",
                                    isCurrent ? "text-primary" : isComplete ? "text-foreground" : "text-muted-foreground"
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-0.5 mx-2 -mt-6 rounded-full overflow-hidden bg-secondary">
                                <div
                                    className={cn(
                                        "h-full gradient-primary transition-all duration-500",
                                        isComplete ? "w-full" : "w-0"
                                    )}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

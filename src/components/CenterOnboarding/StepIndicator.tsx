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
    const lastIndex = steps.length - 1;
    // Track spans circle-center of first → last (equal columns).
    const trackInsetPct = 100 / (steps.length * 2);
    const trackSpanPct = 100 - trackInsetPct * 2;
    const progressPct =
        lastIndex <= 0 ? 0 : ((Math.min(currentStep, steps.length) - 1) / lastIndex) * trackSpanPct;

    return (
        <nav aria-label="Application progress" className="w-full">
            <div className="relative">
                {/* Base track — behind circles */}
                <div
                    className="pointer-events-none absolute top-5 h-[3px] -translate-y-1/2 rounded-full bg-[#c9d6c8]"
                    style={{ left: `${trackInsetPct}%`, right: `${trackInsetPct}%` }}
                    aria-hidden
                />
                {/* Progress fill */}
                <div
                    className="pointer-events-none absolute top-5 h-[3px] -translate-y-1/2 rounded-full bg-[#164c3e] transition-all duration-500 ease-out"
                    style={{ left: `${trackInsetPct}%`, width: `${progressPct}%` }}
                    aria-hidden
                />

                <ol
                    className="relative z-10 grid w-full"
                    style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
                >
                    {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isComplete = stepNumber < currentStep;
                        const isCurrent = stepNumber === currentStep;
                        const isUpcoming = stepNumber > currentStep;
                        const Icon = step.icon;

                        return (
                            <li key={step.label} className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                                        // solid fill so the track never shows through
                                        isComplete &&
                                            "bg-[#164c3e] text-white shadow-[0_6px_16px_rgba(22,76,62,0.28)]",
                                        isCurrent &&
                                            "bg-white border-[2.5px] border-[#164c3e] text-[#164c3e] shadow-[0_0_0_4px_rgba(22,76,62,0.12)]",
                                        isUpcoming &&
                                            "bg-white border-[1.5px] border-[#c9d6c8] text-[#93a087]"
                                    )}
                                    aria-current={isCurrent ? "step" : undefined}
                                >
                                    {isComplete ? (
                                        <Check className="w-4 h-4" strokeWidth={2.5} />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                </div>

                                <span
                                    className={cn(
                                        "mt-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-center leading-tight px-1",
                                        isCurrent && "text-[#164c3e]",
                                        isComplete && "text-[#183d34]",
                                        isUpcoming && "text-[#93a087]"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </nav>
    );
}

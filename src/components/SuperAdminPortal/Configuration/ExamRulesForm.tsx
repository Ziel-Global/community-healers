import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2, Save, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useExamSettings, useUpdateExamSettings } from "@/hooks/queries/useSuperAdminQueries";
import { getApiErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

function Field({
    id,
    label,
    hint,
    children,
    className,
}: {
    id?: string;
    label: string;
    hint: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("space-y-2.5", className)}>
            <Label
                htmlFor={id}
                className="text-sm font-semibold uppercase tracking-[0.08em] text-[#355c45]"
            >
                {label}
            </Label>
            {children}
            <p className="text-xs text-[#64736d] leading-relaxed">{hint}</p>
        </div>
    );
}

export function ExamRulesForm() {
    const [duration, setDuration] = useState(0);
    const [questions, setQuestions] = useState(0);
    const [passingPercentage, setPassingPercentage] = useState(50);
    const [validityYears, setValidityYears] = useState(0);
    const [validityMonths, setValidityMonths] = useState(0);
    const [unlockDelayHours, setUnlockDelayHours] = useState(0);

    const { data: settings, isLoading } = useExamSettings();
    const updateExamSettingsMutation = useUpdateExamSettings();

    const handleSave = () => {
        updateExamSettingsMutation.mutate(
            {
                durationMinutes: Number(duration),
                numberOfQuestions: Number(questions),
                passingPercentage: Number(passingPercentage),
                certificateValidityYears: Number(validityYears),
                certificateValidityMonths: Number(validityMonths),
                examUnlockDelayHours: Number(unlockDelayHours),
            },
            {
                onSuccess: () => {
                    toast.success("Configuration saved successfully!");
                },
                onError: (error) => {
                    toast.error(getApiErrorMessage(error, "Failed to save configuration."));
                },
            }
        );
    };

    useEffect(() => {
        if (settings) {
            if (settings.durationMinutes) setDuration(settings.durationMinutes);
            if (settings.numberOfQuestions) setQuestions(settings.numberOfQuestions);
            if (settings.passingPercentage) setPassingPercentage(settings.passingPercentage);
            setValidityYears(settings.certificateValidityYears ?? 0);
            setValidityMonths(settings.certificateValidityMonths ?? 0);
            setUnlockDelayHours(settings.examUnlockDelayHours ?? 0);
        }
    }, [settings]);

    return (
        <Card className="border-[#e7eee9] shadow-[0_10px_30px_#163a2b08] bg-white rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-[#e7eee9] bg-[#f5f8f2]">
                <div>
                    <CardTitle className="text-2xl font-display font-semibold tracking-tight flex items-center gap-2 text-[#183d34]">
                        <Settings2 className="w-5 h-5 text-primary" />
                        Global Training Configuration
                    </CardTitle>
                    <CardDescription className="text-[#64736d]">
                        Define system-wide rules for CBT Tests
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-3 py-12">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground animate-pulse">
                            Loading current configuration...
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-7 items-start">
                        <Field
                            id="duration"
                            label="Test Duration (Minutes)"
                            hint="Default duration for all standard certification trainings."
                        >
                            <Input
                                id="duration"
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="h-11"
                            />
                        </Field>

                        <Field
                            id="questions"
                            label="Number of Questions"
                            hint="Randomly pulled from the active question bank."
                        >
                            <Input
                                id="questions"
                                type="number"
                                value={questions}
                                onChange={(e) => setQuestions(Number(e.target.value))}
                                className="h-11"
                            />
                        </Field>

                        <Field
                            id="passingPercentage"
                            label="Passing Marks (%)"
                            hint="Minimum percentage score a candidate must obtain to pass and become eligible for certification."
                        >
                            <Input
                                id="passingPercentage"
                                type="number"
                                min={1}
                                max={100}
                                value={passingPercentage}
                                onChange={(e) => setPassingPercentage(Number(e.target.value))}
                                className="h-11"
                            />
                        </Field>

                        <Field
                            id="unlockDelayHours"
                            label="Exam Unlock Delay (Hours)"
                            hint="How long after a centre verifies a candidate before their test unlocks. 0 means it unlocks immediately on verification."
                        >
                            <Input
                                id="unlockDelayHours"
                                type="number"
                                min={0}
                                max={168}
                                value={unlockDelayHours}
                                onChange={(e) => setUnlockDelayHours(Number(e.target.value))}
                                className="h-11"
                            />
                        </Field>

                        <Field
                            label="Certificate Validity"
                            hint="How long an issued certificate stays valid. 0 years and 0 months together mean it never expires. Applies only to certificates issued after this is saved."
                            className="md:col-span-2"
                        >
                            <div className="grid grid-cols-2 gap-4 max-w-md">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="validityYears"
                                        className="text-xs font-medium text-[#658075]"
                                    >
                                        Years
                                    </Label>
                                    <Input
                                        id="validityYears"
                                        type="number"
                                        min={0}
                                        max={50}
                                        value={validityYears}
                                        onChange={(e) => setValidityYears(Number(e.target.value))}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="validityMonths"
                                        className="text-xs font-medium text-[#658075]"
                                    >
                                        Months
                                    </Label>
                                    <Input
                                        id="validityMonths"
                                        type="number"
                                        min={0}
                                        max={11}
                                        value={validityMonths}
                                        onChange={(e) => setValidityMonths(Number(e.target.value))}
                                        className="h-11"
                                    />
                                </div>
                            </div>
                        </Field>
                    </div>
                )}

                <div className="p-4 rounded-xl bg-[#f8f4e8] border border-[#e8dfc4] flex gap-4">
                    <AlertTriangle className="w-5 h-5 text-[#6a5a3a] shrink-0" />
                    <p className="text-xs text-[#5c4e2a] leading-relaxed">
                        <span className="font-bold">Important:</span> Changes to these parameters
                        will only affect <span className="underline italic">future</span> exam
                        attempts. Currently active sessions will remain on the previous
                        configuration version.
                    </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-[#e7eee9]">
                    <Button
                        onClick={handleSave}
                        disabled={updateExamSettingsMutation.isPending || isLoading}
                        className="ss-cta h-11 px-8"
                    >
                        {updateExamSettingsMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save & Apply Configuration
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

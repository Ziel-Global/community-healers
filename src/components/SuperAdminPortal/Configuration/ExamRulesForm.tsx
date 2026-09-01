import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings2, Save, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useExamSettings, useUpdateExamSettings } from "@/hooks/queries/useSuperAdminQueries";
import { getApiErrorMessage } from "@/lib/errors";

export function ExamRulesForm() {
    const [duration, setDuration] = useState(0);
    const [questions, setQuestions] = useState(0);
    const [passingPercentage, setPassingPercentage] = useState(50);

    const { data: settings, isLoading } = useExamSettings();
    const updateExamSettingsMutation = useUpdateExamSettings();

    const handleSave = () => {
        updateExamSettingsMutation.mutate(
            {
                durationMinutes: Number(duration),
                numberOfQuestions: Number(questions),
                passingPercentage: Number(passingPercentage),
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
        }
    }, [settings]);

    return (
        <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardHeader className="border-b border-border/40 bg-primary/5">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-2xl font-bold alumni-sans-title flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-primary" />
                            Global Training Configuration
                        </CardTitle>
                        <CardDescription>Define system-wide rules for CBT Tests</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-white/50">Version 2.4.0</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-3 py-12">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground animate-pulse">Loading current configuration...</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="duration" className="text-lg alumni-sans-subtitle uppercase tracking-wider">Test Duration (Minutes)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    className="h-11 bg-white/50 border-border/60"
                                />
                                <p className="text-[10px] text-muted-foreground italic">Default duration for all standard certification trainings.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="questions" className="text-lg alumni-sans-subtitle uppercase tracking-wider">Number of Questions</Label>
                                <Input
                                    id="questions"
                                    type="number"
                                    value={questions}
                                    onChange={(e) => setQuestions(Number(e.target.value))}
                                    className="h-11 bg-white/50 border-border/60"
                                />
                                <p className="text-[10px] text-muted-foreground italic">Randomly pulled from the active question bank.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="passingPercentage" className="text-lg alumni-sans-subtitle uppercase tracking-wider">Passing Marks (%)</Label>
                                <Input
                                    id="passingPercentage"
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={passingPercentage}
                                    onChange={(e) => setPassingPercentage(Number(e.target.value))}
                                    className="h-11 bg-white/50 border-border/60"
                                />
                                <p className="text-[10px] text-muted-foreground italic">Minimum percentage score a candidate must obtain to pass and become eligible for certification.</p>
                            </div>
                        </div>

                    </div>
                )}

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-4">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                        <span className="font-bold">Important:</span> Changes to these parameters will only affect <span className="underline italic">future</span> exam attempts. Currently active sessions will remain on the previous configuration version.
                    </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border/40">
                    <Button
                        onClick={handleSave}
                        disabled={updateExamSettingsMutation.isPending || isLoading}
                        className="gradient-primary text-white font-bold h-11 px-8 shadow-lg group"
                    >
                        {updateExamSettingsMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />}
                        Save & Apply Configuration
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

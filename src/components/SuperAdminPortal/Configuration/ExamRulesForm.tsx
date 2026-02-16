import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings2, Save, AlertTriangle, Loader2 } from "lucide-react";
import { superAdminService } from "@/services/superAdminService";
import { toast } from "sonner";

export function ExamRulesForm() {
    const [duration, setDuration] = useState(0);
    const [questions, setQuestions] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await superAdminService.updateExamSettings({
                durationMinutes: Number(duration),
                numberOfQuestions: Number(questions),
            });
            toast.success("Configuration saved successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to save configuration.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await superAdminService.getExamSettings();
                // Check if settings are nested in response.data or similar, 
                // but service should handle it. Assuming settings matches ExamSettings interface.
                // However, based on user's previous logs, response might be wrapped. 
                // Let's assume service returns the data part. 
                // But wait, the user showed a response format earlier:
                // { statusCode: 200, message: "...", data: { ... } }
                // So response.data in service might be the wrapper.
                // I should verify how api.ts handles it or just inspecting the data.
                // For now, let's assume the service returns the `data` object which IS the settings, 
                // or I might need to adjust based on backend response shape.
                // If the backend returns { data: { durationMinutes: ... } }, I need to handle that.
                // Let's try to map it safely.
                if (settings) {
                    // Service now returns the clean object
                    if (settings.durationMinutes) setDuration(settings.durationMinutes);
                    if (settings.numberOfQuestions) setQuestions(settings.numberOfQuestions);
                }
            } catch (error) {
                console.error("Failed to load settings", error);
                // toast.error("Failed to load current settings.");
            }
        };

        fetchSettings();
    }, []);

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
                            <p className="text-[10px] text-muted-foreground italic">Default duration for all standard certification exams.</p>
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
                    </div>

                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-4">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                        <span className="font-bold">Important:</span> Changes to these parameters will only affect <span className="underline italic">future</span> exam attempts. Currently active sessions will remain on the previous configuration version.
                    </p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border/40">
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="gradient-primary text-white font-bold h-11 px-8 shadow-lg group"
                    >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />}
                        Save & Apply Configuration
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings2, Save, History, AlertTriangle } from "lucide-react";

export function ExamRulesForm() {
    return (
        <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardHeader className="border-b border-border/40 bg-primary/5">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-2xl font-bold alumni-sans-title flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-primary" />
                            Global Exam Configuration
                        </CardTitle>
                        <CardDescription>Define system-wide rules for CBT examinations</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-white/50">Version 2.4.0</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="duration" className="text-lg alumni-sans-subtitle uppercase tracking-wider">Exam Duration (Minutes)</Label>
                            <Input id="duration" type="number" defaultValue={20} className="h-11 bg-white/50 border-border/60" />
                            <p className="text-[10px] text-muted-foreground italic">Default duration for all standard certification exams.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="questions" className="text-lg alumni-sans-subtitle uppercase tracking-wider">Number of Questions</Label>
                            <Input id="questions" type="number" defaultValue={20} className="h-11 bg-white/50 border-border/60" />
                            <p className="text-[10px] text-muted-foreground italic">Randomly pulled from the active question bank.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="threshold" className="text-lg alumni-sans-subtitle uppercase tracking-wider">Passing Threshold (%)</Label>
                            <Input id="threshold" type="number" defaultValue={60} className="h-11 bg-white/50 border-border/60" />
                            <p className="text-[10px] text-muted-foreground italic">Minimum score required to issue a certificate.</p>
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
                    <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                        <History className="w-4 h-4" />
                        View Change History
                    </Button>
                    <Button className="gradient-primary text-white font-bold h-11 px-8 shadow-lg group">
                        <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        Save & Apply Configuration
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

import { Badge } from "@/components/ui/badge";

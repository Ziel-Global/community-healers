import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BookOpen, GraduationCap, Upload, FileCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function EducationDeclaration() {
    const [hasSixteenYears, setHasSixteenYears] = useState(false);
    const [isUploaded, setIsUploaded] = useState(false);

    return (
        <Card className="border-border/40 shadow-sm">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="alumni-sans-title">Education Declaration</CardTitle>
                        <CardDescription>Declare your educational background</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/40">
                    <div className="space-y-1">
                        <Label htmlFor="education-switch" className="text-base font-semibold">16 Years of Education</Label>
                        <p className="text-sm text-muted-foreground">Do you have a Bachelor's degree or equivalent (16 years)?</p>
                    </div>
                    <Switch
                        id="education-switch"
                        checked={hasSixteenYears}
                        onCheckedChange={setHasSixteenYears}
                    />
                </div>

                {hasSixteenYears && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-2 text-primary">
                            <GraduationCap className="w-5 h-5" />
                            <h4 className="font-semibold">Degree Verification Required</h4>
                        </div>

                        <div
                            className={cn(
                                "p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center space-y-4 transition-colors",
                                isUploaded ? "bg-success/5 border-success/30" : "bg-secondary/10 border-border/60 hover:border-primary/40"
                            )}
                        >
                            {isUploaded ? (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center">
                                        <FileCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Higher Education Degree Uploaded</p>
                                        <p className="text-sm text-muted-foreground">bachelors_degree_final.pdf (2.4 MB)</p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setIsUploaded(false)}>Change File</Button>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Upload Degree Transcript / Certificate</p>
                                        <p className="text-sm text-muted-foreground">Drag and drop your degree or click to browse</p>
                                    </div>
                                    <Button className="gradient-primary text-white" onClick={() => setIsUploaded(true)}>Select File</Button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
                    <Info className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Minimum education requirement is 10 years (Matric) for this certification. Candidates with 16 years of education are eligible for advanced modules.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

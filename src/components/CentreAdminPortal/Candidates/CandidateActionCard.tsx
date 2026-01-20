import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, UserCheck, Search, ShieldCheck, XCircle, Fingerprint } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CandidateActionCard() {
    const [checklist, setChecklist] = useState({
        present: false,
        faceMatch: false,
        cnicMatch: false,
    });

    const isVerified = checklist.present && checklist.faceMatch && checklist.cnicMatch;

    return (
        <Card className="border-border/40 shadow-royal overflow-hidden bg-card/80 backdrop-blur-md">
            <CardHeader className="bg-primary/5 border-b border-border/40 p-6">
                <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className="relative">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed"
                                alt="Candidate"
                                className="w-20 h-20 rounded-2xl bg-white p-1 border border-primary/20 shadow-md object-cover"
                            />
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shadow-lg">
                                <ShieldCheck className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div>
                            <Badge variant="success" className="mb-2 uppercase tracking-widest text-[10px] bg-primary/20 text-primary border-primary/30">
                                Payment Verified
                            </Badge>
                            <CardTitle className="text-2xl font-display font-bold">Muhammad Ahmed</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1 font-mono text-xs">
                                <Fingerprint className="w-3.5 h-3.5 text-primary" />
                                CNIC: 35201-1234567-1
                            </CardDescription>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Time Slot</p>
                        <p className="text-lg font-bold text-foreground">09:00 AM</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-primary" /> Verification Checklist
                    </h4>

                    <div className="grid gap-3">
                        {[
                            { id: 'present', label: 'Candidate is Physically Present' },
                            { id: 'faceMatch', label: 'Face matches Registration Photo' },
                            { id: 'cnicMatch', label: 'CNIC matches system Record' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setChecklist(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof prev] }))}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-xl border transition-all text-left group",
                                    checklist[item.id as keyof typeof checklist]
                                        ? "bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20"
                                        : "bg-secondary text-muted-foreground border-border/40 hover:border-primary/40"
                                )}
                            >
                                <span className={cn("text-sm font-medium transition-colors", checklist[item.id as keyof typeof checklist] ? "text-emerald-700" : "text-muted-foreground")}>
                                    {item.label}
                                </span>
                                <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                    checklist[item.id as keyof typeof checklist]
                                        ? "bg-emerald-500 border-emerald-500 scale-110"
                                        : "border-border/60 group-hover:border-primary/40"
                                )}>
                                    {checklist[item.id as keyof typeof checklist] && <CheckCircle2 className="w-4 h-4 text-white" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border/40">
                    <Button
                        className={cn(
                            "flex-1 h-12 font-bold transition-all shadow-lg group",
                            isVerified ? "gradient-primary text-black" : "bg-primary/20 text-muted-foreground cursor-not-allowed border-none"
                        )}
                        disabled={!isVerified}
                    >
                        <CheckCircle2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Verify Account & Unlock Exam
                    </Button>
                    <Button variant="outline" className="px-6 h-12 rounded-xl text-destructive hover:bg-destructive/5 font-bold border-destructive/20">
                        <XCircle className="w-5 h-5 mr-2" />
                        Report Absence
                    </Button>
                </div>

                {!isVerified && (
                    <p className="text-center text-[10px] text-muted-foreground uppercase font-medium tracking-tight">
                        * Complete all checks to proceed with verification
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

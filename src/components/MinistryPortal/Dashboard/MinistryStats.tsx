import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Clock, FileCheck, TrendingUp, ShieldCheck } from "lucide-react";

export function MinistryStats() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-sm border-l-4 border-l-primary">
                <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Total Issued</p>
                            <h3 className="text-2xl font-sans font-bold text-foreground">8,420</h3>
                            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +12% this month
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Award className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-sm border-l-4 border-l-amber-500">
                <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Pending Review</p>
                            <h3 className="text-2xl font-sans font-bold text-foreground">145</h3>
                            <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Awaiting authority action
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-sm border-l-4 border-l-emerald-500">
                <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Verified Today</p>
                            <h3 className="text-2xl font-sans font-bold text-foreground">62</h3>
                            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Normal volume
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <FileCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

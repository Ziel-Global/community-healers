import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Frown, UserMinus, BarChart3, TrendingUp } from "lucide-react";

export function DailyResultsView() {
    const summary = [
        { label: "Passed", value: "24", icon: Trophy, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Failed", value: "8", icon: Frown, color: "text-destructive", bg: "bg-destructive/10" },
        { label: "Absent", value: "13", icon: UserMinus, color: "text-amber-500", bg: "bg-amber-500/10" },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {summary.map((item) => (
                    <Card key={item.label} className="border-border/40 bg-card/40 backdrop-blur-sm">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}>
                                <item.icon className={`w-6 h-6 ${item.color}`} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{item.label}</p>
                                <p className="text-2xl font-display font-bold text-foreground">{item.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-border/40 bg-card overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-border/40 py-4 px-6">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-display font-bold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            Day-End Summary
                        </CardTitle>
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                            <TrendingUp className="w-4 h-4" />
                            72% Pass Rate
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-muted-foreground italic">
                            * Results are automatically verified by the central system. Center Admins cannot modify scores.
                        </p>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex">
                            <div className="h-full bg-emerald-500" style={{ width: '72%' }} />
                            <div className="h-full bg-destructive" style={{ width: '28%' }} />
                        </div>
                        <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                            <span className="text-emerald-600">Pass (24)</span>
                            <span className="text-destructive">Fail (8)</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Clock, FileCheck, TrendingUp, ShieldCheck, Loader2 } from "lucide-react";
import { ministryService, DashboardStats } from "@/services/ministryService";

export function MinistryStats() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await ministryService.getDashboardStats();
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch ministry stats:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-border/40 bg-card/60 backdrop-blur-sm shadow-sm h-[104px] flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
                    </Card>
                ))}
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-center text-sm border border-destructive/20">
                Failed to load dashboard statistics.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-border/40 bg-card/60 backdrop-blur-sm shadow-sm border-l-4 border-l-primary">
                <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Total Issued</p>
                            <h3 className="text-2xl font-sans font-bold text-foreground">{stats.totalIssued.toLocaleString()}</h3>
                            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +{stats.totalIssuedPercentageChange}% this month
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
                            <h3 className="text-2xl font-sans font-bold text-foreground">{stats.pendingReview.toLocaleString()}</h3>
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
                            <h3 className="text-2xl font-sans font-bold text-foreground">{stats.verifiedToday.toLocaleString()}</h3>
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

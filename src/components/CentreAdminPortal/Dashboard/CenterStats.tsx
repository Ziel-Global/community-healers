import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle2, XCircle, PlayCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { centerAdminService } from "@/services/centerAdminService";

interface StatProps {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    description: string;
}

const Stat = ({ title, value, icon: Icon, color, description }: StatProps) => (
    <Card className="border-border/40 overflow-hidden group hover:border-primary/40 transition-all">
        <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110", color)}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest alumni-sans-subtitle">{title}</p>
                    <p className="text-3xl font-sans font-bold text-foreground">{value}</p>
                </div>
            </div>
            <p className="text-xs text-muted-foreground border-t border-border/40 pt-3 mt-2 italic">
                {description}
            </p>
        </CardContent>
    </Card>
);

export function CenterStats() {
    const [statsData, setStatsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await centerAdminService.getDashboardStats();
                setStatsData(data);
            } catch (err) {
                console.error("Failed to fetch center stats:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-border/40 bg-card/60 backdrop-blur-sm shadow-sm h-[140px] flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
                    </Card>
                ))}
            </div>
        );
    }

    if (error || !statsData) {
        return (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-center text-sm border border-destructive/20">
                Failed to load dashboard statistics.
            </div>
        );
    }

    const stats = [
        {
            title: "Scheduled Today",
            value: statsData.scheduledToday || 0,
            icon: Users,
            color: "bg-blue-500",
            description: "Total candidates for all slots today",
        },
        {
            title: "Verified (Present)",
            value: statsData.verifiedPresent || 0,
            icon: CheckCircle2,
            color: "bg-emerald-500",
            description: "Identity confirmed and training unlocked",
        },
        {
            title: "Pending / Absent",
            value: statsData.pendingOrAbsent || 0,
            icon: XCircle,
            color: "bg-amber-500",
            description: "Yet to arrive or missed their slot",
        },
        {
            title: "Exams Completed",
            value: statsData.examsCompleted || 0,
            icon: PlayCircle,
            color: "bg-primary",
            description: "Finished and scores auto-recorded",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <Stat key={stat.title} {...stat} />
            ))}
        </div>
    );
}

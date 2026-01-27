import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCircle2, XCircle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatProps {
    title: string;
    value: string;
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
    const stats = [
        {
            title: "Scheduled Today",
            value: "45",
            icon: Users,
            color: "bg-blue-500",
            description: "Total candidates for all slots today",
        },
        {
            title: "Verified (Present)",
            value: "28",
            icon: CheckCircle2,
            color: "bg-emerald-500",
            description: "Identity confirmed and exam unlocked",
        },
        {
            title: "Pending / Absent",
            value: "17",
            icon: XCircle,
            color: "bg-amber-500",
            description: "Yet to arrive or missed their slot",
        },
        {
            title: "Exams Completed",
            value: "12",
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

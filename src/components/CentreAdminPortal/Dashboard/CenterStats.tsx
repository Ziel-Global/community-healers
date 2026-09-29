import { Users, CheckCircle2, XCircle, PlayCircle, Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCenterAdminStats } from "@/hooks/queries/useCenterAdminQueries";

interface StatProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description: string;
    accent: string;
    iconWell: string;
    iconColor: string;
}

const Stat = ({ title, value, icon: Icon, description, accent, iconWell, iconColor }: StatProps) => (
    <div
        className={cn(
            "group relative overflow-hidden rounded-[20px] border border-[#e7eee9] bg-white",
            "shadow-[0_10px_30px_#163a2b08] transition-all duration-300",
            "hover:-translate-y-1 hover:shadow-[0_18px_40px_#163a2b12] hover:border-[#c9dbc0]"
        )}
    >
        <div className={cn("absolute inset-x-0 top-0 h-[3px]", accent)} />
        <div className="absolute -right-8 -top-10 w-28 h-28 rounded-full bg-[#f3f8ed] opacity-80 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />

        <div className="relative p-5 sm:p-6 flex flex-col h-full min-h-[148px]">
            <div className="flex items-start justify-between gap-3 mb-5">
                <div className={cn("w-11 h-11 rounded-[14px] flex items-center justify-center", iconWell)}>
                    <Icon className={cn("w-5 h-5", iconColor)} strokeWidth={1.75} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7a8b7e] text-right leading-tight pt-1 max-w-[9rem]">
                    {title}
                </p>
            </div>

            <p className="text-[2.35rem] leading-none font-display font-semibold text-[#183d34] tracking-tight tabular-nums">
                {value}
            </p>
            <p className="mt-auto pt-4 text-[12px] leading-relaxed text-[#64736d]">
                {description}
            </p>
        </div>
    </div>
);

export function CenterStats() {
    const { data: statsData, isLoading, isError } = useCenterAdminStats();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="rounded-[20px] border border-[#e7eee9] bg-white shadow-sm h-[148px] flex items-center justify-center"
                    >
                        <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
                    </div>
                ))}
            </div>
        );
    }

    if (isError || !statsData) {
        return (
            <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-center text-sm border border-destructive/20">
                Failed to load dashboard statistics.
            </div>
        );
    }

    const stats: StatProps[] = [
        {
            title: "Scheduled Today",
            value: statsData.scheduledToday || 0,
            icon: Users,
            description: "Total candidates for all slots today",
            accent: "bg-[#164c3e]",
            iconWell: "bg-[#e8f0ea]",
            iconColor: "text-[#164c3e]",
        },
        {
            title: "Verified (Present)",
            value: statsData.verifiedPresent || 0,
            icon: CheckCircle2,
            description: "Identity confirmed and training unlocked",
            accent: "bg-[#71a64b]",
            iconWell: "bg-[#eef6df]",
            iconColor: "text-[#426f36]",
        },
        {
            title: "Pending / Absent",
            value: statsData.pendingOrAbsent || 0,
            icon: XCircle,
            description: "Yet to arrive or missed their slot",
            accent: "bg-[#a08a55]",
            iconWell: "bg-[#f3efe6]",
            iconColor: "text-[#6a5a3a]",
        },
        {
            title: "Exams Completed",
            value: statsData.examsCompleted || 0,
            icon: PlayCircle,
            description: "Finished and scores auto-recorded",
            accent: "bg-[#328260]",
            iconWell: "bg-[#e6f1ec]",
            iconColor: "text-[#328260]",
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

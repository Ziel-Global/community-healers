import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, PlayCircle, CheckCircle2, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommitteeApplication } from "@/services/committeeMemberService";

const COMPLETED_STATUSES = new Set(["UNDER_REVIEW", "APPROVED", "REJECTED"]);

interface StatProps {
    title: string;
    value: number;
    icon: any;
    description: string;
    iconBg: string;
    glow: string;
}

const Stat = ({ title, value, icon: Icon, description, iconBg, glow }: StatProps) => (
    <Card className="relative overflow-hidden border-border/40 bg-card group hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] transition-all duration-200">
        <div className={cn("pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl opacity-60", glow)} />
        <CardContent className="relative p-5">
            <div className="flex items-start justify-between mb-4">
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110", iconBg)}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-sans font-bold text-foreground tabular-nums leading-none">{value}</p>
            </div>
            <p className="text-xs font-bold text-foreground/80 uppercase tracking-wider">{title}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{description}</p>
        </CardContent>
    </Card>
);

export function CommitteeStats({ applications }: { applications: CommitteeApplication[] }) {
    const total = applications.length;
    const active = applications.filter((a) => a.status === "INSPECTION_IN_PROGRESS" || a.status === "SCHEDULED").length;
    const inspected = applications.filter((a) => COMPLETED_STATUSES.has(a.status)).length;
    const approved = applications.filter((a) => a.status === "APPROVED").length;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat
                title="Assigned to You"
                value={total}
                icon={ClipboardList}
                description="Total applications ever assigned"
                iconBg="bg-primary"
                glow="bg-primary/20"
            />
            <Stat
                title="Active Now"
                value={active}
                icon={PlayCircle}
                description="Inspections in progress"
                iconBg="bg-primary"
                glow="bg-primary/20"
            />
            <Stat
                title="Centers Inspected"
                value={inspected}
                icon={CheckCircle2}
                description="Inspections you've submitted"
                iconBg="bg-primary"
                glow="bg-primary/20"
            />
            <Stat
                title="Approved"
                value={approved}
                icon={Award}
                description="Went on to become live centers"
                iconBg="bg-primary"
                glow="bg-primary/20"
            />
        </div>
    );
}

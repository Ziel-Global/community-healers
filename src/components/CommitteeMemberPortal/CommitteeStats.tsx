import {
    Award,
    CheckCircle2,
    ClipboardList,
    PlayCircle,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommitteeApplication } from "@/services/committeeMemberService";

const COMPLETED_STATUSES = new Set(["UNDER_REVIEW", "APPROVED", "REJECTED"]);

interface StatProps {
    title: string;
    value: number;
    icon: LucideIcon;
    description: string;
    accent: string;
    iconWell: string;
    iconColor: string;
}

const Stat = ({ title, value, icon: Icon, description, accent, iconWell, iconColor }: StatProps) => (
    <div
        className={cn(
            "group relative overflow-hidden rounded-[18px] border border-[#e7eee9] bg-white",
            "shadow-[0_10px_30px_#163a2b08] transition-all duration-300",
            "hover:-translate-y-1 hover:shadow-[0_18px_40px_#163a2b12] hover:border-[#c9dbc0]"
        )}
    >
        <div className={cn("absolute inset-x-0 top-0 h-[3px]", accent)} />
        <div className="absolute -right-8 -top-10 w-28 h-28 rounded-full bg-[#f3f8ed] opacity-80 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
        <div className="relative p-5 flex flex-col h-full min-h-[132px]">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className={cn("w-10 h-10 rounded-[12px] flex items-center justify-center", iconWell)}>
                    <Icon className={cn("w-4 h-4", iconColor)} strokeWidth={1.75} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7a8b7e] text-right leading-tight pt-1 max-w-[7.5rem]">
                    {title}
                </p>
            </div>
            <p className="text-[2rem] leading-none font-display font-semibold text-[#183d34] tracking-tight tabular-nums">
                {value}
            </p>
            <p className="mt-auto pt-3 text-[12px] leading-relaxed text-[#64736d]">{description}</p>
        </div>
    </div>
);

export function CommitteeStats({ applications }: { applications: CommitteeApplication[] }) {
    const total = applications.length;
    const active = applications.filter((a) => a.status === "INSPECTION_IN_PROGRESS" || a.status === "SCHEDULED").length;
    const inspected = applications.filter((a) => COMPLETED_STATUSES.has(a.status)).length;
    const approved = applications.filter((a) => a.status === "APPROVED").length;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat
                title="Assigned to You"
                value={total}
                icon={ClipboardList}
                description="Total applications ever assigned"
                accent="bg-[#164c3e]"
                iconWell="bg-[#e8f0ea]"
                iconColor="text-[#164c3e]"
            />
            <Stat
                title="Active Now"
                value={active}
                icon={PlayCircle}
                description="Scheduled or awaiting visit"
                accent="bg-[#328260]"
                iconWell="bg-[#e6f1ec]"
                iconColor="text-[#328260]"
            />
            <Stat
                title="Centers Inspected"
                value={inspected}
                icon={CheckCircle2}
                description="Inspections you've submitted"
                accent="bg-[#71a64b]"
                iconWell="bg-[#eef6df]"
                iconColor="text-[#426f36]"
            />
            <Stat
                title="Approved"
                value={approved}
                icon={Award}
                description="Went on to become live centers"
                accent="bg-[#a08a55]"
                iconWell="bg-[#f3efe6]"
                iconColor="text-[#6a5a3a]"
            />
        </div>
    );
}

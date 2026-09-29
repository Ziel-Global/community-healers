import { Link } from "react-router-dom";
import {
    Briefcase,
    Building2,
    CheckCircle2,
    ClipboardList,
    Users,
    XCircle,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiItem {
    title: string;
    value: number;
    description: string;
    icon: LucideIcon;
    accent: string;
    iconWell: string;
    iconColor: string;
    href?: string;
}

function KpiCard({ title, value, description, icon: Icon, accent, iconWell, iconColor, href }: KpiItem) {
    const inner = (
        <>
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
        </>
    );

    const className = cn(
        "group relative overflow-hidden rounded-[18px] border border-[#e7eee9] bg-white",
        "shadow-[0_10px_30px_#163a2b08] transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-[0_18px_40px_#163a2b12] hover:border-[#c9dbc0]",
        href && "block"
    );

    if (href) {
        return (
            <Link to={href} className={className}>
                {inner}
            </Link>
        );
    }

    return <div className={className}>{inner}</div>;
}

interface BureauKpisProps {
    total: number;
    active: number;
    approved: number;
    rejected: number;
    committeeMembers: number;
}

export function BureauKpis({ total, active, approved, rejected, committeeMembers }: BureauKpisProps) {
    const stats: KpiItem[] = [
        {
            title: "Total",
            value: total,
            description: "All submitted applications",
            icon: Briefcase,
            accent: "bg-[#164c3e]",
            iconWell: "bg-[#e8f0ea]",
            iconColor: "text-[#164c3e]",
            href: "/bureau/applications",
        },
        {
            title: "Active",
            value: active,
            description: "Still moving through the pipeline",
            icon: ClipboardList,
            accent: "bg-[#328260]",
            iconWell: "bg-[#e6f1ec]",
            iconColor: "text-[#328260]",
            href: "/bureau/applications",
        },
        {
            title: "Approved",
            value: approved,
            description: "Centers confirmed by the Bureau",
            icon: CheckCircle2,
            accent: "bg-[#71a64b]",
            iconWell: "bg-[#eef6df]",
            iconColor: "text-[#426f36]",
            href: "/bureau/centers",
        },
        {
            title: "Rejected",
            value: rejected,
            description: "Applications not proceeding",
            icon: XCircle,
            accent: "bg-[#a08a55]",
            iconWell: "bg-[#f3efe6]",
            iconColor: "text-[#6a5a3a]",
        },
        {
            title: "Committee",
            value: committeeMembers,
            description: "Approval Committee members",
            icon: Users,
            accent: "bg-[#164c3e]",
            iconWell: "bg-[#e8f0ea]",
            iconColor: "text-[#164c3e]",
        },
    ];

    return (
        <div className="space-y-3">
            <div className="flex items-end justify-between gap-3 px-0.5">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6d8474]">Snapshot</p>
                    <h2 className="text-lg font-semibold text-[#183d34] tracking-tight mt-0.5">At a glance</h2>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/bureau/applications"
                        className="text-xs font-semibold text-[#164c3e] hover:underline inline-flex items-center gap-1"
                    >
                        <ClipboardList className="w-3.5 h-3.5" /> Applications
                    </Link>
                    <Link
                        to="/bureau/centers"
                        className="text-xs font-semibold text-[#164c3e] hover:underline inline-flex items-center gap-1"
                    >
                        <Building2 className="w-3.5 h-3.5" /> Centers
                    </Link>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {stats.map((stat) => (
                    <KpiCard key={stat.title} {...stat} />
                ))}
            </div>
        </div>
    );
}

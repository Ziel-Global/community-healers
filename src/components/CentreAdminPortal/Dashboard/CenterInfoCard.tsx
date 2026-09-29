import { Building2, MapPin, ShieldCheck, Mail, Clock, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CenterInfoProps {
    name?: string;
    id?: string;
    licenseNumber?: string | null;
    phone?: string | null;
    location?: string;
    adminName?: string;
    email?: string;
    trainingStartTime?: string;
    trainingEndTime?: string;
    isLoading?: boolean;
}

function MetaTile({
    icon: Icon,
    label,
    value,
    tone = "mint",
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    tone?: "mint" | "lime" | "warm";
}) {
    const tones = {
        mint: "bg-[#edf3ea] text-[#355c45]",
        lime: "bg-[#eef6df] text-[#426f36]",
        warm: "bg-[#f3efe6] text-[#6a5a3a]",
    };

    return (
        <div className="flex items-start gap-3 rounded-2xl border border-[#e7eee9] bg-white/70 px-4 py-3.5 min-w-0">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", tones[tone])}>
                <Icon className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a8b7e] mb-1">
                    {label}
                </p>
                <p className="text-sm font-semibold text-[#183d34] truncate leading-snug">{value}</p>
            </div>
        </div>
    );
}

export function CenterInfoCard({
    name = "Lahore Training Center #3",
    id = "LHR-003",
    licenseNumber,
    phone,
    location = "Model Town, Lahore",
    adminName = "M. Siddique",
    email,
    trainingStartTime,
    trainingEndTime,
    isLoading = false
}: CenterInfoProps) {
    if (isLoading) {
        return (
            <div className="rounded-[22px] border border-[#e7eee9] bg-white overflow-hidden shadow-[0_18px_50px_#163a2b0a]">
                <div className="p-6 sm:p-7">
                    <div className="flex flex-col xl:flex-row xl:items-center gap-6 xl:gap-10">
                        <div className="flex items-center gap-4 flex-1">
                            <Skeleton className="w-16 h-16 rounded-2xl" />
                            <div className="space-y-3 flex-1">
                                <Skeleton className="h-7 w-64 max-w-full" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                            <Skeleton className="h-[72px] rounded-2xl" />
                            <Skeleton className="h-[72px] rounded-2xl" />
                            <Skeleton className="h-[72px] rounded-2xl" />
                            <Skeleton className="h-[72px] rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const contactEmail = email || `support@${id.toLowerCase()}.gov.pk`;
    const displayId = licenseNumber || id;
    const timingsLabel =
        trainingStartTime && trainingEndTime
            ? `${trainingStartTime} – ${trainingEndTime}`
            : null;

    return (
        <div className="relative rounded-[22px] border border-[#e7eee9] overflow-hidden shadow-[0_18px_50px_#163a2b0a] bg-[linear-gradient(135deg,#ffffff_0%,#f7faf4_55%,#eef5e8_100%)]">
            <div className="absolute inset-y-0 left-0 w-1 bg-[linear-gradient(180deg,#164c3e_0%,#71a64b_100%)]" />
            <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full bg-[#d7f88c]/20 blur-3xl pointer-events-none" />

            <div className="relative p-6 sm:p-7 pl-7 sm:pl-8">
                <div className="flex flex-col xl:flex-row xl:items-center gap-7 xl:gap-10">
                    <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
                        <div className="relative shrink-0">
                            <div className="w-16 h-16 rounded-[18px] bg-[#164c3e] flex items-center justify-center shadow-[0_12px_28px_#164c3e33]">
                                <Building2 className="w-7 h-7 text-white" strokeWidth={1.6} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#d7f88c] border-[3px] border-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6d8474] mb-1.5">
                                Your training centre
                            </p>
                            <h2 className="text-2xl sm:text-[1.7rem] font-display font-semibold text-[#183d34] tracking-tight leading-tight truncate">
                                {name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2.5 mt-3">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#164c3e] text-[#d7f88c] text-[10px] font-bold tracking-[0.08em] uppercase">
                                    ID · {displayId}
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-sm text-[#5a7064]">
                                    <MapPin className="w-3.5 h-3.5 text-[#378456]" />
                                    {location}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full xl:max-w-xl">
                        {timingsLabel && (
                            <MetaTile icon={Clock} label="Training Hours" value={timingsLabel} tone="warm" />
                        )}
                        <MetaTile icon={ShieldCheck} label="Verified Admin" value={adminName} tone="lime" />
                        <MetaTile icon={Mail} label="Center Contact" value={contactEmail} tone="mint" />
                        {phone && (
                            <MetaTile icon={Phone} label="Center Phone" value={phone} tone="mint" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import type { CenterApplicationStatus } from "@/services/centerApplicationService";

/** Single source of truth for how each status renders — kanban column, card badge, table pill, detail page. */
export const APPLICATION_STATUS_META: Record<
    CenterApplicationStatus,
    {
        label: string;
        badgeVariant: "default" | "secondary" | "destructive" | "success" | "outline";
        dot: string;
        glow: string;
        chipClassName: string;
    }
> = {
    PENDING_VERIFICATION: {
        label: "Pending Verification",
        badgeVariant: "outline",
        dot: "bg-slate-400",
        glow: "shadow-[0_0_0_4px_rgba(148,163,184,0.15)]",
        chipClassName: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
    },
    DETAILS_PENDING: {
        label: "Details Pending",
        badgeVariant: "outline",
        dot: "bg-slate-400",
        glow: "shadow-[0_0_0_4px_rgba(148,163,184,0.15)]",
        chipClassName: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
    },
    INSPECTION_PENDING: {
        label: "New",
        badgeVariant: "secondary",
        dot: "bg-slate-400",
        glow: "shadow-[0_0_0_4px_rgba(148,163,184,0.18)]",
        chipClassName: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
    },
    PENDING_CHAIRMAN_REVIEW: {
        label: "Chairman review",
        badgeVariant: "outline",
        dot: "bg-[#a08a55]",
        glow: "shadow-[0_0_0_4px_rgba(160,138,85,0.16)]",
        chipClassName: "bg-[#f3efe6] text-[#6a5a3a] border-[#e0d4bb]",
    },
    INSPECTION_IN_PROGRESS: {
        label: "Assigned",
        badgeVariant: "default",
        dot: "bg-[#328260]",
        glow: "shadow-[0_0_0_4px_rgba(50,130,96,0.16)]",
        chipClassName: "bg-[#e6f1ec] text-[#328260] border-[#c9dbc0]",
    },
    SCHEDULED: {
        label: "Scheduled",
        badgeVariant: "default",
        dot: "bg-[#164c3e]",
        glow: "shadow-[0_0_0_4px_rgba(22,76,62,0.16)]",
        chipClassName: "bg-[#e8f0ea] text-[#164c3e] border-[#c9d6c8]",
    },
    UNDER_REVIEW: {
        label: "Under Review",
        badgeVariant: "outline",
        dot: "bg-[#a08a55]",
        glow: "shadow-[0_0_0_4px_rgba(160,138,85,0.16)]",
        chipClassName: "bg-[#f3efe6] text-[#6a5a3a] border-[#e0d4bb]",
    },
    APPROVED: {
        label: "Approved",
        badgeVariant: "success",
        dot: "bg-[#71a64b]",
        glow: "shadow-[0_0_0_4px_rgba(113,166,75,0.16)]",
        chipClassName: "bg-[#eef6df] text-[#426f36] border-[#c9dbc0]",
    },
    REJECTED: {
        label: "Rejected",
        badgeVariant: "destructive",
        dot: "bg-red-600",
        glow: "shadow-[0_0_0_4px_rgba(220,38,38,0.16)]",
        chipClassName: "bg-red-50 text-red-700 border-red-200",
    },
};

/** The 5 stages Super Admin actually acts on — pre-submission stages (PENDING_VERIFICATION/DETAILS_PENDING) live with the applicant, not on this board. */
export const KANBAN_STATUSES: CenterApplicationStatus[] = [
    "INSPECTION_PENDING",
    "PENDING_CHAIRMAN_REVIEW",
    "INSPECTION_IN_PROGRESS",
    "SCHEDULED",
    "UNDER_REVIEW",
    "APPROVED",
    "REJECTED",
];

export function initials(firstName: string | null, lastName: string | null, fallback: string): string {
    const first = firstName?.[0] ?? "";
    const last = lastName?.[0] ?? "";
    const combined = `${first}${last}`.toUpperCase();
    return combined || fallback.slice(0, 2).toUpperCase();
}

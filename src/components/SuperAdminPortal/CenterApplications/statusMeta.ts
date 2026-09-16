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
    INSPECTION_IN_PROGRESS: {
        label: "Assigned",
        badgeVariant: "default",
        dot: "bg-sky-500",
        glow: "shadow-[0_0_0_4px_rgba(14,165,233,0.16)]",
        chipClassName: "bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/20",
    },
    UNDER_REVIEW: {
        label: "Under Review",
        badgeVariant: "outline",
        dot: "bg-amber-500",
        glow: "shadow-[0_0_0_4px_rgba(245,158,11,0.16)]",
        chipClassName: "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20",
    },
    APPROVED: {
        label: "Approved",
        badgeVariant: "success",
        dot: "bg-emerald-500",
        glow: "shadow-[0_0_0_4px_rgba(16,185,129,0.16)]",
        chipClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20",
    },
    REJECTED: {
        label: "Rejected",
        badgeVariant: "destructive",
        dot: "bg-red-500",
        glow: "shadow-[0_0_0_4px_rgba(239,68,68,0.16)]",
        chipClassName: "bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/20",
    },
};

/** The 5 stages Super Admin actually acts on — pre-submission stages (PENDING_VERIFICATION/DETAILS_PENDING) live with the applicant, not on this board. */
export const KANBAN_STATUSES: CenterApplicationStatus[] = [
    "INSPECTION_PENDING",
    "INSPECTION_IN_PROGRESS",
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

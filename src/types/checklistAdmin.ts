export type ChecklistCategory = "OPERATIONS_COMPLIANCE" | "BUILDING_FACILITIES" | "STAFF_TRAINERS";

/**
 * The shared inspection/prerequisite checklist — same list drives the
 * applicant's prerequisite checklist and the committee member's on-site
 * physical inspection. No "required" concept (every active item applies)
 * and no delete — only `active` toggles an item off.
 */
export interface AdminChecklistItem {
    id: string;
    label: string;
    description: string | null;
    sortOrder: number;
    active: boolean;
    category: ChecklistCategory;
    requiresPhoto: boolean;
}

export interface CreateChecklistItemPayload {
    label: string;
    description?: string;
    category: ChecklistCategory;
    requiresPhoto?: boolean;
    sortOrder?: number;
}

export interface UpdateChecklistItemPayload {
    label?: string;
    description?: string;
    sortOrder?: number;
    active?: boolean;
    requiresPhoto?: boolean;
}

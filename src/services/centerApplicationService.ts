import { api } from './api';

/** Mirrors CenterApplicationStatus in ministry_backend/src/utils/enums.ts. */
export type CenterApplicationStatus =
    | 'PENDING_VERIFICATION'
    | 'DETAILS_PENDING'
    | 'INSPECTION_PENDING'
    | 'INSPECTION_IN_PROGRESS'
    | 'SCHEDULED'
    | 'UNDER_REVIEW'
    | 'APPROVED'
    | 'REJECTED';

export interface CommitteeMemberSummary {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
}

export interface CommitteeSummary {
    id: string;
    name: string;
    members: CommitteeMemberSummary[];
}

export interface CenterApplicationCity {
    id: string;
    name: string;
}

/** One row of the kanban board / list view — matches the bare CenterApplication entity. */
export interface CenterApplicationSummary {
    id: string;
    cnic: string;
    licenseNumber: string;
    status: CenterApplicationStatus;
    centerName: string | null;
    address: string | null;
    centerPhone: string | null;
    phone: string | null;
    cityId: string | null;
    committeeId: string | null;
    scheduledInspectionDate: string | null;
    inspectionAssignedAt: string | null;
    inspectionCompletedAt: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
    isJointVenture: boolean;
    jointVentureLicenseNumber: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CenterApplicationStaffMember {
    id: string;
    name: string;
    cnic: string;
    category: 'INSTRUCTOR' | 'STAFF' | 'MAINTENANCE';
    qualification: string | null;
    documentObjectKey: string | null;
}

export interface ChecklistEvidenceItem {
    id: string;
    createdAt: string;
}

export interface ChecklistResultDetail {
    id: string;
    checklistItemId: string;
    passed: boolean | null;
    notes: string | null;
    checklistItem: { id: string; label: string; description: string | null };
    evidence: ChecklistEvidenceItem[];
}

export interface AttendanceEntry {
    memberUserId: string;
    memberName: string;
    attending: boolean | null;
    reason: string | null;
    updatedAt: string;
}

export interface CenterApplicationDetail {
    application: CenterApplicationSummary & {
        staff: CenterApplicationStaffMember[];
        committee: CommitteeSummary | null;
        city: CenterApplicationCity | null;
    };
    checklistResults: ChecklistResultDetail[];
    attendance: AttendanceEntry[];
}

/**
 * Shared read/download surface — Director of Operations gets the full write
 * API on top of this (see below); Super Admin only ever gets this read-only
 * slice, bound to `/super-admin/center-applications` instead.
 */
function createCenterApplicationReadApi(prefix: string) {
    return {
        listApplications: async (): Promise<CenterApplicationSummary[]> => {
            const response = await api.get(prefix);
            return response.data;
        },
        getApplicationDetail: async (id: string): Promise<CenterApplicationDetail> => {
            const response = await api.get(`${prefix}/${id}`);
            return response.data;
        },
        /**
         * Evidence photos require X-Requested-With on cookie-authenticated requests
         * (CSRF protection) — a plain <img> tag can't send that header, so this goes
         * through `api` (axios) as a blob and the caller turns it into an object URL.
         * Same pattern as `centerAdminService.getCandidateDocumentBlob`.
         */
        getEvidenceBlob: async (evidenceId: string): Promise<Blob> => {
            const response = await api.get(`${prefix}/evidence/${evidenceId}/download`, { responseType: 'blob' });
            return response.data;
        },
        getStaffDocumentBlob: async (staffId: string): Promise<Blob> => {
            const response = await api.get(`${prefix}/staff/${staffId}/document/download`, { responseType: 'blob' });
            return response.data;
        },
    };
}

/** Super Admin — view only, per the Approval Committee workflow. No assign/approve/reject. */
export const superAdminCenterApplicationService = createCenterApplicationReadApi('/super-admin/center-applications');

/**
 * Director of Operations — full read/write access to the pipeline. Lives under `/internal` on
 * the backend (not `/director-operations`) specifically so it can't collide with the frontend's
 * own `/director-operations/*` page routes once that prefix is added to the Vite dev proxy —
 * same reason Center Onboarding's public page is `/apply-center`, not `/center-onboarding`.
 */
const DO_CENTER_APPLICATIONS_PREFIX = '/internal/director-operations/center-applications';

export const directorOperationsCenterApplicationService = {
    ...createCenterApplicationReadApi(DO_CENTER_APPLICATIONS_PREFIX),

    assignCommittee: async (applicationId: string, committeeId: string): Promise<CenterApplicationSummary> => {
        const response = await api.post(`${DO_CENTER_APPLICATIONS_PREFIX}/${applicationId}/assign-committee`, { committeeId });
        return response.data;
    },
    approveApplication: async (applicationId: string) => {
        const response = await api.post(`${DO_CENTER_APPLICATIONS_PREFIX}/${applicationId}/approve`);
        return response.data;
    },
    rejectApplication: async (applicationId: string, reason: string): Promise<CenterApplicationSummary> => {
        const response = await api.post(`${DO_CENTER_APPLICATIONS_PREFIX}/${applicationId}/reject`, { reason });
        return response.data;
    },
};

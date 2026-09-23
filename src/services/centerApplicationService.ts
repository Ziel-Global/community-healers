import { api } from './api';
import type { StaffCategory } from './centerOnboardingService';

/** Mirrors CenterApplicationStatus in ministry_backend/src/utils/enums.ts. */
export type CenterApplicationStatus =
    | 'PENDING_VERIFICATION'
    | 'DETAILS_PENDING'
    | 'INSPECTION_PENDING'
    | 'PENDING_CHAIRMAN_REVIEW'
    | 'INSPECTION_IN_PROGRESS'
    | 'SCHEDULED'
    | 'UNDER_REVIEW'
    | 'APPROVED'
    | 'REJECTED';

export interface BureauLicenseData {
    phone?: string;
    valid?: boolean;
    ownerName?: string;
    centerName?: string;
    licenseIssuedDate?: string;
}

export interface ChairmanReviewedByUser {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
}

export interface CommitteeMemberSummary {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phoneNumber?: string | null;
    role?: 'COMMITTEE_CHAIRMAN' | 'COMMITTEE_MEMBER';
    status?: 'ACTIVE' | 'INACTIVE';
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
    email: string | null;
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
    chairmanReviewedAt?: string | null;
    chairmanReviewedByUserId?: string | null;
    chairmanReturnReason?: string | null;
    resultingCenterId?: string | null;
    bureauVerified?: boolean;
    detailsStep?: number;
    buildingArea?: string | null;
    buildingCapacity?: number | null;
    buildingOwnership?: string | null;
    receptionAvailable?: boolean | null;
    requiredSystemsAvailable?: boolean | null;
    camerasAvailable?: boolean | null;
    camerasInfo?: string | null;
    bureauData?: BureauLicenseData | null;
    inspectorId?: string | null;
    reviewedByUserId?: string | null;
}

export interface CenterApplicationStaffMember {
    id: string;
    name: string;
    cnic: string;
    category: StaffCategory;
    qualification: string | null;
    documentObjectKey: string | null;
}

export interface ChecklistEvidenceItem {
    id: string;
    createdAt: string;
}

export type ChecklistCategory = 'OPERATIONS_COMPLIANCE' | 'BUILDING_FACILITIES' | 'STAFF_TRAINERS';

export interface ChecklistResultDetail {
    id: string;
    checklistItemId: string;
    /** Reused as a plain "done" tick for non-photo items — pass/fail is no longer a concept here. */
    passed: boolean | null;
    notes: string | null;
    checklistItem: {
        id: string;
        label: string;
        description: string | null;
        category: ChecklistCategory;
        requiresPhoto: boolean;
    };
    evidence: ChecklistEvidenceItem[];
}

export interface AttendanceEntry {
    memberUserId: string;
    memberName: string;
    attending: boolean | null;
    reason: string | null;
    updatedAt: string;
}

export interface CenterApplicationDetailApplication extends CenterApplicationSummary {
    staff: CenterApplicationStaffMember[];
    committee: CommitteeSummary | null;
    city: CenterApplicationCity | null;
    chairmanReviewedBy?: ChairmanReviewedByUser | null;
}

export interface CenterApplicationDetail {
    application: CenterApplicationDetailApplication;
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
 * Bureau — full read/write access to the pipeline. The API lives under `/internal/bureau`
 * (not `/bureau`) so it can't collide with the frontend's `/bureau/*` page routes.
 * same reason Center Onboarding's public page is `/apply-center`, not `/center-onboarding`.
 */
const DO_CENTER_APPLICATIONS_PREFIX = '/internal/bureau/center-applications';

/** Director of Operations assigns a committee — the final approve/reject call belongs to the committee itself now (view-only here). */
export const directorOperationsCenterApplicationService = {
    ...createCenterApplicationReadApi(DO_CENTER_APPLICATIONS_PREFIX),

    assignCommittee: async (applicationId: string, committeeId: string): Promise<CenterApplicationSummary> => {
        const response = await api.post(`${DO_CENTER_APPLICATIONS_PREFIX}/${applicationId}/assign-committee`, { committeeId });
        return response.data;
    },
};

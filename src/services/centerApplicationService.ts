import { api } from './api';

/** Mirrors CenterApplicationStatus in ministry_backend/src/utils/enums.ts. */
export type CenterApplicationStatus =
    | 'PENDING_VERIFICATION'
    | 'DETAILS_PENDING'
    | 'INSPECTION_PENDING'
    | 'INSPECTION_IN_PROGRESS'
    | 'UNDER_REVIEW'
    | 'APPROVED'
    | 'REJECTED';

export interface CenterApplicationInspector {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phoneNumber: string | null;
    status: "ACTIVE" | "INACTIVE";
    createdAt: string;
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
    phone: string | null;
    cityId: string | null;
    inspectorId: string | null;
    inspectionAssignedAt: string | null;
    inspectionCompletedAt: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CenterApplicationStaffMember {
    id: string;
    name: string;
    cnic: string;
    category: 'INSTRUCTOR' | 'STAFF' | 'MAINTENANCE';
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

export interface CenterApplicationDetail {
    application: CenterApplicationSummary & {
        staff: CenterApplicationStaffMember[];
        inspector: CenterApplicationInspector | null;
        city: CenterApplicationCity | null;
    };
    checklistResults: ChecklistResultDetail[];
}

const listApplications = async (): Promise<CenterApplicationSummary[]> => {
    const response = await api.get('/super-admin/center-applications');
    return response.data;
};

const getApplicationDetail = async (id: string): Promise<CenterApplicationDetail> => {
    const response = await api.get(`/super-admin/center-applications/${id}`);
    return response.data;
};

const assignInspector = async (applicationId: string, inspectorId: string): Promise<CenterApplicationSummary> => {
    const response = await api.post(`/super-admin/center-applications/${applicationId}/assign-inspector`, { inspectorId });
    return response.data;
};

const approveApplication = async (applicationId: string) => {
    const response = await api.post(`/super-admin/center-applications/${applicationId}/approve`);
    return response.data;
};

const rejectApplication = async (applicationId: string, reason: string): Promise<CenterApplicationSummary> => {
    const response = await api.post(`/super-admin/center-applications/${applicationId}/reject`, { reason });
    return response.data;
};

const listInspectors = async (): Promise<CenterApplicationInspector[]> => {
    const response = await api.get('/super-admin/inspectors');
    return response.data;
};

export interface CreateInspectorRequest {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    phoneNumber?: string;
}

const createInspector = async (request: CreateInspectorRequest): Promise<CenterApplicationInspector> => {
    const response = await api.post('/super-admin/inspectors', request);
    return response.data;
};

/**
 * Evidence photos require X-Requested-With on cookie-authenticated requests
 * (CSRF protection) — a plain <img> tag can't send that header, so this goes
 * through `api` (axios) as a blob and the caller turns it into an object URL.
 * Same pattern as `centerAdminService.getCandidateDocumentBlob`.
 */
const getEvidenceBlob = async (evidenceId: string): Promise<Blob> => {
    const response = await api.get(`/super-admin/center-applications/evidence/${evidenceId}/download`, {
        responseType: 'blob',
    });
    return response.data;
};

export const centerApplicationService = {
    listApplications,
    getApplicationDetail,
    assignInspector,
    approveApplication,
    rejectApplication,
    listInspectors,
    createInspector,
    getEvidenceBlob,
};

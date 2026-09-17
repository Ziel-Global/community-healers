import { api } from './api';

export interface CommitteeApplication {
    id: string;
    centerName: string | null;
    address: string | null;
    status: string;
    cnic: string;
    licenseNumber: string;
    inspectionAssignedAt: string | null;
    inspectionCompletedAt: string | null;
    reviewedAt: string | null;
    rejectionReason: string | null;
    scheduledInspectionDate: string | null;
    createdAt: string;
    updatedAt: string;
}

export type ChecklistCategory = 'OPERATIONS_COMPLIANCE' | 'BUILDING_FACILITIES' | 'STAFF_TRAINERS';

export interface CommitteeChecklistItem {
    checklistItemId: string;
    label: string;
    description: string | null;
    category: ChecklistCategory;
    /** True for the ~13 "main things" that need a photo; everything else is a plain checkbox. */
    requiresPhoto: boolean;
    checked: boolean;
    evidence: { id: string }[];
}

export interface AttendanceEntry {
    memberUserId: string;
    memberName: string;
    attending: boolean | null;
    reason: string | null;
    updatedAt: string;
}

export interface CommitteeApplicationDetail {
    application: {
        id: string;
        status: string;
        centerName: string | null;
        address: string | null;
        scheduledInspectionDate: string | null;
    };
    checklist: CommitteeChecklistItem[];
    attendance: AttendanceEntry[];
    myAttendance: AttendanceEntry | null;
}

const getAssignedApplications = async (): Promise<CommitteeApplication[]> => {
    const response = await api.get('/internal/committee/applications');
    return response.data;
};

const getApplicationDetail = async (applicationId: string): Promise<CommitteeApplicationDetail> => {
    const response = await api.get(`/internal/committee/applications/${applicationId}`);
    return response.data;
};

const uploadEvidence = async (applicationId: string, checklistItemId: string, photo: File) => {
    const formData = new FormData();
    formData.append('photo', photo);
    const response = await api.post(
        `/internal/committee/applications/${applicationId}/checklist/${checklistItemId}/evidence`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
};

const setChecklistChecked = async (applicationId: string, checklistItemId: string, checked: boolean) => {
    const response = await api.patch(
        `/internal/committee/applications/${applicationId}/checklist/${checklistItemId}`,
        { checked },
    );
    return response.data;
};

/** The committee's own final call — creates the real Center + admin login on approval. */
const approveInspection = async (applicationId: string) => {
    const response = await api.post(`/internal/committee/applications/${applicationId}/approve`);
    return response.data;
};

const rejectInspection = async (applicationId: string, reason: string) => {
    const response = await api.post(`/internal/committee/applications/${applicationId}/reject`, { reason });
    return response.data;
};

const setAttendance = async (
    applicationId: string,
    attending: boolean,
    reason?: string,
): Promise<AttendanceEntry[]> => {
    const response = await api.post(`/internal/committee/applications/${applicationId}/attendance`, {
        attending,
        reason,
    });
    return response.data;
};

export const committeeMemberService = {
    getAssignedApplications,
    getApplicationDetail,
    uploadEvidence,
    setChecklistChecked,
    approveInspection,
    rejectInspection,
    setAttendance,
};

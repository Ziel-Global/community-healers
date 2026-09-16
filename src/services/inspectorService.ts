import { api } from './api';

export interface InspectorApplication {
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
    createdAt: string;
    updatedAt: string;
}

export interface InspectorChecklistItem {
    checklistItemId: string;
    label: string;
    description: string | null;
    passed: boolean | null;
    notes: string | null;
    evidence: { id: string }[];
}

export interface InspectorApplicationDetail {
    application: {
        id: string;
        status: string;
        centerName: string | null;
        address: string | null;
    };
    checklist: InspectorChecklistItem[];
}

const getAssignedApplications = async (): Promise<InspectorApplication[]> => {
    const response = await api.get('/inspections/applications');
    return response.data;
};

const getApplicationDetail = async (applicationId: string): Promise<InspectorApplicationDetail> => {
    const response = await api.get(`/inspections/applications/${applicationId}`);
    return response.data;
};

const uploadEvidence = async (applicationId: string, checklistItemId: string, photo: File) => {
    const formData = new FormData();
    formData.append('photo', photo);
    const response = await api.post(
        `/inspections/applications/${applicationId}/checklist/${checklistItemId}/evidence`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
};

const setChecklistResult = async (
    applicationId: string,
    checklistItemId: string,
    passed: boolean,
    notes?: string,
) => {
    const response = await api.patch(
        `/inspections/applications/${applicationId}/checklist/${checklistItemId}`,
        { passed, notes },
    );
    return response.data;
};

const submitInspection = async (applicationId: string) => {
    const response = await api.post(`/inspections/applications/${applicationId}/submit`);
    return response.data;
};

export const inspectorService = {
    getAssignedApplications,
    getApplicationDetail,
    uploadEvidence,
    setChecklistResult,
    submitInspection,
};

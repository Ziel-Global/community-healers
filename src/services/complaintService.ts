import { api } from './api';

export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface Complaint {
    id: string;
    subject: string;
    description: string;
    status: ComplaintStatus;
    resolutionNote: string | null;
    resolvedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ComplaintListParams {
    status?: ComplaintStatus;
    page?: number;
    limit?: number;
}

export interface PaginatedComplaints {
    data: Complaint[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface CreateComplaintPayload {
    subject: string;
    description: string;
}

/** Candidate: file a complaint against their own account. Rate-limited: 10 per 15 minutes per IP. */
const createComplaint = async (payload: CreateComplaintPayload): Promise<Complaint> => {
    const response = await api.post('/candidates/me/complaints', payload);
    return response.data;
};

/** Candidate: their own complaints only, newest first. */
const getMyComplaints = async (params?: ComplaintListParams): Promise<PaginatedComplaints> => {
    const response = await api.get('/candidates/me/complaints', { params });
    return response.data;
};

export const complaintService = {
    createComplaint,
    getMyComplaints,
};

/** The Super Admin view adds `complainant` and `resolvedBy`, absent from the candidate's own list. */
export interface AdminComplaint extends Complaint {
    complainant: {
        id: string;
        name: string;
        email: string;
        phoneNumber: string | null;
    };
    resolvedBy: { id: string; name: string; email: string } | null;
}

export interface AdminComplaintListParams extends ComplaintListParams {
    search?: string;
}

export interface UpdateComplaintStatusPayload {
    status: ComplaintStatus;
    /** Optional, max 2000 chars — an empty string explicitly clears it; omitting leaves it unchanged. */
    resolutionNote?: string;
}

const getAllComplaints = async (params?: AdminComplaintListParams): Promise<{ data: AdminComplaint[]; pagination: PaginatedComplaints['pagination'] }> => {
    const response = await api.get('/super-admin/complaints', { params });
    return response.data;
};

const getComplaintById = async (id: string): Promise<AdminComplaint> => {
    const response = await api.get(`/super-admin/complaints/${id}`);
    return response.data;
};

const updateComplaintStatus = async (id: string, payload: UpdateComplaintStatusPayload): Promise<AdminComplaint> => {
    const response = await api.patch(`/super-admin/complaints/${id}/status`, payload);
    return response.data;
};

export const adminComplaintService = {
    getAllComplaints,
    getComplaintById,
    updateComplaintStatus,
};

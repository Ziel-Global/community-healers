import { api } from './api';

export interface CandidateDocument {
    id: string;
    type: string;
    fileUrl: string;
    reviewStatus?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Candidate {
    userId: string;
    cnic: string | null;
    fatherName: string | null;
    dob: string | null;
    address: string | null;
    candidateStatus: string | null;
    examDate: string | null;
    examStartTime: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
    };
    city?: {
        id: string;
        name: string;
    } | null;
    documents?: CandidateDocument[];
}

export interface ExamSessionRecord {
    id: string;
    userId: string;
    examStartTime: string;
    date: string;
    candidateStatus: string;
    actualExamStartTime?: string | null;
    examEndTime?: string | null;
    draftAnswers?: Record<string, number> | null;
}

export interface CloseVerificationResult {
    updatedCount: number;
    date: string;
    centerIds: string[];
    results: Array<Record<string, unknown>>;
    candidateIds?: string[];
    message?: string;
}

export interface CenterDetails {
    id: string;
    name: string;
    city?: {
        id: string;
        name: string;
    };
    address?: string;
    capacity?: number;
    status?: string;
    trainingStartTime?: string;
    trainingEndTime?: string;
    primaryAdmin?: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

export interface CenterDashboardStats {
    scheduledToday?: number;
    verifiedPresent?: number;
    pendingOrAbsent?: number;
    examsCompleted?: number;
}

export interface HistoricalReport {
    examDate: string;
    candidates: number;
    passRate: number;
}

export const getTodayCandidates = async (examDate: string): Promise<Candidate[]> => {
    try {
        const response = await api.get('/center-admin/candidates', {
            params: {
                examDate,
            }
        });

        return response.data || [];
    } catch (error: unknown) {
        console.error('Error fetching candidates:', error);
        throw error;
    }
};

export const updateCandidateStatus = async (id: string, status: 'VERIFIED' | 'REJECTED'): Promise<ExamSessionRecord> => {
    try {
        const response = await api.patch(`/center-admin/exam-session/${id}/candidate-status`, {
            status
        });
        return response.data;
    } catch (error: unknown) {
        console.error('Error updating candidate status:', error);
        throw error;
    }
};

type CenterDetailsRawResponse = CenterDetails[] | { centers?: CenterDetails[] } | CenterDetails | null | undefined;

export const getCenterDetails = async (): Promise<CenterDetails | null> => {
    try {
        const response = await api.get<CenterDetailsRawResponse>('/center-admin/center-details');
        const nested = response.data;

        if (Array.isArray(nested)) {
            return nested[0] || null;
        }
        if (nested && 'centers' in nested && Array.isArray(nested.centers)) {
            return nested.centers[0] || null;
        }
        if (nested && ('id' in nested || 'name' in nested)) {
            return nested as CenterDetails;
        }
        return null;
    } catch (error: unknown) {
        console.error('Error fetching center details:', error);
        throw error;
    }
};

export const getReports = async (): Promise<HistoricalReport[]> => {
    try {
        const response = await api.get('/center-admin/reports');
        return response.data || [];
    } catch (error: unknown) {
        console.error('Error fetching reports:', error);
        throw error;
    }
};

export const closeVerification = async (centerId: string): Promise<CloseVerificationResult> => {
    try {
        const response = await api.patch('/center-admin/mark-pending-absent', undefined, {
            params: { centerId },
        });
        return response.data;
    } catch (error: unknown) {
        console.error('Error closing verification:', error);
        throw error;
    }
};

export const getDashboardStats = async (): Promise<CenterDashboardStats | null> => {
    try {
        const response = await api.get('/center-admin/dashboard-stats');
        return response.data || null;
    } catch (error: unknown) {
        console.error('Error fetching center dashboard stats:', error);
        throw error;
    }
};

export interface TrainingTimingsPayload {
    trainingStartTime: string;
    trainingEndTime: string;
}

export interface TrainingTimingsResponse {
    id: string;
    name: string;
    trainingStartTime: string;
    trainingEndTime: string;
}

export const updateTrainingTimings = async (
    centerId: string,
    timings: TrainingTimingsPayload
): Promise<TrainingTimingsResponse> => {
    try {
        const response = await api.patch(
            `/center-admin/centers/${centerId}/training-timings`,
            timings
        );
        return response.data;
    } catch (error: unknown) {
        console.error('Error updating training timings:', error);
        throw error;
    }
};

export const centerAdminService = {
    getTodayCandidates,
    updateCandidateStatus,
    getCenterDetails,
    getReports,
    closeVerification,
    getDashboardStats,
    updateTrainingTimings,
};

import { api } from './api';

export interface CandidateDocument {
    id: string;
    type: string;
    fileUrl: string | null;
    /** Mime type, e.g. "image/png" or "application/pdf" — the download route has no extension to sniff. */
    fileType?: string | null;
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
    /** Exam-start liveness check the candidate does themselves — separate
     * from candidateStatus (admin's check-in verification). */
    livenessVerified?: boolean;
    livenessAttempts?: number;
    livenessBlocked?: boolean;
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

/**
 * Fetches a specific candidate's document bytes for the center admin's
 * verification checklist/detail view. Goes through `api` (axios), not a
 * direct <img>/<iframe> src — same reason as the candidate-side equivalent:
 * the backend requires X-Requested-With on cookie-authenticated requests
 * (CSRF protection), which a browser resource-loading tag can never send.
 */
export const getCandidateDocumentBlob = async (candidateId: string, type: string): Promise<Blob> => {
    const response = await api.get(`/center-admin/candidates/${candidateId}/documents/${type}/download`, {
        responseType: 'blob',
    });
    return response.data;
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

export interface VerifyFaceResult {
    matched: boolean;
    confidence: number;
    autoVerified: boolean;
    /** Set when the photo is a high-confidence match for a DIFFERENT already-registered candidate. */
    conflict?: { candidateName: string; cnic: string | null } | null;
}

export const verifyFace = async (candidateId: string, photo: File): Promise<VerifyFaceResult> => {
    try {
        const formData = new FormData();
        formData.append('photo', photo);

        const response = await api.post(`/center-admin/candidates/${candidateId}/verify-face`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error: unknown) {
        console.error('Error verifying face:', error);
        throw error;
    }
};

export const overrideLiveness = async (candidateId: string, reason: string): Promise<{ livenessVerified: boolean }> => {
    try {
        const response = await api.post(`/center-admin/candidates/${candidateId}/override-liveness`, { reason });
        return response.data;
    } catch (error: unknown) {
        console.error('Error overriding liveness check:', error);
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
    getCandidateDocumentBlob,
    updateCandidateStatus,
    getCenterDetails,
    getReports,
    closeVerification,
    getDashboardStats,
    updateTrainingTimings,
    verifyFace,
    overrideLiveness,
};

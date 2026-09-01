import { api } from './api';
import { MinistryCenter, EligibleCandidate, RegistryCertificate, IssuanceLog, IssuedCertificate, BulkIssueCertificatesResponse, DegreeReviewCandidate } from '../types/ministry';

export interface DashboardStats {
    totalIssued?: number;
    totalIssuedPercentageChange?: number;
    pendingReview?: number;
    verifiedToday?: number;
}

export interface IssuanceTrendData {
    label: string;
    value: number;
}

export interface IssuanceTrendResponse {
    period: string;
    year: number;
    growthPercentage: number;
    data: IssuanceTrendData[];
}

export const getDashboardStats = async (): Promise<DashboardStats | null> => {
    try {
        const response = await api.get('/ministry/dashboard-stats');
        return response.data || null;
    } catch (error: unknown) {
        console.error('Error fetching ministry dashboard stats:', error);
        throw error;
    }
};

export const getIssuanceTrend = async (): Promise<IssuanceTrendResponse | null> => {
    try {
        const response = await api.get('/ministry/certificates/issuance-trend');
        return response.data || null;
    } catch (error: unknown) {
        console.error('Error fetching ministry issuance trend:', error);
        throw error;
    }
};

export const getCenters = async (): Promise<MinistryCenter[]> => {
    try {
        const response = await api.get('/ministry/centers');
        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching ministry centers:', error);
        throw error;
    }
};

export const getEligibleCandidates = async (centerId?: string): Promise<EligibleCandidate[]> => {
    try {
        const url = centerId
            ? `/ministry/certificates/eligible-candidates?centerId=${centerId}`
            : '/ministry/certificates/eligible-candidates';
        const response = await api.get(url);
        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching eligible candidates:', error);
        throw error;
    }
};

export const bulkIssueCertificates = async (candidateIds: string[]): Promise<BulkIssueCertificatesResponse> => {
    try {
        const response = await api.post('/ministry/certificates/bulk-issue', { candidateIds });
        return response.data;
    } catch (error: unknown) {
        console.error('Error bulk-issuing certificates:', error);
        throw error;
    }
};

export const issueCertificate = async (candidateId: string): Promise<IssuedCertificate> => {
    try {
        const response = await api.post('/ministry/certificates', { candidateId });
        return response.data;
    } catch (error: unknown) {
        console.error('Error issuing certificate:', error);
        throw error;
    }
};

export const getRegistry = async (): Promise<RegistryCertificate[]> => {
    try {
        const response = await api.get('/ministry/certificates/registry');
        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching certificate registry:', error);
        throw error;
    }
};

export const getIssuanceLogs = async (): Promise<IssuanceLog[]> => {
    try {
        const response = await api.get('/ministry/certificates/issuance-logs');
        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching issuance logs:', error);
        throw error;
    }
};

export const getDegreeReviewQueue = async (): Promise<DegreeReviewCandidate[]> => {
    try {
        const response = await api.get('/ministry/degree-reviews');
        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching degree review queue:', error);
        throw error;
    }
};

export const getDegreeDocumentBlob = async (candidateId: string): Promise<Blob> => {
    const response = await api.get(`/ministry/degree-reviews/${candidateId}/download`, {
        responseType: 'blob',
    });
    return response.data;
};

export const approveDegreeDocument = async (candidateId: string) => {
    try {
        const response = await api.post(`/ministry/degree-reviews/${candidateId}/approve`);
        return response.data;
    } catch (error: unknown) {
        console.error('Error approving degree document:', error);
        throw error;
    }
};

export const rejectDegreeDocument = async (candidateId: string, reason?: string) => {
    try {
        const response = await api.post(`/ministry/degree-reviews/${candidateId}/reject`, { reason });
        return response.data;
    } catch (error: unknown) {
        console.error('Error rejecting degree document:', error);
        throw error;
    }
};

export const ministryService = {
    getDashboardStats,
    getIssuanceTrend,
    getCenters,
    getEligibleCandidates,
    bulkIssueCertificates,
    issueCertificate,
    getRegistry,
    getIssuanceLogs,
    getDegreeReviewQueue,
    getDegreeDocumentBlob,
    approveDegreeDocument,
    rejectDegreeDocument,
};

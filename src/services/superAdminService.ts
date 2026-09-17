import { api } from './api';
import { getApiErrorMessage } from '../lib/errors';
import { ExamSettings, City, UpdateCityLocationRequest, Province, District, Tehsil, CreateCenterRequest, CenterAdmin, Question, CreateQuestionRequest, DashboardStats, AuditLogResponse, ExamParticipationTrend, CenterRegisteredCandidatesResponse, SuperAdminCenter, SuperAdminCenterDetails } from '../types/superAdmin';

export const updateExamSettings = async (settings: ExamSettings): Promise<void> => {
    try {
        await api.put('/super-admin/exam-settings', settings);
    } catch (error: unknown) {
        console.error('Update Exam Settings error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to update exam settings.'));
    }
};

export const getExamSettings = async (): Promise<ExamSettings> => {
    try {
        const response = await api.get('/super-admin/exam-settings');
        return response.data;
    } catch (error: unknown) {
        console.error('Get Exam Settings error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to fetch exam settings.'));
    }
};

export const getCities = async (): Promise<City[]> => {
    try {
        const response = await api.get('/super-admin/cities');
        return response.data;
    } catch (error: unknown) {
        console.error('Get Cities error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to fetch cities.'));
    }
};

export const getAllCities = async (): Promise<City[]> => {
    try {
        const response = await api.get('/super-admin/cities/all');
        return response.data;
    } catch (error: unknown) {
        console.error('Get All Cities error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to fetch cities.'));
    }
};

/**
 * Static reference data for the candidate's residential-address form —
 * Province > District. Unrelated to the city endpoints above, which are the
 * exam-centre list.
 */
export const getProvinces = async (): Promise<Province[]> => {
    try {
        const response = await api.get('/super-admin/provinces');
        return response.data;
    } catch (error: unknown) {
        console.error('Get Provinces error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to fetch provinces.'));
    }
};

/** Omit `provinceId` to fetch every district. */
export const getDistricts = async (provinceId?: string): Promise<District[]> => {
    try {
        const response = await api.get('/super-admin/districts', {
            params: provinceId ? { provinceId } : undefined,
        });
        return response.data;
    } catch (error: unknown) {
        console.error('Get Districts error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to fetch districts.'));
    }
};

/** Omit `districtId` to fetch every tehsil. */
export const getTehsils = async (districtId?: string): Promise<Tehsil[]> => {
    try {
        const response = await api.get('/super-admin/tehsils', {
            params: districtId ? { districtId } : undefined,
        });
        return response.data;
    } catch (error: unknown) {
        console.error('Get Tehsils error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to fetch tehsils.'));
    }
};

export const createCity = async (name: string): Promise<City> => {
    try {
        const response = await api.post('/super-admin/city', { name });
        return response.data;
    } catch (error: unknown) {
        console.error('Create City error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to create city.'));
    }
};

/** Sets a city's zone-matching coordinates/radius. Every field in `payload` is optional and independent — see UpdateCityLocationRequest. */
export const updateCityLocation = async (cityId: string, payload: UpdateCityLocationRequest): Promise<City> => {
    try {
        const response = await api.patch(`/super-admin/city/${cityId}/location`, payload);
        return response.data;
    } catch (error: unknown) {
        console.error('Update City Location error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to update city location.'));
    }
};

export const createCenter = async (centerData: CreateCenterRequest): Promise<SuperAdminCenter> => {
    try {
        const response = await api.post('/super-admin/center', centerData);
        return response.data;
    } catch (error: unknown) {
        console.error('Create Center error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to create center.'));
    }
};

export const getCenters = async (): Promise<SuperAdminCenter[]> => {
    try {
        const response = await api.get('/super-admin/centers');
        return response.data;
    } catch (error: unknown) {
        console.error('Get Centers error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to fetch centers.'));
    }
};

export const getCenterDetails = async (centerId: string): Promise<SuperAdminCenterDetails> => {
    try {
        const response = await api.get(`/super-admin/center/${centerId}/details`);
        return response.data;
    } catch (error: unknown) {
        console.error('Get Center Details error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to fetch center details.'));
    }
};

export const getCenterAdmins = async (): Promise<CenterAdmin[]> => {
    try {
        const response = await api.get('/super-admin/center-admins');
        return response.data;
    } catch (error: unknown) {
        console.error('Get Center Admins error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to fetch center admins.'));
    }
};

export const getQuestions = async (): Promise<Question[]> => {
    try {
        const response = await api.get('/super-admin/questions');
        return response.data;
    } catch (error: unknown) {
        console.error('Get Questions error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to fetch questions.'));
    }
};

export const createQuestion = async (request: CreateQuestionRequest): Promise<void> => {
    try {
        await api.post('/super-admin/question', request);
    } catch (error: unknown) {
        console.error('Create Question error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to create question.'));
    }
};

export const updateQuestion = async (id: string, request: CreateQuestionRequest): Promise<void> => {
    try {
        await api.put(`/super-admin/question/${id}`, request);
    } catch (error: unknown) {
        console.error('Update Question error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to update question.'));
    }
};

export const deleteQuestion = async (id: string): Promise<void> => {
    try {
        await api.delete(`/super-admin/question/${id}`);
    } catch (error: unknown) {
        console.error('Delete Question error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to delete question.'));
    }
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
        const response = await api.get('/super-admin/dashboard-stats');
        return response.data;
    } catch (error: unknown) {
        console.error('Get Dashboard Stats error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to fetch dashboard statistics.'));
    }
};

export const getAuditLogs = async (): Promise<AuditLogResponse> => {
    try {
        const response = await api.get('/super-admin/audit-logs');
        return response.data;
    } catch (error: unknown) {
        console.error('Get Audit Logs error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to fetch audit logs.'));
    }
};

export const getExamParticipationTrend = async (period: string = 'months'): Promise<ExamParticipationTrend> => {
    try {
        const response = await api.get('/super-admin/exam-participation-trend', {
            params: { period }
        });
        return response.data;
    } catch (error: unknown) {
        console.error('Get Training Participation Trend error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to fetch training participation trend.'));
    }
};

export const getCenterRegisteredCandidates = async (centerId: string, date: string): Promise<CenterRegisteredCandidatesResponse> => {
    try {
        const response = await api.get('/super-admin/center/registered-candidates', {
            params: { centerId, date }
        });
        return response.data;
    } catch (error: unknown) {
        console.error('Get Center Registered Candidates error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to fetch registered candidates.'));
    }
};

export interface CertificateSettings {
    dgName: string;
    hasSignature: boolean;
}

export const getCertificateSettings = async (): Promise<CertificateSettings> => {
    const response = await api.get('/super-admin/certificate-settings');
    return response.data;
};

export const updateCertificateDgName = async (dgName: string): Promise<CertificateSettings> => {
    const response = await api.put('/super-admin/certificate-settings/dg-name', { dgName });
    return response.data;
};

export const updateCertificateSignature = async (file: File): Promise<CertificateSettings> => {
    const formData = new FormData();
    formData.append('signature', file);
    const response = await api.post('/super-admin/certificate-settings/signature', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

/**
 * Fetches the current signature image bytes for an inline preview. Goes through `api`
 * (axios) rather than a raw <img src> — same CSRF-header reason as every other blob
 * fetch in this app: cookie-authenticated requests require X-Requested-With, which a
 * plain browser resource-loading tag can never send. Returns null if none is set yet.
 */
export const getCertificateSignatureBlob = async (): Promise<Blob | null> => {
    try {
        const response = await api.get('/super-admin/certificate-settings/signature', {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        if ((error as { response?: { status?: number } })?.response?.status === 404) return null;
        throw error;
    }
};

export const superAdminService = {
    updateExamSettings,
    getExamSettings,
    getCertificateSettings,
    updateCertificateDgName,
    updateCertificateSignature,
    getCertificateSignatureBlob,
    getCities,
    getAllCities,
    getProvinces,
    getDistricts,
    getTehsils,
    createCity,
    updateCityLocation,
    createCenter,
    getCenters,
    getCenterDetails,
    getCenterAdmins,
    getQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getDashboardStats,
    getAuditLogs,
    getExamParticipationTrend,
    getCenterRegisteredCandidates,
};

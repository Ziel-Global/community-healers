import { api } from './api';
import { getApiErrorMessage } from '../lib/errors';
import { ExamSettings, City, CreateCenterRequest, CenterAdmin, Question, CreateQuestionRequest, DashboardStats, AuditLogResponse, ExamParticipationTrend, CenterRegisteredCandidatesResponse, SuperAdminCenter, SuperAdminCenterDetails } from '../types/superAdmin';

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

export const createCity = async (name: string): Promise<City> => {
    try {
        const response = await api.post('/super-admin/city', { name });
        return response.data;
    } catch (error: unknown) {
        console.error('Create City error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to create city.'));
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

export const superAdminService = {
    updateExamSettings,
    getExamSettings,
    getCities,
    getAllCities,
    createCity,
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

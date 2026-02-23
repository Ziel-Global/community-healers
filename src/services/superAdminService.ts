import { api } from './api';
import { ExamSettings, City, CreateCenterRequest, CenterAdmin, Question, CreateQuestionRequest, DashboardStats, AuditLog, AuditLogResponse, ExamParticipationTrend, CenterRegisteredCandidatesResponse } from '../types/superAdmin';

export const updateExamSettings = async (settings: ExamSettings): Promise<void> => {
    try {
        await api.put('/super-admin/exam-settings', settings);
    } catch (error: any) {
        console.error('Update Exam Settings error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to update exam settings.');
    }
};

export const getExamSettings = async (): Promise<ExamSettings> => {
    try {
        const response = await api.get('/super-admin/exam-settings');
        // Handle deeply nested response: response.data (axios) -> data (wrapper) -> data (payload)
        const nestedData = response.data?.data?.data || response.data?.data || response.data;
        return nestedData;
    } catch (error: any) {
        console.error('Get Exam Settings error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to fetch exam settings.');
    }
};

export const getCities = async (): Promise<City[]> => {
    try {
        const response = await api.get('/super-admin/cities');
        // Handle deeply nested response: response.data.data.data
        const nestedData = response.data?.data?.data || response.data?.data || response.data;
        return nestedData;
    } catch (error: any) {
        console.error('Get Cities error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to fetch cities.');
    }
};

export const createCity = async (name: string): Promise<City> => {
    try {
        const response = await api.post('/super-admin/city', { name });
        // Handle nested response
        const nestedData = response.data?.data?.data || response.data?.data || response.data;
        return nestedData;
    } catch (error: any) {
        console.error('Create City error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to create city.');
    }
};

export const createCenter = async (centerData: CreateCenterRequest): Promise<any> => {
    try {
        const response = await api.post('/super-admin/center', centerData);
        // Handle nested response
        const nestedData = response.data?.data?.data || response.data?.data || response.data;
        return nestedData;
    } catch (error: any) {
        console.error('Create Center error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to create center.');
    }
};

export const getCenters = async (): Promise<any[]> => {
    try {
        const response = await api.get('/super-admin/centers');
        // Handle nested response
        const nestedData = response.data?.data?.data || response.data?.data || response.data;
        return nestedData;
    } catch (error: any) {
        console.error('Get Centers error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to fetch centers.');
    }
};

export const getCenterDetails = async (centerId: string): Promise<any> => {
    try {
        const response = await api.get(`/super-admin/center/${centerId}/details`);
        // Handle nested response
        const nestedData = response.data?.data?.data || response.data?.data || response.data;
        return nestedData;
    } catch (error: any) {
        console.error('Get Center Details error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to fetch center details.');
    }
};

export const getCenterAdmins = async (): Promise<CenterAdmin[]> => {
    try {
        const response = await api.get('/super-admin/center-admins');
        // Handle nested response
        const nestedData = response.data?.data?.data || response.data?.data || response.data;
        return nestedData;
    } catch (error: any) {
        console.error('Get Center Admins error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to fetch center admins.');
    }
};

export const getQuestions = async (): Promise<Question[]> => {
    try {
        const response = await api.get('/super-admin/questions');
        // Handle nested response
        const nestedData = response.data?.data?.data || response.data?.data || response.data;
        return nestedData;
    } catch (error: any) {
        console.error('Get Questions error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to fetch questions.');
    }
};

export const createQuestion = async (request: CreateQuestionRequest): Promise<void> => {
    try {
        await api.post('/super-admin/question', request);
    } catch (error: any) {
        console.error('Create Question error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to create question.');
    }
};

export const updateQuestion = async (id: string, request: CreateQuestionRequest): Promise<void> => {
    try {
        await api.put(`/super-admin/question/${id}`, request);
    } catch (error: any) {
        console.error('Update Question error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to update question.');
    }
};

export const deleteQuestion = async (id: string): Promise<void> => {
    try {
        await api.delete(`/super-admin/question/${id}`);
    } catch (error: any) {
        console.error('Delete Question error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to delete question.');
    }
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
        const response = await api.get('/super-admin/dashboard-stats');
        // Handle nested response
        const nestedData = response.data?.data?.data || response.data?.data || response.data;
        return nestedData;
    } catch (error: any) {
        console.error('Get Dashboard Stats error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to fetch dashboard statistics.');
    }
};

export const getAuditLogs = async (): Promise<AuditLogResponse> => {
    try {
        const response = await api.get('/super-admin/audit-logs');
        // Handle nested response: response.data.data.data
        const nestedData = response.data?.data?.data || response.data?.data || response.data;
        return nestedData;
    } catch (error: any) {
        console.error('Get Audit Logs error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to fetch audit logs.');
    }
};

export const getExamParticipationTrend = async (period: string = 'months'): Promise<ExamParticipationTrend> => {
    try {
        const response = await api.get('/super-admin/exam-participation-trend', {
            params: { period }
        });
        // Handle nested response
        const nestedData = response.data?.data?.data || response.data?.data || response.data;
        return nestedData;
    } catch (error: any) {
        console.error('Get Training Participation Trend error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to fetch training participation trend.');
    }
};

export const getCenterRegisteredCandidates = async (centerId: string, date: string): Promise<CenterRegisteredCandidatesResponse> => {
    try {
        const response = await api.get('/super-admin/center/registered-candidates', {
            params: { centerId, date }
        });
        // Handle nested response
        const nestedData = response.data?.data?.data || response.data?.data || response.data;
        return nestedData;
    } catch (error: any) {
        console.error('Get Center Registered Candidates error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to fetch registered candidates.');
    }
};

export const superAdminService = {
    updateExamSettings,
    getExamSettings,
    getCities,
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

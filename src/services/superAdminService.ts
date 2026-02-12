import { api } from './api';
import { ExamSettings, City, CreateCenterRequest, CenterAdmin, Question, CreateQuestionRequest } from '../types/superAdmin';

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

export const superAdminService = {
    updateExamSettings,
    getExamSettings,
    getCities,
    createCenter,
    getCenters,
    getCenterDetails,
    getCenterAdmins,
    getQuestions,
    createQuestion,
};

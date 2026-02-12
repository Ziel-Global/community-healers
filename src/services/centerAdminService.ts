import { api } from './api';

export interface Candidate {
    id: string;
    name: string;
    cnic: string;
    candidateStatus: string;
    [key: string]: any;
}

export const getTodayCandidates = async (examDate: string): Promise<Candidate[]> => {
    try {
        const response = await api.get('/center-admin/candidates', {
            params: {
                examDate,
            }
        });

        // Handle the specific nesting: response.data (axios) -> data (api wrapper) -> data (array)
        return response.data?.data?.data || [];
    } catch (error: any) {
        console.error('Error fetching candidates:', error);
        throw error;
    }
};

export const updateCandidateStatus = async (id: string, status: 'VERIFIED' | 'REJECTED'): Promise<any> => {
    try {
        const response = await api.patch(`/center-admin/exam-session/${id}/candidate-status`, {
            status
        });
        return response.data;
    } catch (error: any) {
        console.error('Error updating candidate status:', error);
        throw error;
    }
};

export const getCenterDetails = async (): Promise<any> => {
    try {
        const response = await api.get('/center-admin/center-details');
        // Handle nesting: response.data (axios) -> data (api) -> data (array)
        return response.data?.data?.data?.[0] || null;
    } catch (error: any) {
        console.error('Error fetching center details:', error);
        throw error;
    }
};

export const getReports = async (): Promise<any[]> => {
    try {
        const response = await api.get('/center-admin/reports');
        // Handle nesting: response.data (axios) -> data (api) -> data (array)
        return response.data?.data?.data || [];
    } catch (error: any) {
        console.error('Error fetching reports:', error);
        throw error;
    }
};

export const closeVerification = async (): Promise<any> => {
    try {
        const response = await api.patch('/center-admin/mark-pending-absent');
        return response.data;
    } catch (error: any) {
        console.error('Error closing verification:', error);
        throw error;
    }
};

export const getDashboardStats = async (): Promise<any> => {
    try {
        const response = await api.get('/center-admin/dashboard-stats');
        // Handle nesting: response.data (axios) -> data (api) -> data (actual stats object)
        return response.data?.data?.data || null;
    } catch (error: any) {
        console.error('Error fetching center dashboard stats:', error);
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
};

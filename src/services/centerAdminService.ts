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

export const centerAdminService = {
    getTodayCandidates,
    updateCandidateStatus,
    getCenterDetails,
};

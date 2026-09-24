import { api } from './api';

export interface TrainingInstructor {
    id: string;
    centerId: string;
    email: string;
    firstName: string;
    lastName?: string | null;
    createdAt: string;
}

export interface CreateTrainingInstructorPayload {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
}

export const listInstructors = async (centerId: string): Promise<TrainingInstructor[]> => {
    try {
        const response = await api.get(`/center-admin/centers/${centerId}/instructors`);
        return response.data || [];
    } catch (error: unknown) {
        console.error('Error fetching training instructors:', error);
        throw error;
    }
};

export const createInstructor = async (
    centerId: string,
    payload: CreateTrainingInstructorPayload
): Promise<TrainingInstructor> => {
    try {
        const response = await api.post(`/center-admin/centers/${centerId}/instructors`, payload);
        return response.data;
    } catch (error: unknown) {
        console.error('Error creating training instructor:', error);
        throw error;
    }
};

export const getInstructor = async (centerId: string, instructorId: string): Promise<TrainingInstructor> => {
    try {
        const response = await api.get(`/center-admin/centers/${centerId}/instructors/${instructorId}`);
        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching training instructor:', error);
        throw error;
    }
};

export const trainingInstructorsService = {
    listInstructors,
    createInstructor,
    getInstructor,
};

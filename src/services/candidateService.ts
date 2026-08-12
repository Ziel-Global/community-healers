import { AxiosResponse } from 'axios';
import { api } from './api';
import {
    CandidateMe,
    DocumentValidationResult,
    PaymentStatus,
    InitiatePaymentResponse,
    ExamQuestionsResponse,
    UploadDocumentResponse,
    ScheduleExamResponse,
    SaveAnswerResponse,
    SubmitExamResponse,
    ConfirmPaymentResponse,
} from '../types/candidate';
import { CandidateStatusResponse } from '../types/auth';

/**
 * Candidate-facing API calls, consolidated here so pages/components stop
 * calling the shared axios instance directly (and stop re-implementing the
 * same request — e.g. GET /candidates/me was previously duplicated across
 * 5 different files).
 */

export const getMe = async (): Promise<CandidateMe> => {
    try {
        const response = await api.get('/candidates/me');
        return response.data;
    } catch (error: unknown) {
        console.error('Get candidate profile error:', error);
        throw error;
    }
};

export const updateMe = async (payload: Record<string, unknown>): Promise<CandidateMe> => {
    try {
        const response = await api.put('/candidates/me', payload);
        return response.data;
    } catch (error: unknown) {
        console.error('Update candidate profile error:', error);
        throw error;
    }
};

export const validateDocuments = async (): Promise<DocumentValidationResult> => {
    try {
        const response = await api.get('/candidates/me/validate-documents');
        return response.data;
    } catch (error: unknown) {
        console.error('Validate documents error:', error);
        throw error;
    }
};

/** Builds the multipart form body internally — callers just pass the type + file. */
export const uploadDocument = async (type: string, file: File): Promise<UploadDocumentResponse> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const response = await api.post('/candidates/me/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error: unknown) {
        console.error('Upload document error:', error);
        throw error;
    }
};

export const scheduleExam = async (examDate: string): Promise<ScheduleExamResponse> => {
    try {
        const response = await api.post('/candidates/me/schedule', { examDate });
        return response.data;
    } catch (error: unknown) {
        console.error('Schedule exam error:', error);
        throw error;
    }
};

export const getExamStatus = async (): Promise<CandidateStatusResponse> => {
    try {
        const response = await api.get('/candidates/me/status');
        return response.data;
    } catch (error: unknown) {
        console.error('Get exam status error:', error);
        throw error;
    }
};

export const getExamQuestions = async (): Promise<ExamQuestionsResponse> => {
    try {
        const response = await api.get('/candidates/me/questions');
        return response.data;
    } catch (error: unknown) {
        console.error('Get exam questions error:', error);
        throw error;
    }
};

export const autosaveAnswer = (questionId: string, selectedOptionNumber: number): Promise<AxiosResponse<SaveAnswerResponse>> => {
    return api.patch('/candidates/me/exam/answer', { questionId, selectedOptionNumber });
};

export const submitExam = async (
    answers: Array<{ questionId: string; selectedOptionNumber: number }>,
): Promise<SubmitExamResponse> => {
    try {
        const response = await api.post('/candidates/me/exam/submit', { answers });
        return response.data;
    } catch (error: unknown) {
        console.error('Submit exam error:', error);
        throw error;
    }
};

export const getPaymentStatus = async (): Promise<PaymentStatus | null> => {
    try {
        const response = await api.get('/candidates/payments/status');
        return response.data;
    } catch (error: unknown) {
        console.error('Get payment status error:', error);
        throw error;
    }
};

export const initiatePayment = async (): Promise<InitiatePaymentResponse> => {
    try {
        const response = await api.post('/candidates/payments/initiate');
        return response.data;
    } catch (error: unknown) {
        console.error('Initiate payment error:', error);
        throw error;
    }
};

export const confirmPayment = async (transactionId: string, bankTransactionRef: string): Promise<ConfirmPaymentResponse> => {
    try {
        const response = await api.post(`/candidates/payments/confirm/${transactionId}`, { bankTransactionRef });
        return response.data;
    } catch (error: unknown) {
        console.error('Confirm payment error:', error);
        throw error;
    }
};

export const candidateService = {
    getMe,
    updateMe,
    validateDocuments,
    uploadDocument,
    scheduleExam,
    getExamStatus,
    getExamQuestions,
    autosaveAnswer,
    submitExam,
    getPaymentStatus,
    initiatePayment,
    confirmPayment,
};

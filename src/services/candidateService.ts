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
    EligibleCitiesResponse,
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

/**
 * Fetches the actual document bytes for preview/download. Deliberately goes
 * through `api` (axios) rather than using the download route directly as an
 * <img>/<iframe> src — the backend requires the X-Requested-With header on
 * cookie-authenticated requests (CSRF protection), which a plain browser
 * resource-loading tag can never send. This blob then gets wrapped in
 * `URL.createObjectURL()` by the caller.
 */
export const getDocumentBlob = async (type: string): Promise<Blob> => {
    const response = await api.get(`/candidates/me/documents/${type}/download`, {
        responseType: 'blob',
    });
    return response.data;
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

/**
 * `cityId` is required — the candidate's own city, or one picked from
 * `getEligibleCities`. The backend auto-assigns the best-available center
 * within that city; there is no way to pick a center directly.
 */
export const scheduleExam = async (examDate: string, cityId: string): Promise<ScheduleExamResponse> => {
    try {
        const response = await api.post('/candidates/me/schedule', { examDate, cityId });
        return response.data;
    } catch (error: unknown) {
        console.error('Schedule exam error:', error);
        throw error;
    }
};

/**
 * Cities available for a given date — within the candidate's zone (their
 * city's radius) when the city has coordinates set, widened further if
 * nothing in the normal zone has capacity, otherwise just their own exact
 * city. Read-only; does not book anything.
 */
export const getEligibleCities = async (examDate: string): Promise<EligibleCitiesResponse> => {
    try {
        const response = await api.get('/candidates/me/cities', { params: { date: examDate } });
        return response.data;
    } catch (error: unknown) {
        console.error('Get eligible cities error:', error);
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

export interface VerifyLivenessResult {
    livenessConfidence: number;
    livenessPass: boolean;
    matched: boolean;
    faceMatchConfidence: number;
    passed: boolean;
    /** Retries are unlimited — this is informational only, not a countdown. */
    attemptsMade: number;
    blocked: boolean;
}

export const createLivenessSession = async (): Promise<{ sessionId: string }> => {
    try {
        const response = await api.post('/candidates/me/liveness-session');
        return response.data;
    } catch (error: unknown) {
        console.error('Create liveness session error:', error);
        throw error;
    }
};

export const verifyLiveness = async (sessionId: string): Promise<VerifyLivenessResult> => {
    try {
        const response = await api.post('/candidates/me/verify-liveness', { sessionId });
        return response.data;
    } catch (error: unknown) {
        console.error('Verify liveness error:', error);
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

export interface CertificateView {
    id: string;
    certificateNumber: string;
    issuedDate: string;
    expiryDate: string | null;
    score: number;
    status: string;
    isExpired: boolean;
    downloadUrl: string | null;
    /** True when issued automatically on passing the exam — the normal path now; false only for the handful issued the old manual way. */
    autoIssued: boolean;
}

/** A candidate without a certificate yet gets `{hasCertificate: false}` and a 200 — not a 404. */
export const getMyCertificate = async (): Promise<CertificateView | null> => {
    const response = await api.get('/candidates/me/certificate');
    return response.data.certificate;
};

/** See getDocumentBlob's comment — same CSRF-header reason for going through `api` instead of a raw <iframe src>. */
export const getMyCertificatePdfBlob = async (): Promise<Blob> => {
    const response = await api.get('/candidates/me/certificate/pdf', {
        responseType: 'blob',
    });
    return response.data;
};

export const candidateService = {
    getMe,
    updateMe,
    validateDocuments,
    uploadDocument,
    getDocumentBlob,
    scheduleExam,
    getEligibleCities,
    getExamStatus,
    getExamQuestions,
    autosaveAnswer,
    submitExam,
    getPaymentStatus,
    initiatePayment,
    confirmPayment,
    createLivenessSession,
    verifyLiveness,
    getMyCertificate,
    getMyCertificatePdfBlob,
};

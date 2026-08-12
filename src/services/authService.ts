import axios from 'axios';
import { api } from './api';
import { getApiErrorMessage } from '../lib/errors';
import i18n from '../i18n';
import { CandidateLoginCredentials, CenterAdminLoginCredentials, MinistryLoginCredentials, SuperAdminLoginCredentials, SignupCredentials, AuthResponse, SignupOtpRequestResponse, CandidateVerificationCredentials, ExamScheduledResponse } from '../types/auth';

/**
 * Role-mismatch logins (valid credentials, wrong portal) come back as 403,
 * distinct from 401 for bad credentials — see auth.service.ts's
 * roleBasedLogin/loginCandidateByPhone. That status code alone lets us show
 * a translated message instead of the backend's raw English text.
 */
function loginErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
        return i18n.t('common.roleAccessDenied');
    }
    return getApiErrorMessage(error, fallback);
}

const loginCandidate = async (credentials: CandidateLoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await api.post('/auth/login/candidate', credentials);
        return response.data;
    } catch (error: unknown) {
        console.error('Candidate Login error:', error);
        throw new Error(loginErrorMessage(error, 'Candidate Login failed. Please check your credentials.'));
    }
};

const loginCenterAdmin = async (credentials: CenterAdminLoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await api.post('/auth/login/center-admin', credentials);
        return response.data;
    } catch (error: unknown) {
        console.error('Center Admin Login error:', error);
        throw new Error(loginErrorMessage(error, 'Center Admin Login failed. Please check your credentials.'));
    }
};

const loginMinistry = async (credentials: MinistryLoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await api.post('/auth/login/ministry', credentials);
        return response.data;
    } catch (error: unknown) {
        console.error('Ministry Login error:', error);
        throw new Error(loginErrorMessage(error, 'Ministry Login failed. Please check your credentials.'));
    }
};

const loginSuperAdmin = async (credentials: SuperAdminLoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await api.post('/auth/login/super-admin', credentials);
        return response.data;
    } catch (error: unknown) {
        console.error('Super Admin Login error:', error);
        throw new Error(loginErrorMessage(error, 'Super Admin Login failed. Please check your credentials.'));
    }
};

const signup = async (credentials: SignupCredentials): Promise<SignupOtpRequestResponse> => {
    try {
        const response = await api.post('/auth/signup/request', credentials);
        return response.data;
    } catch (error: unknown) {
        console.error('Signup error:', error);
        throw new Error(getApiErrorMessage(error, 'Signup failed. Please try again.'));
    }
};

const verifyCandidate = async (credentials: CandidateVerificationCredentials): Promise<AuthResponse> => {
    try {
        const response = await api.post('/auth/signup/verify', credentials);
        return response.data;
    } catch (error: unknown) {
        console.error('Candidate Verification error:', error);
        throw new Error(getApiErrorMessage(error, 'Verification failed. Please check your OTP.'));
    }
};

const logout = async (): Promise<void> => {
    try {
        await api.post('/auth/logout');
    } catch (error: unknown) {
        console.error('Logout error:', error);
        // Log the error but don't throw - we still want to clear local session
        // The endpoint automatically extracts session ID and user ID from JWT token
    }
};

/** Authoritative "am I still logged in" check — verifies the session cookie against the backend, not just decodes it. */
const getMe = async (): Promise<AuthResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
};

const checkExamScheduled = async (): Promise<ExamScheduledResponse> => {
    try {
        const response = await api.get('/candidates/me/exam-scheduled');
        return response.data;
    } catch (error: unknown) {
        console.error('Check exam scheduled error:', error);
        // Return default value if API fails
        return {
            examScheduled: false,
            message: 'Failed to check exam status'
        };
    }
};

export const authService = {
    loginCandidate,
    loginCenterAdmin,
    loginMinistry,
    loginSuperAdmin,
    signup,
    verifyCandidate,
    logout,
    getMe,
    checkExamScheduled,
};

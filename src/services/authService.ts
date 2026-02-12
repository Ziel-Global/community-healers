import { api } from './api';
import { CandidateLoginCredentials, CenterAdminLoginCredentials, MinistryLoginCredentials, SuperAdminLoginCredentials, SignupCredentials, AuthResponse, CandidateVerificationCredentials, ExamScheduledResponse } from '../types/auth';

const loginCandidate = async (credentials: CandidateLoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await api.post('/auth/login/candidate', credentials);
        return response.data;
    } catch (error: any) {
        console.error('Candidate Login error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Candidate Login failed. Please check your credentials.');
    }
};

const loginCenterAdmin = async (credentials: CenterAdminLoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await api.post('/auth/login/center-admin', credentials);
        return response.data;
    } catch (error: any) {
        console.error('Center Admin Login error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Center Admin Login failed. Please check your credentials.');
    }
};

const loginMinistry = async (credentials: MinistryLoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await api.post('/auth/login/ministry', credentials);
        return response.data;
    } catch (error: any) {
        console.error('Ministry Login error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Ministry Login failed. Please check your credentials.');
    }
};

const loginSuperAdmin = async (credentials: SuperAdminLoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await api.post('/auth/login/super-admin', credentials);
        return response.data;
    } catch (error: any) {
        console.error('Super Admin Login error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Super Admin Login failed. Please check your credentials.');
    }
};

const signup = async (credentials: SignupCredentials): Promise<AuthResponse> => {
    try {
        const response = await api.post('/auth/signup/request', credentials);
        return response.data;
    } catch (error: any) {
        console.error('Signup error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Signup failed. Please try again.');
    }
};

const verifyCandidate = async (credentials: CandidateVerificationCredentials): Promise<AuthResponse> => {
    try {
        const response = await api.post('/auth/signup/verify', credentials);
        return response.data;
    } catch (error: any) {
        console.error('Candidate Verification error:', error);
        if (error.response && error.response.data && error.response.data.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Verification failed. Please check your OTP.');
    }
};

const logout = async (): Promise<void> => {
    try {
        // Send logout request with authorization header and allow credentials (cookies)
        await api.post('/auth/logout', {}, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, // This allows cookies to be sent and received
        });
    } catch (error: any) {
        console.error('Logout error:', error);
        // Log the error but don't throw - we still want to clear local session
        // The endpoint automatically extracts session ID and user ID from JWT token
    }
};

const checkExamScheduled = async (): Promise<ExamScheduledResponse> => {
    try {
        const response = await api.get('/candidates/me/exam-scheduled');
        return response.data.data;
    } catch (error: any) {
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
    checkExamScheduled,
};

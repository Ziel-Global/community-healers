export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: 'student' | 'admin' | 'ministry' | 'center_admin';
}

export interface CandidateLoginCredentials {
    phoneNumber: string;
    password?: string;
}

export interface CandidateVerificationCredentials {
    phoneNumber: string;
    otp: string;
}

// Deprecated alias for backward cmpatibility if needed, but better to use specific types
export type LoginCredentials = CandidateLoginCredentials;

export interface CenterAdminLoginCredentials {
    email: string;
    password: string;
}

export interface MinistryLoginCredentials {
    email: string;
    password: string;
}

export interface SuperAdminLoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password?: string;
}

export interface AuthResponse {
    user: User;
    token?: string;
    accessToken?: string;
    access_token?: string;
    data?: any;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export enum CandidateStatus {
    VERIFIED = 'VERIFIED',
    PENDING = 'PENDING',
    ABSENT = 'ABSENT',
    REJECTED = 'REJECTED',
    SUBMITTED = 'SUBMITTED',
}

export interface CandidateStatusResponse {
    candidateStatus: CandidateStatus;
    examDate: string;
    examSessionId: string;
}

export interface ExamScheduledResponse {
    examScheduled: boolean;
    examDate?: string;
    examStartTime?: string;
    centerName?: string;
    centerAddress?: string;
    cityName?: string;
    durationMinutes?: number;
    numberOfQuestions?: number;
    message?: string;
    candidateStatus?: string;
}

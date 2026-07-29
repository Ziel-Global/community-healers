import { UserRole } from './roles';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: UserRole;
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
    examInProgress?: boolean;
    examEndTime?: string;
}

export interface ExamScheduledResponse {
    examScheduled: boolean;
    examDate?: string;
    examStartTime?: string;
    trainingEndTime?: string;
    arriveByTime?: string;
    verificationClosesAt?: string;
    verificationMessage?: string;
    verificationOpen?: boolean;
    wasAutoRescheduled?: boolean;
    requiresRepayment?: boolean;
    consecutiveMisses?: number;
    centerName?: string;
    centerAddress?: string;
    centerLicenseNumber?: string | null;
    cityName?: string;
    durationMinutes?: number;
    numberOfQuestions?: number;
    message?: string;
    candidateStatus?: string;
}

export interface CandidateProfileFlags {
    requiresRepayment?: boolean;
    consecutiveMisses?: number;
}

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

/**
 * Shape returned by authService's login/signup/verify/getMe functions once
 * the response interceptor (src/services/api.ts) has already unwrapped the
 * backend's envelope. The session token itself lives in an httpOnly cookie
 * now (never in this body) — this is just the non-sensitive profile.
 */
export interface AuthResponse {
    user: User;
}

/** `/auth/signup/request` only requests an OTP — no session exists yet. */
export interface SignupOtpRequestResponse {
    sent: boolean;
    otp?: string;
}

export interface AuthState {
    user: User | null;
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

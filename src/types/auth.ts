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

export interface CommitteeMemberLoginCredentials {
    email: string;
    password: string;
}

export interface CommitteeChairmanLoginCredentials {
    email: string;
    password: string;
}

export interface DirectorOperationsLoginCredentials {
    email: string;
    password: string;
}

export interface TrainingInstructorLoginCredentials {
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
    livenessVerified?: boolean;
    livenessBlocked?: boolean;
    /** Present when there's no exam session at all — distinguishes a degree-path candidate from one who just hasn't scheduled yet. */
    certificationPath?: 'EXAM' | 'DEGREE';
    degreeReviewStatus?: 'PENDING' | 'UPLOADED' | 'APPROVED' | 'REJECTED' | null;
    /** Checked in at the centre — null until verified. */
    verifiedAt?: string | null;
    /** When the 6-hour post-verification wait elapses — null until verified. */
    examUnlocksAt?: string | null;
    /** Whether the post-verification wait has elapsed. */
    examUnlocked?: boolean;
    /** Copy-driving constant, e.g. "opens 6 hours after check-in" — read it, don't hardcode. */
    examUnlockDelayHours?: number;
    /** Whether the centre has released this candidate's test — the other exam-start gate. */
    examReleased?: boolean;
    examReleasedAt?: string | null;
    /** True only when both gates (released + unlocked) are clear — drives the "Start test" button. */
    canStartExam?: boolean;
}

/** The two new exam-start gate error codes — carried as `error`, not the message string. */
export const EXAM_NOT_RELEASED_ERROR = "EXAM_NOT_RELEASED";
export const EXAM_LOCKED_ERROR = "EXAM_NOT_YET_UNLOCKED";

export interface ExamGateError {
    error: string;
    message: string;
    /** Only present on EXAM_NOT_YET_UNLOCKED. */
    unlocksAt?: string;
    statusCode: number;
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
    centerPhone?: string | null;
    cityName?: string;
    durationMinutes?: number;
    numberOfQuestions?: number;
    message?: string;
    candidateStatus?: string;
    verifiedAt?: string | null;
    examUnlocksAt?: string | null;
    examUnlocked?: boolean;
    examUnlockDelayHours?: number;
    examReleased?: boolean;
    examReleasedAt?: string | null;
    canStartExam?: boolean;
}

export interface CandidateProfileFlags {
    requiresRepayment?: boolean;
    consecutiveMisses?: number;
}

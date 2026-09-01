/**
 * Ministry-domain types, consolidated from the local interfaces already
 * declared per-file (MinistryIssuanceLogs, VerifiableRegistry,
 * PassedCandidateTable) before this migration.
 */

export interface MinistryCenter {
    id: string;
    name: string;
    cityId: string;
    city: {
        id: string;
        name: string;
    };
    address: string;
    capacity: number;
    status: string;
}

export interface MinistryCandidateDocument {
    id: string;
    candidateId: string;
    type: string;
    fileUrl: string;
    reviewStatus: string;
    createdAt: string;
    updatedAt: string;
}

export interface EligibleCandidate {
    userId: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        status: string;
        role: string;
    };
    cnic: string;
    fatherName: string;
    dob: string;
    cityId: string;
    city: {
        id: string;
        name: string;
    };
    address: string;
    has16YearsEducation: boolean;
    certificateIssued: boolean;
    createdAt: string;
    updatedAt: string;
    documents?: MinistryCandidateDocument[];
    obtainedScore: number | null;
    totalScore: number | null;
    scorePercentage: string | null;
    examTime: string | null;
    /** EXAM (passed a CBT) or DEGREE (Ministry-approved 14-year education transcript, no exam taken). */
    eligibilityBasis?: 'EXAM' | 'DEGREE';
}

export interface DegreeReviewCandidate {
    documentId: string;
    candidateId: string;
    submittedAt: string;
    candidate: {
        userId: string;
        cnic: string;
        fatherName: string;
        dob: string;
        address: string;
        user: {
            firstName: string;
            lastName: string;
            email: string;
            phoneNumber: string;
        };
        city: {
            id: string;
            name: string;
        } | null;
    };
}

export interface IssuanceCandidate {
    certificateNumber: string;
    candidateId: string;
    candidateName: string;
    cnic: string;
    city: string;
    email: string;
    score: number;
}

export interface IssuanceLog {
    id: string;
    issuedDate: string;
    issuedByUserId: string;
    issuedByName: string;
    notes: string;
    certificateNumber?: string;
    score?: number;
    candidateId?: string;
    candidateName?: string;
    cnic?: string;
    city?: string;
    email?: string;
    candidateCount?: number;
    candidates?: IssuanceCandidate[];
}

export interface RegistryCertificate {
    id: string;
    certificateNumber: string;
    issuedDate: string;
    status: string;
    score: string;
    candidateId: string;
    candidateName: string;
    cnic: string;
    city: string;
    email: string;
}

export interface IssuedCertificate {
    id: string;
    certificate_number: string;
    candidateId: string;
    issuedByUserId: string;
    issuedDate: string;
    expiryDate: string | null;
    score: number;
    status: string;
    downloadUrl: string | null;
}

export interface BulkIssuedCertificate {
    candidateId: string;
    certificateNumber: string;
    score: string;
    candidateName: string;
    email: string;
}

export interface BulkIssueFailure {
    candidateId: string;
    candidateName: string;
    reason: string;
}

export interface BulkIssueCertificatesResponse {
    totalEligible: number;
    successfullyIssued: number;
    failed: number;
    issuedCertificates: BulkIssuedCertificate[];
    failures: BulkIssueFailure[];
    message?: string;
}

/**
 * Candidate-domain types, authored from the shapes already used ad hoc across
 * ProfileView/RegistrationStep/ExamPortal/PaymentStep before this migration —
 * consolidated here so candidateService and the query hooks share one source
 * of truth instead of each caller re-declaring (or `any`-ing) the same shape.
 */

export interface CandidateDocument {
    id?: string;
    type: string;
    fileUrl?: string | null;
    reviewStatus?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CandidateCertificate {
    id: string;
    certificate_number: string;
    issuedDate: string;
    expiryDate: string | null;
    score: string;
    status: string;
    downloadUrl: string | null;
}

export interface CandidatePayment {
    isPaid: boolean;
    status: string;
    paidAt: string;
    transactionId: string;
}

export interface CandidateMe {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        role: string;
        status: string;
    };
    userId: string;
    cnic: string;
    fatherName: string;
    dob: string;
    city: {
        id: string;
        name: string;
    };
    address: string;
    has16YearsEducation: boolean;
    certificateIssued: boolean;
    createdAt: string;
    updatedAt: string;
    certificate?: CandidateCertificate | null;
    payment?: CandidatePayment;
    requiresRepayment?: boolean;
    consecutiveMisses?: number;
    documents?: CandidateDocument[];
}

export interface DocumentValidationResult {
    canProceedToPayment: boolean;
    missingDocuments?: string[];
}

export interface PaymentStatus {
    status: string;
    transactionId?: string;
}

export interface InitiatePaymentResponse {
    qrCodeBase64: string;
    transactionId: string;
}

export interface ExamQuestionOption {
    id: string;
    optionNumber: number;
    optionText: string;
}

export interface ExamQuestion {
    id: string;
    questionText: string;
    questionTextUrdu?: string;
    options: ExamQuestionOption[];
}

export interface ExamQuestionsResponse {
    questions: ExamQuestion[];
    timer?: {
        examEndTime?: string | null;
    };
    draftAnswers?: Record<string, number>;
}

export interface UploadDocumentResponse {
    type: string;
    url: string;
    status: string;
}

export interface ScheduleExamResponse {
    success: boolean;
    message: string;
    data: {
        examSessionId: string;
        centerId: string;
        centerName?: string;
        centerAddress?: string;
        cityName?: string;
        examStartTime: string;
        trainingEndTime: string;
        arriveByTime: string;
        verificationClosesAt: string;
        verificationMessage: string;
        date: string;
    };
}

export interface SaveAnswerResponse {
    success: boolean;
}

export interface SubmitExamResponse {
    examAttemptId: string;
    totalQuestions: number;
    correctAnswers: number;
    obtainedScore: number;
    totalScore: number;
    percentage: number;
    status: 'PASSED' | 'FAILED';
    submittedAt: string;
    isTimeExpired: boolean;
    autoSubmitted: boolean;
}

export interface ConfirmPaymentResponse {
    message: string;
}

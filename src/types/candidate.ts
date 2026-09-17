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
    /** Mime type, e.g. "image/png" or "application/pdf" — derived server-side from the stored file, used to pick <img> vs <iframe> for preview. */
    fileType?: string | null;
    reviewStatus?: string;
    /** Ministry's reason when reviewStatus is REJECTED. */
    reviewNote?: string | null;
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
    /** Exam-centre city — drives training-centre matching. Unrelated to the residential fields below. */
    city: {
        id: string;
        name: string;
    } | null;
    /** Residential address hierarchy: Province > District > Tehsil/City > Address. Independent of `city` above. */
    province: {
        id: string;
        name: string;
    } | null;
    district: {
        id: string;
        name: string;
        provinceId: string;
    } | null;
    tehsil: {
        id: string;
        name: string;
        districtId: string;
    } | null;
    address: string;
    has16YearsEducation: boolean;
    /** Which route to certification this candidate is on — EXAM (default) or DEGREE (skips payment/scheduling/exam). */
    certificationPath?: 'EXAM' | 'DEGREE';
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
    hasPayment?: boolean;
    status: string | null;
    amount?: number | null;
    paidAt?: string | null;
    qrCodeBase64?: string | null;
    expiresAt?: string | null;
    transactionId?: string | null;
    orderId?: string | null;
    canProceedToExam?: boolean;
}

export interface InitiatePaymentResponse {
    paymentId: string;
    qrCodeBase64: string;
    amount: number;
    expiresAt: string;
    transactionId: string;
    orderId: string;
    status: string;
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
    fileType?: string | null;
    status: string;
}

/** One row from GET /candidates/me/centers?date=... */
export interface EligibleCenter {
    centerId: string;
    name: string;
    cityId: string;
    cityName: string | null;
    address: string | null;
    /** Straight-line distance from the candidate's city, in km. Null when not zone-matched (falls back to exact-city — see `zoneMatched` on the parent response) but the center is still in the candidate's own city. */
    distanceKm: number | null;
    availableSlots: number;
}

export interface EligibleCentersResponse {
    /** False when the candidate's city has no coordinates yet — `centers` is then the same exact-city set scheduling itself would use. */
    zoneMatched: boolean;
    radiusKm: number | null;
    centers: EligibleCenter[];
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

export interface ExamSettings {
    durationMinutes: number;
    numberOfQuestions: number;
    passingPercentage: number;
    /** Whole-years part of certificate validity. 0 years + 0 months = never expires. */
    certificateValidityYears?: number;
    /** 0-11 month remainder on top of certificateValidityYears. */
    certificateValidityMonths?: number;
}

export interface City {
    id: string;
    name: string;
    /** Null until a super admin sets it via updateCityLocation — see UpdateCityLocationRequest. */
    latitude?: number | null;
    longitude?: number | null;
    /** Overrides ExamSettings.defaultZoneRadiusKm for this city only. Null = use the global default. */
    radiusKm?: number | null;
    districtId?: string | null;
}

/**
 * Payload for PATCH /super-admin/city/:id/location. Every field is optional
 * and independent — send only what changed. Powers zone-based centre
 * matching (docs/ZONE_BASED_CENTER_MATCHING.md in the backend repo): a city
 * with no latitude/longitude can't be zone-matched yet, and `radiusKm` left
 * unset falls back to the global default.
 */
export interface UpdateCityLocationRequest {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    districtId?: string;
}

/**
 * Static reference data for the candidate's residential-address form
 * (Province > District > Tehsil/City). Unrelated to `City` above, which is
 * the exam-centre list and drives training-centre matching.
 */
export interface Province {
    id: string;
    name: string;
}

export interface District {
    id: string;
    name: string;
    provinceId: string;
}

export interface Tehsil {
    id: string;
    name: string;
    districtId: string;
}

export interface CreateCenterRequest {
    name: string;
    cityId: string;
    licenseNumber: string;
    address: string;
    capacity: number;
    centerAdmin: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    };
}

export interface SuperAdminCenter {
    id: string;
    name: string;
    location: string;
    capacity: number;
    status: string;
    attendance: string;
    address?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    established?: string;
}

export interface SuperAdminCenterDetails {
    id: string;
    name: string;
    status: string;
    city?: {
        id: string;
        name: string;
    };
    address?: string;
    capacity: number;
    createdAt?: string;
    licenseNumber?: string | null;
    totalCandidates: number;
    appearedCandidates: number;
    primaryAdmin?: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

export interface CenterAdmin {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    centers: Array<{
        id: string;
        name: string;
        code: string;
    }>;
    createdAt: string;
}

export interface QuestionOption {
    id: string;
    optionNumber: number;
    optionText: string;
}

export interface Question {
    id: string;
    questionText: string;
    questionTextUrdu?: string;
    category: string;
    correctAnswer: number;
    options: QuestionOption[];
    option1Urdu?: string;
    option2Urdu?: string;
    option3Urdu?: string;
    option4Urdu?: string;
    createdAt: string;
    updatedAt: string;
}

export enum QuestionCategory {
    GENERAL = 'GENERAL',
    SAFETY = 'SAFETY',
    TECHNICAL = 'TECHNICAL',
    PROCEDURES = 'PROCEDURES',
    REGULATIONS = 'REGULATIONS',
}

export interface CreateQuestionRequest {
    questionText: string;
    questionTextUrdu?: string;
    category: QuestionCategory;
    option1: string;
    option1Urdu?: string;
    option2: string;
    option2Urdu?: string;
    option3: string;
    option3Urdu?: string;
    option4: string;
    option4Urdu?: string;
    correctAnswer: number;
}

export interface DashboardStats {
    activeCenters: number;
    totalQuestions: number;
    totalCandidates: number;
}

export interface TrendDataPoint {
    label: string;
    value: number;
}

export interface ExamParticipationTrend {
    period: string;
    year: number;
    growthPercentage: number;
    data: TrendDataPoint[];
}

export interface AuditLog {
    id: string;
    createdAt: string;
    userId: string;
    statusCode: number;
    message: string;
    path: string;
    method: string;
    apiVersion: string;
}

export interface AuditLogResponse {
    type: string;
    data: AuditLog[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface RegisteredCandidate {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    cnic: string;
    fatherName: string | null;
    city: string;
    address: string | null;
    candidateStatus: string;
    examStartTime: string;
    examDate: string;
}

export interface CenterRegisteredCandidatesResponse {
    centerInfo: {
        id: string;
        name: string;
        licenseNumber: string | null;
        location: string;
        address: string;
        dailyCapacity: number;
        established: string;
        primaryAdmin: {
            name: string;
            email: string;
        };
    };
    statistics: {
        totalRegistrations: number;
        totalAppeared: number;
        attendanceRate: number;
    };
    date: string;
    registeredCandidates: RegisteredCandidate[];
}

export interface ExamSettings {
    durationMinutes: number;
    numberOfQuestions: number;
}

export interface City {
    id: string;
    name: string;
}

export interface CreateCenterRequest {
    name: string;
    cityId: string;
    address: string;
    capacity: number;
    centerAdmin: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
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
    category: string;
    correctAnswer: number;
    options: QuestionOption[];
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
    category: QuestionCategory;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
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

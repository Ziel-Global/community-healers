import { api } from './api';
import type { ApplicationComment } from './centerApplicationCommentService';

/**
 * The applicant has no user account (none exists until Super Admin
 * approves), so these endpoints authenticate with a short-lived, per-application
 * Bearer token returned by verify-otp — not the cookie session every other
 * portal uses. It's attached manually per request rather than through a
 * global header since it only applies to these calls.
 */
function withSession(sessionToken: string) {
    return { headers: { Authorization: `Bearer ${sessionToken}` } };
}

export type ChecklistCategory = 'OPERATIONS_COMPLIANCE' | 'BUILDING_FACILITIES' | 'STAFF_TRAINERS';

export interface ChecklistItem {
    id: string;
    label: string;
    description: string | null;
    sortOrder: number;
    category: ChecklistCategory;
}

export interface StaffQualificationOption {
    value: string;
    label: string;
}

/** Canonical list from the API — used when the deployed backend lacks the route. */
export const DEFAULT_STAFF_QUALIFICATIONS: StaffQualificationOption[] = [
    { value: 'NONE', label: 'No formal education' },
    { value: 'PRIMARY', label: 'Primary (Grade 5)' },
    { value: 'MIDDLE', label: 'Middle (Grade 8)' },
    { value: 'MATRIC', label: 'Matriculation (Grade 10)' },
    { value: 'INTERMEDIATE', label: 'Intermediate / FA / FSc (Grade 12)' },
    { value: 'DIPLOMA', label: 'Diploma / DAE' },
    { value: 'BACHELORS', label: "Bachelor's degree" },
    { value: 'MASTERS', label: "Master's degree" },
    { value: 'MPHIL', label: 'MPhil' },
    { value: 'PHD', label: 'PhD' },
    { value: 'MBBS', label: 'MBBS' },
    { value: 'NURSING', label: 'Nursing qualification' },
    { value: 'OTHER', label: 'Other' },
];

export interface VerifyLicenseResult {
    applicationId: string;
    phone: string;
    status: string;
}

/** INSTRUCTOR/STAFF/MAINTENANCE are retired — kept only so old rows still type-check. */
export type StaffCategory =
    | 'INSTRUCTOR' | 'STAFF' | 'MAINTENANCE'
    | 'PRINCIPAL' | 'MODERATOR' | 'TRAINER' | 'PSYCHIATRIST'
    | 'ADMIN_SUPPORT' | 'ACCOUNTS' | 'IT_SUPPORT'
    | 'SECURITY_OFFICER' | 'SECURITY_GUARD'
    | 'KITCHEN_STAFF' | 'CLEANING_STAFF'
    | 'RECEPTIONIST' | 'MEDICAL_PRACTITIONER' | 'HELPLINE_DESK';
export type BuildingOwnership = 'RENTED' | 'OWNED';

export interface StaffMember {
    name: string;
    cnic: string;
    category: StaffCategory;
    qualification?: string;
}

export interface ApplicationStaffRow extends StaffMember {
    id: string;
    documentObjectKey?: string | null;
}

export interface CenterApplication {
    id: string;
    status: string;
    phone: string;
    /** Which of the 3 details sub-steps to resume at: 1 = Building, 2 = Staff, 3 = Center Info. */
    detailsStep: number;

    buildingArea: number | null;
    buildingCapacity: number | null;
    buildingOwnership: BuildingOwnership | null;
    receptionAvailable: boolean | null;
    requiredSystemsAvailable: boolean | null;
    camerasAvailable: boolean | null;
    camerasInfo: string | null;

    centerName: string | null;
    address: string | null;
    centerPhone: string | null;
    email: string | null;
    latitude: number | null;
    longitude: number | null;
    cityId: string | null;
    city?: string | null;

    isJointVenture: boolean;
    jointVentureLicenseNumber: string | null;

    scheduledInspectionDate: string | null;
    rejectionReason?: string | null;
    staff?: ApplicationStaffRow[];
}

export interface VerifyOtpResult {
    sessionToken: string;
    application: CenterApplication;
}

export interface BuildingDetailsPayload {
    buildingArea: number;
    buildingCapacity: number;
    buildingOwnership: BuildingOwnership;
    receptionAvailable: boolean;
    requiredSystemsAvailable: boolean;
    camerasAvailable: boolean;
    camerasInfo?: string;
}

export interface CenterInfoPayload {
    centerName: string;
    address: string;
    centerPhone: string;
    email: string;
    latitude: number;
    longitude: number;
    city: string;
    isJointVenture: boolean;
    jointVentureLicenseNumber?: string;
}

function asChecklistItems(data: unknown): ChecklistItem[] {
    return Array.isArray(data) ? data : [];
}

function asStaffQualificationOptions(data: unknown): StaffQualificationOption[] {
    return Array.isArray(data) ? data : [];
}

const getChecklist = async (): Promise<ChecklistItem[]> => {
    const response = await api.get('/center-onboarding/checklist');
    return asChecklistItems(response.data);
};

const getStaffQualifications = async (): Promise<StaffQualificationOption[]> => {
    try {
        const response = await api.get('/center-onboarding/staff-qualifications');
        const options = asStaffQualificationOptions(response.data);
        return options.length > 0 ? options : DEFAULT_STAFF_QUALIFICATIONS;
    } catch {
        // Prod backend (e.g. 2jdm) may not expose this route yet — keep the step usable.
        return DEFAULT_STAFF_QUALIFICATIONS;
    }
};

const reverseGeocode = async (
    lat: number,
    lng: number,
): Promise<{ formattedAddress: string | null; city: string | null }> => {
    const response = await api.get('/center-onboarding/geocode/reverse', { params: { lat, lng } });
    return response.data;
};

const verifyLicense = async (cnic: string, licenseNumber: string): Promise<VerifyLicenseResult> => {
    const response = await api.post('/center-onboarding/verify-license', { cnic, licenseNumber });
    return response.data;
};

const resendOtp = async (applicationId: string): Promise<{ phone: string }> => {
    const response = await api.post(`/center-onboarding/resend-otp/${applicationId}`);
    return response.data;
};

const verifyOtp = async (applicationId: string, otp: string): Promise<VerifyOtpResult> => {
    const response = await api.post('/center-onboarding/verify-otp', { applicationId, otp });
    return response.data;
};

const getApplication = async (applicationId: string, sessionToken: string): Promise<CenterApplication> => {
    const response = await api.get(
        `/center-onboarding/applications/${applicationId}`,
        withSession(sessionToken),
    );
    return response.data;
};

const submitBuildingDetails = async (
    applicationId: string,
    sessionToken: string,
    payload: BuildingDetailsPayload,
): Promise<CenterApplication> => {
    const response = await api.post(
        `/center-onboarding/applications/${applicationId}/building`,
        payload,
        withSession(sessionToken),
    );
    return response.data;
};

const submitStaff = async (
    applicationId: string,
    sessionToken: string,
    staff: StaffMember[],
): Promise<CenterApplication> => {
    const response = await api.post(
        `/center-onboarding/applications/${applicationId}/staff`,
        { staff },
        withSession(sessionToken),
    );
    return response.data;
};

const uploadStaffDocument = async (
    applicationId: string,
    sessionToken: string,
    staffId: string,
    file: File,
): Promise<ApplicationStaffRow> => {
    const formData = new FormData();
    formData.append('document', file);
    const response = await api.post(
        `/center-onboarding/applications/${applicationId}/staff/${staffId}/document`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
                'Content-Type': 'multipart/form-data',
            },
        },
    );
    return response.data;
};

/** So the applicant can see the committee's scheduled inspection date and comments. */
const getComments = async (applicationId: string, sessionToken: string): Promise<ApplicationComment[]> => {
    const response = await api.get(
        `/center-onboarding/applications/${applicationId}/comments`,
        withSession(sessionToken),
    );
    return response.data;
};

const submitCenterInfo = async (
    applicationId: string,
    sessionToken: string,
    payload: CenterInfoPayload,
): Promise<CenterApplication> => {
    const response = await api.post(
        `/center-onboarding/applications/${applicationId}/center-info`,
        payload,
        withSession(sessionToken),
    );
    return response.data;
};

export const centerOnboardingService = {
    getChecklist,
    getStaffQualifications,
    reverseGeocode,
    verifyLicense,
    resendOtp,
    verifyOtp,
    getApplication,
    submitBuildingDetails,
    submitStaff,
    uploadStaffDocument,
    submitCenterInfo,
    getComments,
};

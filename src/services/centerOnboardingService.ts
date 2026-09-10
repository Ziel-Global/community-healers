import { api } from './api';

/**
 * The applicant has no user account (none exists until Super Admin
 * approves), so these endpoints authenticate with a short-lived, per-application
 * Bearer token returned by verify-otp — not the cookie session every other
 * portal uses. It's attached manually per request rather than through a
 * global header since it only applies to these two calls.
 */
function withSession(sessionToken: string) {
    return { headers: { Authorization: `Bearer ${sessionToken}` } };
}

export interface ChecklistItem {
    id: string;
    label: string;
    description: string | null;
    sortOrder: number;
}

export interface City {
    id: string;
    name: string;
}

export interface VerifyLicenseResult {
    applicationId: string;
    phone: string;
    status: string;
}

export type StaffCategory = 'INSTRUCTOR' | 'STAFF' | 'MAINTENANCE';

export interface StaffMember {
    name: string;
    cnic: string;
    category: StaffCategory;
}

export interface ApplicationStaffRow extends StaffMember {
    id: string;
}

export interface CenterApplication {
    id: string;
    status: string;
    phone: string;
    centerName: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    cityId: string | null;
    staff?: ApplicationStaffRow[];
}

export interface VerifyOtpResult {
    sessionToken: string;
    application: CenterApplication;
}

export interface SubmitDetailsPayload {
    centerName: string;
    address: string;
    latitude: number;
    longitude: number;
    cityId: string;
    staff: StaffMember[];
}

const getChecklist = async (): Promise<ChecklistItem[]> => {
    const response = await api.get('/center-onboarding/checklist');
    return response.data;
};

const getCities = async (): Promise<City[]> => {
    const response = await api.get('/center-onboarding/cities');
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

const submitDetails = async (
    applicationId: string,
    sessionToken: string,
    payload: SubmitDetailsPayload,
): Promise<CenterApplication> => {
    const response = await api.post(
        `/center-onboarding/applications/${applicationId}/details`,
        payload,
        withSession(sessionToken),
    );
    return response.data;
};

export const centerOnboardingService = {
    getChecklist,
    getCities,
    verifyLicense,
    resendOtp,
    verifyOtp,
    getApplication,
    submitDetails,
};

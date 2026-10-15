import { api } from './api';
import type {
    CenterApplicationDetail,
    CenterApplicationSummary,
    ChecklistResultDetail,
} from './centerApplicationService';

const PREFIX = '/internal/committee-chairman/applications';

export type ReportRecommendation = 'APPROVE' | 'REJECT';

export interface InspectionReportMemberRow {
    memberUserId: string;
    memberName: string;
    /** 'COMMITTEE_CHAIRMAN' for the chairman's own row — they can attend and report too. */
    role?: string;
    attending: boolean | null;
    absenceReason: string | null;
    submitted: boolean;
    submittedAt: string | null;
    recommendation: ReportRecommendation | null;
    notes: string | null;
    checklistComplete: boolean;
    checklistCompletedCount: number;
    checklistTotalCount: number;
    /** Present when submitted — for drill-in read-only view. */
    checklistResults?: ChecklistResultDetail[];
}

export interface InspectionReportsSummary {
    attending: number;
    notAttending: number;
    submitted: number;
    recommendApprove: number;
    recommendReject: number;
}

export type RescheduleRequestResolution = 'RESCHEDULED' | 'ABSENCE_ACCEPTED';

/** One pending "something came up" flag — the chairman's alert list, global or scoped to one application. */
export interface RescheduleRequestAlert {
    id: string;
    applicationId: string;
    /** Only present on the global list (listRescheduleRequests); per-application rows already know their own center. */
    centerName?: string | null;
    requestedByUserId: string;
    requestedByName: string;
    requestedByRole?: string;
    reason: string;
    createdAt: string;
}

export interface InspectionReportsDashboard {
    members: InspectionReportMemberRow[];
    summary: InspectionReportsSummary;
    readyToDecide: boolean;
    outstandingMembers: string[];
    /** The inspection date has passed, nobody submitted a report, and nobody flagged why. */
    noShow: boolean;
    pendingRescheduleRequests: RescheduleRequestAlert[];
}

export interface ChairmanApproveResult {
    application: CenterApplicationSummary;
    center: { id: string; name: string; licenseNumber: string };
    centerAdmin: Record<string, unknown>;
}

const listApplications = async (): Promise<CenterApplicationSummary[]> => {
    const response = await api.get(PREFIX);
    return response.data;
};

const getApplicationDetail = async (applicationId: string): Promise<CenterApplicationDetail> => {
    const response = await api.get(`${PREFIX}/${applicationId}`);
    return response.data;
};

const forwardApplication = async (
    applicationId: string,
    scheduledInspectionDate: string,
): Promise<CenterApplicationSummary> => {
    const response = await api.post(`${PREFIX}/${applicationId}/forward`, {
        scheduledInspectionDate,
    });
    return response.data;
};

const returnApplication = async (applicationId: string, reason: string): Promise<CenterApplicationSummary> => {
    const response = await api.post(`${PREFIX}/${applicationId}/return`, { reason });
    return response.data;
};

function normalizeInspectionReportsDashboard(raw: Record<string, unknown>): InspectionReportsDashboard {
    const membersRaw = Array.isArray(raw.members) ? raw.members : [];
    const members: InspectionReportMemberRow[] = membersRaw.map((m) => {
        const row = m as Record<string, unknown>;
        return {
            memberUserId: String(row.memberUserId ?? row.userId ?? ''),
            memberName: String(row.memberName ?? row.name ?? 'Member'),
            role: row.role as string | undefined,
            attending: row.attending as boolean | null,
            absenceReason: (row.absenceReason ?? row.reason ?? null) as string | null,
            submitted: Boolean(row.submitted ?? row.hasSubmitted ?? row.submittedAt),
            submittedAt: (row.submittedAt as string | null) ?? null,
            recommendation: (row.recommendation as ReportRecommendation | null) ?? null,
            notes: (row.notes as string | null) ?? null,
            checklistComplete: Boolean(row.checklistComplete),
            checklistCompletedCount: Number(row.checklistCompletedCount ?? row.completedCount ?? 0),
            checklistTotalCount: Number(row.checklistTotalCount ?? row.totalCount ?? 0),
            checklistResults: row.checklistResults as ChecklistResultDetail[] | undefined,
        };
    });
    const summary = (raw.summary ?? {}) as Record<string, number>;
    return {
        members,
        summary: {
            attending: summary.attending ?? 0,
            notAttending:
                summary.notAttending
                ?? members.filter((m) => m.attending === false).length,
            submitted: summary.submitted ?? 0,
            recommendApprove: summary.recommendApprove ?? 0,
            recommendReject: summary.recommendReject ?? 0,
        },
        readyToDecide: Boolean(raw.readyToDecide),
        outstandingMembers: Array.isArray(raw.outstandingMembers)
            ? (raw.outstandingMembers as string[])
            : [],
        noShow: Boolean(raw.noShow),
        pendingRescheduleRequests: Array.isArray(raw.pendingRescheduleRequests)
            ? (raw.pendingRescheduleRequests as RescheduleRequestAlert[])
            : [],
    };
}

const getInspectionReports = async (applicationId: string): Promise<InspectionReportsDashboard> => {
    const response = await api.get(`${PREFIX}/${applicationId}/reports`);
    return normalizeInspectionReportsDashboard(response.data as Record<string, unknown>);
};

const approveApplication = async (applicationId: string): Promise<ChairmanApproveResult> => {
    const response = await api.post(`${PREFIX}/${applicationId}/approve`);
    return response.data;
};

const rejectApplication = async (applicationId: string, reason: string): Promise<CenterApplicationSummary> => {
    const response = await api.post(`${PREFIX}/${applicationId}/reject`, { reason });
    return response.data;
};

const getEvidenceBlob = async (evidenceId: string): Promise<Blob> => {
    const response = await api.get(`${PREFIX}/evidence/${evidenceId}/download`, { responseType: 'blob' });
    return response.data;
};

/** Every pending reschedule request across the chairman's committee — the alert list. */
const listRescheduleRequests = async (): Promise<RescheduleRequestAlert[]> => {
    const response = await api.get('/internal/committee-chairman/reschedule-requests');
    return response.data;
};

/** Reschedule the whole inspection, or accept just this person's absence. */
const resolveRescheduleRequest = async (
    requestId: string,
    payload: { resolution: RescheduleRequestResolution; scheduledInspectionDate?: string },
): Promise<void> => {
    await api.post(`/internal/committee-chairman/reschedule-requests/${requestId}/resolve`, payload);
};

export const committeeChairmanService = {
    listApplications,
    getApplicationDetail,
    forwardApplication,
    returnApplication,
    getInspectionReports,
    approveApplication,
    rejectApplication,
    getEvidenceBlob,
    listRescheduleRequests,
    resolveRescheduleRequest,
};

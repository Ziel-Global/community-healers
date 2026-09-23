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
    submitted: number;
    recommendApprove: number;
    recommendReject: number;
}

export interface InspectionReportsDashboard {
    members: InspectionReportMemberRow[];
    summary: InspectionReportsSummary;
    readyToDecide: boolean;
    outstandingMembers: string[];
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
            submitted: summary.submitted ?? 0,
            recommendApprove: summary.recommendApprove ?? 0,
            recommendReject: summary.recommendReject ?? 0,
        },
        readyToDecide: Boolean(raw.readyToDecide),
        outstandingMembers: Array.isArray(raw.outstandingMembers)
            ? (raw.outstandingMembers as string[])
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

export const committeeChairmanService = {
    listApplications,
    getApplicationDetail,
    forwardApplication,
    returnApplication,
    getInspectionReports,
    approveApplication,
    rejectApplication,
    getEvidenceBlob,
};

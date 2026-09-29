import { api } from './api';
import type {
    CenterApplicationDetail,
    CenterApplicationSummary,
    ChecklistCategory,
    ChecklistEvidenceItem,
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
    notAttending: number;
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

function firstChecklistArray(row: Record<string, unknown>): unknown[] {
    const nestedReport =
        row.report && typeof row.report === 'object' ? (row.report as Record<string, unknown>) : null;

    const candidates = [
        row.checklistResults,
        row.results,
        row.checklist,
        row.items,
        nestedReport?.checklistResults,
        nestedReport?.results,
        nestedReport?.checklist,
        nestedReport?.items,
    ];

    for (const candidate of candidates) {
        if (Array.isArray(candidate) && candidate.length > 0) {
            return candidate;
        }
    }
    return [];
}

function normalizeEvidence(raw: unknown): ChecklistEvidenceItem[] {
    if (!Array.isArray(raw)) return [];
    return raw
        .map((entry) => {
            if (!entry || typeof entry !== 'object') return null;
            const e = entry as Record<string, unknown>;
            const id = String(e.id ?? e.evidenceId ?? '');
            if (!id) return null;
            return {
                id,
                createdAt: String(e.createdAt ?? ''),
            };
        })
        .filter((e): e is ChecklistEvidenceItem => e !== null);
}

function toChecklistResultDetail(raw: unknown): ChecklistResultDetail | null {
    if (!raw || typeof raw !== 'object') return null;
    const item = raw as Record<string, unknown>;

    if (item.checklistItem && typeof item.checklistItem === 'object') {
        const nested = item.checklistItem as Record<string, unknown>;
        const checklistItemId = String(item.checklistItemId ?? nested.id ?? '');
        if (!checklistItemId) return null;
        return {
            id: String(item.id ?? checklistItemId),
            checklistItemId,
            passed: (item.passed as boolean | null) ?? null,
            notes: (item.notes as string | null) ?? null,
            checklistItem: {
                id: String(nested.id ?? checklistItemId),
                label: String(nested.label ?? 'Checklist item'),
                description: (nested.description as string | null) ?? null,
                category: (nested.category as ChecklistCategory) ?? 'OPERATIONS_COMPLIANCE',
                requiresPhoto: Boolean(nested.requiresPhoto),
            },
            evidence: normalizeEvidence(item.evidence),
        };
    }

    const checklistItemId = String(item.checklistItemId ?? item.id ?? '');
    if (!checklistItemId) return null;

    return {
        id: String(item.id ?? checklistItemId),
        checklistItemId,
        passed: (item.passed as boolean | null) ?? (typeof item.checked === 'boolean' ? item.checked : null),
        notes: (item.notes as string | null) ?? null,
        checklistItem: {
            id: checklistItemId,
            label: String(item.label ?? 'Checklist item'),
            description: (item.description as string | null) ?? null,
            category: (item.category as ChecklistCategory) ?? 'OPERATIONS_COMPLIANCE',
            requiresPhoto: Boolean(item.requiresPhoto),
        },
        evidence: normalizeEvidence(item.evidence),
    };
}

function extractMemberChecklistResults(row: Record<string, unknown>): ChecklistResultDetail[] | undefined {
    const mapped = firstChecklistArray(row)
        .map(toChecklistResultDetail)
        .filter((r): r is ChecklistResultDetail => r !== null);
    return mapped.length > 0 ? mapped : undefined;
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
            checklistResults: extractMemberChecklistResults(row),
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

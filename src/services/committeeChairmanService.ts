import { api } from './api';
import type { CenterApplicationDetail, CenterApplicationSummary } from './centerApplicationService';

const PREFIX = '/internal/committee-chairman/applications';

const listApplications = async (): Promise<CenterApplicationSummary[]> => {
    const response = await api.get(PREFIX);
    return response.data;
};

const getApplicationDetail = async (applicationId: string): Promise<CenterApplicationDetail> => {
    const response = await api.get(`${PREFIX}/${applicationId}`);
    return response.data;
};

const forwardApplication = async (applicationId: string): Promise<void> => {
    await api.post(`${PREFIX}/${applicationId}/forward`);
};

const returnApplication = async (applicationId: string, reason: string): Promise<void> => {
    await api.post(`${PREFIX}/${applicationId}/return`, { reason });
};

export const committeeChairmanService = {
    listApplications,
    getApplicationDetail,
    forwardApplication,
    returnApplication,
};

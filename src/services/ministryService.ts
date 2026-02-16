import { api } from './api';

export interface DashboardStats {
    totalIssued: number;
    totalIssuedPercentageChange: number;
    pendingReview: number;
    verifiedToday: number;
}

export interface IssuanceTrendData {
    label: string;
    value: number;
}

export interface IssuanceTrendResponse {
    period: string;
    year: number;
    growthPercentage: number;
    data: IssuanceTrendData[];
}

export const getDashboardStats = async (): Promise<DashboardStats | null> => {
    try {
        const response = await api.get('/ministry/dashboard-stats');
        // Handle nesting: response.data (axios) -> data (api) -> data (actual stats object)
        return response.data?.data?.data || null;
    } catch (error: any) {
        console.error('Error fetching ministry dashboard stats:', error);
        throw error;
    }
};

export const getIssuanceTrend = async (): Promise<IssuanceTrendResponse | null> => {
    try {
        const response = await api.get('/ministry/certificates/issuance-trend');
        // Handle nesting: response.data (axios) -> data (api) -> data (actual trend object)
        return response.data?.data?.data || null;
    } catch (error: any) {
        console.error('Error fetching ministry issuance trend:', error);
        throw error;
    }
};

export const ministryService = {
    getDashboardStats,
    getIssuanceTrend,
};

import { api } from './api';

export interface DashboardStats {
    totalIssued: number;
    totalIssuedPercentageChange: number;
    pendingReview: number;
    verifiedToday: number;
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

export const ministryService = {
    getDashboardStats,
};

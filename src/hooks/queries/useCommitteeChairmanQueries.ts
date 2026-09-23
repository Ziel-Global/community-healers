import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { committeeChairmanService } from '@/services/committeeChairmanService';

export const committeeChairmanKeys = {
    all: ['committeeChairman'] as const,
    applications: () => [...committeeChairmanKeys.all, 'applications'] as const,
    applicationDetail: (id: string) => [...committeeChairmanKeys.all, 'applicationDetail', id] as const,
};

export function useChairmanApplications() {
    return useQuery({
        queryKey: committeeChairmanKeys.applications(),
        queryFn: committeeChairmanService.listApplications,
    });
}

export function useChairmanApplicationDetail(applicationId: string) {
    return useQuery({
        queryKey: committeeChairmanKeys.applicationDetail(applicationId),
        queryFn: () => committeeChairmanService.getApplicationDetail(applicationId),
        enabled: !!applicationId,
    });
}

export function useForwardChairmanApplication(applicationId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => committeeChairmanService.forwardApplication(applicationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: committeeChairmanKeys.applications() });
            queryClient.invalidateQueries({ queryKey: committeeChairmanKeys.applicationDetail(applicationId) });
        },
    });
}

export function useReturnChairmanApplication(applicationId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (reason: string) => committeeChairmanService.returnApplication(applicationId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: committeeChairmanKeys.applications() });
            queryClient.invalidateQueries({ queryKey: committeeChairmanKeys.applicationDetail(applicationId) });
        },
    });
}

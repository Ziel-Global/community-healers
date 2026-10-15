import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { committeeChairmanService, type RescheduleRequestResolution } from '@/services/committeeChairmanService';

export const committeeChairmanKeys = {
    all: ['committeeChairman'] as const,
    applications: () => [...committeeChairmanKeys.all, 'applications'] as const,
    applicationDetail: (id: string) => [...committeeChairmanKeys.all, 'applicationDetail', id] as const,
    inspectionReports: (id: string) => [...committeeChairmanKeys.all, 'inspectionReports', id] as const,
    rescheduleRequests: () => [...committeeChairmanKeys.all, 'rescheduleRequests'] as const,
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
        mutationFn: (scheduledInspectionDate: string) =>
            committeeChairmanService.forwardApplication(applicationId, scheduledInspectionDate),
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

export function useInspectionReports(applicationId: string) {
    return useQuery({
        queryKey: committeeChairmanKeys.inspectionReports(applicationId),
        queryFn: () => committeeChairmanService.getInspectionReports(applicationId),
        enabled: !!applicationId,
    });
}

export function useChairmanApprove(applicationId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => committeeChairmanService.approveApplication(applicationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: committeeChairmanKeys.all });
        },
    });
}

export function useChairmanReject(applicationId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (reason: string) => committeeChairmanService.rejectApplication(applicationId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: committeeChairmanKeys.all });
        },
    });
}

/** The alert list — every pending "something came up" request across the whole committee. */
export function useRescheduleRequests() {
    return useQuery({
        queryKey: committeeChairmanKeys.rescheduleRequests(),
        queryFn: committeeChairmanService.listRescheduleRequests,
    });
}

export function useResolveRescheduleRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            requestId,
            resolution,
            scheduledInspectionDate,
        }: {
            requestId: string;
            resolution: RescheduleRequestResolution;
            scheduledInspectionDate?: string;
        }) => committeeChairmanService.resolveRescheduleRequest(requestId, { resolution, scheduledInspectionDate }),
        onSuccess: () => {
            // Resolving can touch attendance, the application's date, and every
            // pending request on it — invalidate broadly rather than tracking
            // which specific application/query keys were affected.
            queryClient.invalidateQueries({ queryKey: committeeChairmanKeys.all });
        },
    });
}

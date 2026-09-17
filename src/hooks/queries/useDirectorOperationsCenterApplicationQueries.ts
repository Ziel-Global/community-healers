import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { directorOperationsCenterApplicationService } from "@/services/centerApplicationService";

export const doCenterApplicationKeys = {
    all: ["doCenterApplications"] as const,
    list: () => [...doCenterApplicationKeys.all, "list"] as const,
    detail: (id: string) => [...doCenterApplicationKeys.all, "detail", id] as const,
};

export function useCenterApplications() {
    return useQuery({
        queryKey: doCenterApplicationKeys.list(),
        queryFn: directorOperationsCenterApplicationService.listApplications,
    });
}

export function useCenterApplicationDetail(applicationId: string) {
    return useQuery({
        queryKey: doCenterApplicationKeys.detail(applicationId),
        queryFn: () => directorOperationsCenterApplicationService.getApplicationDetail(applicationId),
        enabled: !!applicationId,
    });
}

function useInvalidateApplication(applicationId: string) {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: doCenterApplicationKeys.list() });
        queryClient.invalidateQueries({ queryKey: doCenterApplicationKeys.detail(applicationId) });
    };
}

export function useAssignCommittee(applicationId: string) {
    const invalidate = useInvalidateApplication(applicationId);
    return useMutation({
        mutationFn: (committeeId: string) => directorOperationsCenterApplicationService.assignCommittee(applicationId, committeeId),
        onSuccess: invalidate,
    });
}

export function useApproveApplication(applicationId: string) {
    const invalidate = useInvalidateApplication(applicationId);
    return useMutation({
        mutationFn: () => directorOperationsCenterApplicationService.approveApplication(applicationId),
        onSuccess: invalidate,
    });
}

export function useRejectApplication(applicationId: string) {
    const invalidate = useInvalidateApplication(applicationId);
    return useMutation({
        mutationFn: (reason: string) => directorOperationsCenterApplicationService.rejectApplication(applicationId, reason),
        onSuccess: invalidate,
    });
}

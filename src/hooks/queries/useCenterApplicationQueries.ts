import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { centerApplicationService, CreateInspectorRequest } from "@/services/centerApplicationService";

export const centerApplicationKeys = {
    all: ["centerApplications"] as const,
    list: () => [...centerApplicationKeys.all, "list"] as const,
    detail: (id: string) => [...centerApplicationKeys.all, "detail", id] as const,
    inspectors: () => [...centerApplicationKeys.all, "inspectors"] as const,
};

export function useCenterApplications() {
    return useQuery({
        queryKey: centerApplicationKeys.list(),
        queryFn: centerApplicationService.listApplications,
    });
}

export function useCenterApplicationDetail(applicationId: string) {
    return useQuery({
        queryKey: centerApplicationKeys.detail(applicationId),
        queryFn: () => centerApplicationService.getApplicationDetail(applicationId),
        enabled: !!applicationId,
    });
}

export function useInspectors() {
    return useQuery({
        queryKey: centerApplicationKeys.inspectors(),
        queryFn: centerApplicationService.listInspectors,
    });
}

function useInvalidateApplication(applicationId: string) {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: centerApplicationKeys.list() });
        queryClient.invalidateQueries({ queryKey: centerApplicationKeys.detail(applicationId) });
    };
}

export function useAssignInspector(applicationId: string) {
    const invalidate = useInvalidateApplication(applicationId);
    return useMutation({
        mutationFn: (inspectorId: string) => centerApplicationService.assignInspector(applicationId, inspectorId),
        onSuccess: invalidate,
    });
}

export function useApproveApplication(applicationId: string) {
    const invalidate = useInvalidateApplication(applicationId);
    return useMutation({
        mutationFn: () => centerApplicationService.approveApplication(applicationId),
        onSuccess: invalidate,
    });
}

export function useRejectApplication(applicationId: string) {
    const invalidate = useInvalidateApplication(applicationId);
    return useMutation({
        mutationFn: (reason: string) => centerApplicationService.rejectApplication(applicationId, reason),
        onSuccess: invalidate,
    });
}

export function useCreateInspector() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: CreateInspectorRequest) => centerApplicationService.createInspector(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: centerApplicationKeys.inspectors() });
        },
    });
}

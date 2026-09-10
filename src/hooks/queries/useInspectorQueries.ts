import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inspectorService } from "@/services/inspectorService";

export const inspectorKeys = {
    all: ["inspector"] as const,
    applications: () => [...inspectorKeys.all, "applications"] as const,
    applicationDetail: (id: string) => [...inspectorKeys.all, "applicationDetail", id] as const,
};

export function useAssignedApplications() {
    return useQuery({
        queryKey: inspectorKeys.applications(),
        queryFn: inspectorService.getAssignedApplications,
    });
}

export function useInspectorApplicationDetail(applicationId: string) {
    return useQuery({
        queryKey: inspectorKeys.applicationDetail(applicationId),
        queryFn: () => inspectorService.getApplicationDetail(applicationId),
        enabled: !!applicationId,
    });
}

export function useUploadEvidence(applicationId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ checklistItemId, photo }: { checklistItemId: string; photo: File }) =>
            inspectorService.uploadEvidence(applicationId, checklistItemId, photo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inspectorKeys.applicationDetail(applicationId) });
        },
    });
}

export function useSetChecklistResult(applicationId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ checklistItemId, passed, notes }: { checklistItemId: string; passed: boolean; notes?: string }) =>
            inspectorService.setChecklistResult(applicationId, checklistItemId, passed, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inspectorKeys.applicationDetail(applicationId) });
        },
    });
}

export function useSubmitInspection(applicationId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => inspectorService.submitInspection(applicationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inspectorKeys.applicationDetail(applicationId) });
            queryClient.invalidateQueries({ queryKey: inspectorKeys.applications() });
        },
    });
}

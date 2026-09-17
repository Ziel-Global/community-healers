import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { committeeMemberService } from "@/services/committeeMemberService";

export const committeeMemberKeys = {
    all: ["committeeMember"] as const,
    applications: () => [...committeeMemberKeys.all, "applications"] as const,
    applicationDetail: (id: string) => [...committeeMemberKeys.all, "applicationDetail", id] as const,
};

export function useAssignedApplications() {
    return useQuery({
        queryKey: committeeMemberKeys.applications(),
        queryFn: committeeMemberService.getAssignedApplications,
    });
}

export function useCommitteeApplicationDetail(applicationId: string) {
    return useQuery({
        queryKey: committeeMemberKeys.applicationDetail(applicationId),
        queryFn: () => committeeMemberService.getApplicationDetail(applicationId),
        enabled: !!applicationId,
    });
}

export function useUploadEvidence(applicationId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ checklistItemId, photo }: { checklistItemId: string; photo: File }) =>
            committeeMemberService.uploadEvidence(applicationId, checklistItemId, photo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: committeeMemberKeys.applicationDetail(applicationId) });
        },
    });
}

export function useSetChecklistChecked(applicationId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ checklistItemId, checked }: { checklistItemId: string; checked: boolean }) =>
            committeeMemberService.setChecklistChecked(applicationId, checklistItemId, checked),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: committeeMemberKeys.applicationDetail(applicationId) });
        },
    });
}

export function useSetAttendance(applicationId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ attending, reason }: { attending: boolean; reason?: string }) =>
            committeeMemberService.setAttendance(applicationId, attending, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: committeeMemberKeys.applicationDetail(applicationId) });
        },
    });
}

export function useApproveInspection(applicationId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => committeeMemberService.approveInspection(applicationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: committeeMemberKeys.applicationDetail(applicationId) });
            queryClient.invalidateQueries({ queryKey: committeeMemberKeys.applications() });
        },
    });
}

export function useRejectInspection(applicationId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (reason: string) => committeeMemberService.rejectInspection(applicationId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: committeeMemberKeys.applicationDetail(applicationId) });
            queryClient.invalidateQueries({ queryKey: committeeMemberKeys.applications() });
        },
    });
}

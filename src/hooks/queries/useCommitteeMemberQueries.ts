import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    committeeMemberService,
    type CommitteeApplicationDetail,
    type SubmitReportPayload,
} from "@/services/committeeMemberService";

export const committeeMemberKeys = {
    all: ["committeeMember"] as const,
    applications: () => [...committeeMemberKeys.all, "applications"] as const,
    applicationDetail: (id: string) => [...committeeMemberKeys.all, "applicationDetail", id] as const,
    myReport: (id: string) => [...committeeMemberKeys.all, "myReport", id] as const,
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

export function useMyInspectionReport(applicationId: string) {
    return useQuery({
        queryKey: committeeMemberKeys.myReport(applicationId),
        queryFn: () => committeeMemberService.getMyReport(applicationId),
        enabled: !!applicationId,
    });
}

export function useSubmitInspectionReport(applicationId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: SubmitReportPayload) => committeeMemberService.submitReport(applicationId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: committeeMemberKeys.applicationDetail(applicationId) });
            queryClient.invalidateQueries({ queryKey: committeeMemberKeys.myReport(applicationId) });
            queryClient.invalidateQueries({ queryKey: committeeMemberKeys.applications() });
        },
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
    const detailKey = committeeMemberKeys.applicationDetail(applicationId);

    return useMutation({
        mutationFn: ({ checklistItemId, checked }: { checklistItemId: string; checked: boolean }) =>
            committeeMemberService.setChecklistChecked(applicationId, checklistItemId, checked),
        onMutate: async ({ checklistItemId, checked }) => {
            await queryClient.cancelQueries({ queryKey: detailKey });
            const previous = queryClient.getQueryData<CommitteeApplicationDetail>(detailKey);
            if (previous) {
                queryClient.setQueryData<CommitteeApplicationDetail>(detailKey, {
                    ...previous,
                    checklist: previous.checklist.map((item) =>
                        item.checklistItemId === checklistItemId ? { ...item, checked } : item,
                    ),
                });
            }
            return { previous };
        },
        onError: (_error, _variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(detailKey, context.previous);
            }
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

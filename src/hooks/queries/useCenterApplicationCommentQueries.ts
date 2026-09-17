import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { centerApplicationCommentService } from "@/services/centerApplicationCommentService";
import { committeeMemberKeys } from "./useCommitteeMemberQueries";

export const applicationCommentKeys = {
    all: ["applicationComments"] as const,
    list: (applicationId: string) => [...applicationCommentKeys.all, applicationId] as const,
};

export function useApplicationComments(applicationId: string) {
    return useQuery({
        queryKey: applicationCommentKeys.list(applicationId),
        queryFn: () => centerApplicationCommentService.listComments(applicationId),
        enabled: !!applicationId,
    });
}

export function useAddApplicationComment(applicationId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ text, scheduledInspectionDate }: { text: string; scheduledInspectionDate?: string }) =>
            centerApplicationCommentService.addComment(applicationId, text, scheduledInspectionDate),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: applicationCommentKeys.list(applicationId) });
            // A comment may also update the shared scheduledInspectionDate field.
            queryClient.invalidateQueries({ queryKey: committeeMemberKeys.applicationDetail(applicationId) });
            queryClient.invalidateQueries({ queryKey: committeeMemberKeys.applications() });
        },
    });
}

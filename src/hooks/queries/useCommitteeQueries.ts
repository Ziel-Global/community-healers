import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { committeeService, CreateCommitteeMemberRequest } from "@/services/committeeService";

export const committeeKeys = {
    all: ["committee"] as const,
    doView: () => [...committeeKeys.all, "director-operations"] as const,
    adminView: () => [...committeeKeys.all, "super-admin"] as const,
};

/** Director of Operations — read-only, just enough to get the committee's id for assignment. */
export function useCommitteeForDirectorOperations() {
    return useQuery({
        queryKey: committeeKeys.doView(),
        queryFn: committeeService.getCommitteeForDirectorOperations,
    });
}

/** Super Admin — owns membership. */
export function useCommitteeForSuperAdmin() {
    return useQuery({
        queryKey: committeeKeys.adminView(),
        queryFn: committeeService.getCommitteeForSuperAdmin,
    });
}

export function useAddCommitteeMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: CreateCommitteeMemberRequest) => committeeService.addCommitteeMember(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: committeeKeys.adminView() });
        },
    });
}

export function useAddCommitteeChairman() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: CreateCommitteeMemberRequest) => committeeService.addCommitteeChairman(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: committeeKeys.adminView() });
        },
    });
}

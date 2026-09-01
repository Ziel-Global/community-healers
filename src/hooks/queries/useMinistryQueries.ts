import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ministryService } from "@/services/ministryService";

export const ministryKeys = {
    all: ["ministry"] as const,
    issuanceLogs: () => [...ministryKeys.all, "issuanceLogs"] as const,
    stats: () => [...ministryKeys.all, "stats"] as const,
    registry: () => [...ministryKeys.all, "registry"] as const,
    centers: () => [...ministryKeys.all, "centers"] as const,
    /** Called with no arg (base key) to invalidate every center filter at once. */
    eligibleCandidates: (centerId?: string) =>
        centerId
            ? ([...ministryKeys.all, "eligibleCandidates", centerId] as const)
            : ([...ministryKeys.all, "eligibleCandidates"] as const),
    issuanceTrend: (timeFilter?: string) => [...ministryKeys.all, "issuanceTrend", timeFilter] as const,
    degreeReviews: () => [...ministryKeys.all, "degreeReviews"] as const,
};

export function useIssuanceLogs() {
    return useQuery({
        queryKey: ministryKeys.issuanceLogs(),
        queryFn: ministryService.getIssuanceLogs,
    });
}

export function useMinistryStats() {
    return useQuery({
        queryKey: ministryKeys.stats(),
        queryFn: ministryService.getDashboardStats,
    });
}

export function useRegistry() {
    return useQuery({
        queryKey: ministryKeys.registry(),
        queryFn: ministryService.getRegistry,
    });
}

export function useMinistryCenters() {
    return useQuery({
        queryKey: ministryKeys.centers(),
        queryFn: ministryService.getCenters,
    });
}

export function useEligibleCandidates(centerId: string) {
    return useQuery({
        queryKey: ministryKeys.eligibleCandidates(centerId || undefined),
        queryFn: () => ministryService.getEligibleCandidates(centerId || undefined),
    });
}

/**
 * `timeFilter` is kept in the key for correct intent even though
 * `ministryService.getIssuanceTrend()` currently ignores it (unlike its
 * super-admin `getExamParticipationTrend(period)` counterpart) — a
 * pre-existing gap in the backend/service contract, not something this
 * migration silently papers over.
 */
export function useIssuanceTrend(timeFilter: string) {
    return useQuery({
        queryKey: ministryKeys.issuanceTrend(timeFilter),
        queryFn: ministryService.getIssuanceTrend,
    });
}

export function useBulkIssueCertificates() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (candidateIds: string[]) => ministryService.bulkIssueCertificates(candidateIds),
        onSuccess: () => {
            // Issuing certificates moves the needle on every ministry view at
            // once (Authority Hub stats/trend, registry, logs, eligible
            // list) — invalidate the whole "ministry" key group rather than
            // just eligibleCandidates, which previously left the dashboard
            // stale until a hard refresh re-fetched everything.
            queryClient.invalidateQueries({ queryKey: ministryKeys.all });
        },
    });
}

export function useIssueCertificate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (candidateId: string) => ministryService.issueCertificate(candidateId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ministryKeys.all });
        },
    });
}

export function useDegreeReviewQueue() {
    return useQuery({
        queryKey: ministryKeys.degreeReviews(),
        queryFn: ministryService.getDegreeReviewQueue,
    });
}

export function useApproveDegreeDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (candidateId: string) => ministryService.approveDegreeDocument(candidateId),
        onSuccess: () => {
            // Approval moves them into the eligible-candidates list, so
            // refresh the whole ministry key group same as issuance.
            queryClient.invalidateQueries({ queryKey: ministryKeys.all });
        },
    });
}

export function useRejectDegreeDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ candidateId, reason }: { candidateId: string; reason?: string }) =>
            ministryService.rejectDegreeDocument(candidateId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ministryKeys.degreeReviews() });
        },
    });
}

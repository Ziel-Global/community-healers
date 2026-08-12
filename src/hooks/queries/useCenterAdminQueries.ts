import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { centerAdminService, TrainingTimingsPayload, CenterDetails } from "@/services/centerAdminService";

export const centerAdminKeys = {
    all: ["centerAdmin"] as const,
    stats: () => [...centerAdminKeys.all, "stats"] as const,
    centerDetails: () => [...centerAdminKeys.all, "centerDetails"] as const,
    /** Called with no arg (base key) to invalidate every date at once. */
    todayCandidates: (examDate?: string) =>
        examDate
            ? ([...centerAdminKeys.all, "todayCandidates", examDate] as const)
            : ([...centerAdminKeys.all, "todayCandidates"] as const),
    historicalReports: () => [...centerAdminKeys.all, "historicalReports"] as const,
};

export function useCenterAdminStats() {
    return useQuery({
        queryKey: centerAdminKeys.stats(),
        queryFn: centerAdminService.getDashboardStats,
    });
}

export function useCenterDetails() {
    return useQuery({
        queryKey: centerAdminKeys.centerDetails(),
        queryFn: centerAdminService.getCenterDetails,
    });
}

export function useTodayCandidates(examDate: string) {
    return useQuery({
        queryKey: centerAdminKeys.todayCandidates(examDate),
        queryFn: () => centerAdminService.getTodayCandidates(examDate),
    });
}

export function useHistoricalReports() {
    return useQuery({
        queryKey: centerAdminKeys.historicalReports(),
        queryFn: centerAdminService.getReports,
    });
}

export function useUpdateCandidateStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: "VERIFIED" | "REJECTED" }) =>
            centerAdminService.updateCandidateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: centerAdminKeys.todayCandidates() });
        },
    });
}

export function useCloseVerification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (centerId: string) => centerAdminService.closeVerification(centerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: centerAdminKeys.todayCandidates() });
        },
    });
}

export function useUpdateTrainingTimings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ centerId, timings }: { centerId: string; timings: TrainingTimingsPayload }) =>
            centerAdminService.updateTrainingTimings(centerId, timings),
        onSuccess: (data) => {
            queryClient.setQueryData(
                centerAdminKeys.centerDetails(),
                (prev: CenterDetails | null | undefined) => (prev ? { ...prev, ...data } : prev),
            );
        },
    });
}

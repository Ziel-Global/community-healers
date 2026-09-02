import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { superAdminService } from "@/services/superAdminService";
import { CreateQuestionRequest, ExamSettings, CreateCenterRequest } from "@/types/superAdmin";
import { referenceKeys } from "./useReferenceQueries";

export const superAdminKeys = {
    all: ["superAdmin"] as const,
    dashboardStats: () => [...superAdminKeys.all, "dashboardStats"] as const,
    examParticipationTrend: (period: string) => [...superAdminKeys.all, "examParticipationTrend", period] as const,
    auditLogs: () => [...superAdminKeys.all, "auditLogs"] as const,
    examSettings: () => [...superAdminKeys.all, "examSettings"] as const,
    centers: () => [...superAdminKeys.all, "centers"] as const,
    centerDetails: (centerId: string) => [...superAdminKeys.all, "centerDetails", centerId] as const,
    centerRegisteredCandidates: (centerId: string, date: string) =>
        [...superAdminKeys.all, "centerRegisteredCandidates", centerId, date] as const,
    questions: () => [...superAdminKeys.all, "questions"] as const,
    centerAdmins: () => [...superAdminKeys.all, "centerAdmins"] as const,
    allCities: () => [...superAdminKeys.all, "allCities"] as const,
};

export function useDashboardStats() {
    return useQuery({
        queryKey: superAdminKeys.dashboardStats(),
        queryFn: superAdminService.getDashboardStats,
    });
}

export function useExamParticipationTrend(period: string) {
    return useQuery({
        queryKey: superAdminKeys.examParticipationTrend(period),
        queryFn: () => superAdminService.getExamParticipationTrend(period),
    });
}

export function useAuditLogs() {
    return useQuery({
        queryKey: superAdminKeys.auditLogs(),
        queryFn: superAdminService.getAuditLogs,
    });
}

export function useExamSettings() {
    return useQuery({
        queryKey: superAdminKeys.examSettings(),
        queryFn: superAdminService.getExamSettings,
    });
}

export function useSuperAdminCenters() {
    return useQuery({
        queryKey: superAdminKeys.centers(),
        queryFn: superAdminService.getCenters,
    });
}

export function useCenterDetails(centerId: string) {
    return useQuery({
        queryKey: superAdminKeys.centerDetails(centerId),
        queryFn: () => superAdminService.getCenterDetails(centerId),
        enabled: !!centerId,
    });
}

export function useCenterRegisteredCandidates(centerId: string, date: string) {
    return useQuery({
        queryKey: superAdminKeys.centerRegisteredCandidates(centerId, date),
        queryFn: () => superAdminService.getCenterRegisteredCandidates(centerId, date),
        enabled: !!centerId && !!date,
    });
}

export function useQuestions() {
    return useQuery({
        queryKey: superAdminKeys.questions(),
        queryFn: superAdminService.getQuestions,
    });
}

export function useCenterAdmins() {
    return useQuery({
        queryKey: superAdminKeys.centerAdmins(),
        queryFn: superAdminService.getCenterAdmins,
    });
}

export function useUpdateExamSettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (settings: ExamSettings) => superAdminService.updateExamSettings(settings),
        onSuccess: (_data, settings) => {
            queryClient.setQueryData(superAdminKeys.examSettings(), settings);
        },
    });
}

export function useCreateCenter() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (centerData: CreateCenterRequest) => superAdminService.createCenter(centerData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: superAdminKeys.centers() });
        },
    });
}

/**
 * Cities are shared reference data — see useReferenceQueries.useCities,
 * also read by the candidate-facing PersonalInfoForm. That query only
 * returns cities with at least one center (not a valid choice for a
 * candidate otherwise), so a freshly-created city won't appear there
 * until it has one — invalidate the super-admin-only unfiltered list too
 * so it shows up immediately for whoever's about to establish that city's
 * first center.
 */
export function useCreateCity() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (name: string) => superAdminService.createCity(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: referenceKeys.cities() });
            queryClient.invalidateQueries({ queryKey: superAdminKeys.allCities() });
        },
    });
}

/** All cities regardless of whether they have a center yet — for super-admin management (e.g. picking a city while establishing its first center). */
export function useAllCities() {
    return useQuery({
        queryKey: superAdminKeys.allCities(),
        queryFn: superAdminService.getAllCities,
    });
}

export function useCreateQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: CreateQuestionRequest) => superAdminService.createQuestion(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: superAdminKeys.questions() });
        },
    });
}

export function useUpdateQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, request }: { id: string; request: CreateQuestionRequest }) =>
            superAdminService.updateQuestion(id, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: superAdminKeys.questions() });
        },
    });
}

export function useDeleteQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => superAdminService.deleteQuestion(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: superAdminKeys.questions() });
        },
    });
}

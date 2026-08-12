import { useQuery } from "@tanstack/react-query";
import { superAdminService } from "@/services/superAdminService";

/**
 * Shared read-only reference data — currently just the city list, fetched
 * independently by both the candidate-facing PersonalInfoForm and the
 * super-admin CenterManager before this migration. One query key, one cache
 * entry: creating a city in CenterManager now shows up in PersonalInfoForm's
 * dropdown without a page reload.
 */
export const referenceKeys = {
    all: ["reference"] as const,
    cities: () => [...referenceKeys.all, "cities"] as const,
};

export function useCities() {
    return useQuery({
        queryKey: referenceKeys.cities(),
        queryFn: superAdminService.getCities,
        staleTime: 5 * 60_000,
    });
}

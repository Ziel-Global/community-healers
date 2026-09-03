import { useQuery } from "@tanstack/react-query";
import { superAdminService } from "@/services/superAdminService";

/**
 * Shared read-only reference data — currently just the city list, read by
 * both the candidate-facing PersonalInfoForm and the super-admin
 * CenterManager. One query key, one cache entry: creating a city in
 * CenterManager shows up in PersonalInfoForm's dropdown without a reload.
 *
 * Backed by the unfiltered /super-admin/cities/all endpoint — not every
 * city has a center yet, but both consumers need to see it immediately
 * regardless (a candidate can pick it, a super admin needs to pick it to
 * give it its first center).
 */
export const referenceKeys = {
    all: ["reference"] as const,
    cities: () => [...referenceKeys.all, "cities"] as const,
};

export function useCities() {
    return useQuery({
        queryKey: referenceKeys.cities(),
        queryFn: superAdminService.getAllCities,
        staleTime: 5 * 60_000,
    });
}

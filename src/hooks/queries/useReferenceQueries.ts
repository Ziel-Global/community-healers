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
    provinces: () => [...referenceKeys.all, "provinces"] as const,
    districts: (provinceId?: string) => [...referenceKeys.all, "districts", provinceId ?? "all"] as const,
    tehsils: (districtId?: string) => [...referenceKeys.all, "tehsils", districtId ?? "all"] as const,
};

export function useCities() {
    return useQuery({
        queryKey: referenceKeys.cities(),
        queryFn: superAdminService.getAllCities,
        staleTime: 5 * 60_000,
    });
}

/**
 * Provinces/districts for the candidate's residential-address form. Static
 * reference data — no admin screen ever creates or edits these, so a long
 * staleTime is safe (matches useCities').
 */
export function useProvinces() {
    return useQuery({
        queryKey: referenceKeys.provinces(),
        queryFn: superAdminService.getProvinces,
        staleTime: 5 * 60_000,
    });
}

/**
 * Districts for one province. Disabled until a province is actually picked —
 * there's no "all districts" dropdown in the UI, and fetching ~174 rows
 * before they're needed would be wasted work.
 */
export function useDistricts(provinceId: string | undefined) {
    return useQuery({
        queryKey: referenceKeys.districts(provinceId),
        queryFn: () => superAdminService.getDistricts(provinceId),
        enabled: !!provinceId,
        staleTime: 5 * 60_000,
    });
}

/**
 * Tehsils for one district. Same disabled-until-picked pattern as
 * useDistricts — there's no "all tehsils" dropdown in the UI.
 */
export function useTehsils(districtId: string | undefined) {
    return useQuery({
        queryKey: referenceKeys.tehsils(districtId),
        queryFn: () => superAdminService.getTehsils(districtId),
        enabled: !!districtId,
        staleTime: 5 * 60_000,
    });
}

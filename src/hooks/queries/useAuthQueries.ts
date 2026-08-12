import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { ExamScheduledResponse } from "@/types/auth";

export const authKeys = {
    all: ["auth"] as const,
    examSchedule: () => [...authKeys.all, "examSchedule"] as const,
};

/**
 * `authService.checkExamScheduled` swallows its own errors and resolves a
 * default `{ examScheduled: false, ... }` instead of throwing — this query
 * mirrors that: it never enters an error state from the backend's
 * perspective, matching the pre-migration behavior exactly.
 */
export function useExamSchedule(
    options?: Pick<UseQueryOptions<ExamScheduledResponse>, "enabled">,
) {
    return useQuery({
        queryKey: authKeys.examSchedule(),
        queryFn: authService.checkExamScheduled,
        enabled: options?.enabled,
    });
}

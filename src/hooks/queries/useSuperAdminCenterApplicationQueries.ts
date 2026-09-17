import { useQuery } from "@tanstack/react-query";
import { superAdminCenterApplicationService } from "@/services/centerApplicationService";

export const saCenterApplicationKeys = {
    all: ["saCenterApplications"] as const,
    list: () => [...saCenterApplicationKeys.all, "list"] as const,
    detail: (id: string) => [...saCenterApplicationKeys.all, "detail", id] as const,
};

export function useCenterApplications() {
    return useQuery({
        queryKey: saCenterApplicationKeys.list(),
        queryFn: superAdminCenterApplicationService.listApplications,
    });
}

export function useCenterApplicationDetail(applicationId: string) {
    return useQuery({
        queryKey: saCenterApplicationKeys.detail(applicationId),
        queryFn: () => superAdminCenterApplicationService.getApplicationDetail(applicationId),
        enabled: !!applicationId,
    });
}

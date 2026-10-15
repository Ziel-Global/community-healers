import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checklistAdminService } from "@/services/checklistAdminService";
import type { CreateChecklistItemPayload, UpdateChecklistItemPayload } from "@/types/checklistAdmin";

export const checklistAdminKeys = {
    all: ["checklistAdmin"] as const,
    list: () => [...checklistAdminKeys.all, "list"] as const,
};

/** Every inspection checklist item, active or not — for the builder. */
export function useChecklistItems() {
    return useQuery({
        queryKey: checklistAdminKeys.list(),
        queryFn: () => checklistAdminService.listItems(),
    });
}

function useInvalidateChecklistItems() {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: checklistAdminKeys.list() });
}

export function useCreateChecklistItem() {
    const invalidate = useInvalidateChecklistItems();
    return useMutation({
        mutationFn: (payload: CreateChecklistItemPayload) => checklistAdminService.createItem(payload),
        onSuccess: invalidate,
    });
}

export function useUpdateChecklistItem() {
    const invalidate = useInvalidateChecklistItems();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateChecklistItemPayload }) =>
            checklistAdminService.updateItem(id, payload),
        onSuccess: invalidate,
    });
}

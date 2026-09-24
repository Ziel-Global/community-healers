import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trainingInstructorsService, CreateTrainingInstructorPayload } from "@/services/trainingInstructorsService";

export const trainingInstructorKeys = {
    all: ["trainingInstructors"] as const,
    list: (centerId?: string) => [...trainingInstructorKeys.all, "list", centerId] as const,
};

export function useTrainingInstructorsList(centerId: string | null | undefined) {
    return useQuery({
        queryKey: trainingInstructorKeys.list(centerId ?? undefined),
        queryFn: () => trainingInstructorsService.listInstructors(centerId as string),
        enabled: !!centerId,
    });
}

export function useCreateTrainingInstructor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ centerId, payload }: { centerId: string; payload: CreateTrainingInstructorPayload }) =>
            trainingInstructorsService.createInstructor(centerId, payload),
        onSuccess: (_result, { centerId }) => {
            queryClient.invalidateQueries({ queryKey: trainingInstructorKeys.list(centerId) });
        },
    });
}

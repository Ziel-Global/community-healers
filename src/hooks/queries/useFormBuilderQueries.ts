import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFormFields, bureauFormBuilderService } from "@/services/formBuilderService";
import type { CreateFormFieldPayload, FormKey, UpdateFormFieldPayload } from "@/types/formBuilder";

export const formBuilderKeys = {
    all: ["formBuilder"] as const,
    public: (formKey: FormKey) => [...formBuilderKeys.all, "public", formKey] as const,
    bureau: (formKey: FormKey) => [...formBuilderKeys.all, "bureau", formKey] as const,
};

/** Only the fields currently switched on — for the applicant-facing onboarding wizard. */
export function useFormFields(formKey: FormKey) {
    return useQuery({
        queryKey: formBuilderKeys.public(formKey),
        queryFn: () => getFormFields(formKey),
    });
}

/** Every field, including hidden native ones — for Bureau's builder page. */
export function useBureauFormFields(formKey: FormKey) {
    return useQuery({
        queryKey: formBuilderKeys.bureau(formKey),
        queryFn: () => bureauFormBuilderService.listFields(formKey),
    });
}

function useInvalidateFormFields(formKey: FormKey) {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: formBuilderKeys.bureau(formKey) });
        queryClient.invalidateQueries({ queryKey: formBuilderKeys.public(formKey) });
    };
}

export function useCreateFormField(formKey: FormKey) {
    const invalidate = useInvalidateFormFields(formKey);
    return useMutation({
        mutationFn: (payload: CreateFormFieldPayload) => bureauFormBuilderService.createField(formKey, payload),
        onSuccess: invalidate,
    });
}

export function useUpdateFormField(formKey: FormKey) {
    const invalidate = useInvalidateFormFields(formKey);
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateFormFieldPayload }) =>
            bureauFormBuilderService.updateField(id, payload),
        onSuccess: invalidate,
    });
}

export function useDeleteFormField(formKey: FormKey) {
    const invalidate = useInvalidateFormFields(formKey);
    return useMutation({
        mutationFn: (id: string) => bureauFormBuilderService.deleteField(id),
        onSuccess: invalidate,
    });
}

export function useReorderFormFields(formKey: FormKey) {
    const invalidate = useInvalidateFormFields(formKey);
    return useMutation({
        mutationFn: (orderedIds: string[]) => bureauFormBuilderService.reorderFields(formKey, orderedIds),
        onSuccess: invalidate,
    });
}

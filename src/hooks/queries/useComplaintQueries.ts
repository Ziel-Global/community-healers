import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    complaintService,
    adminComplaintService,
    type ComplaintListParams,
    type AdminComplaintListParams,
    type CreateComplaintPayload,
    type UpdateComplaintStatusPayload,
} from "@/services/complaintService";

export const complaintKeys = {
    all: ["complaints"] as const,
    mine: (params?: ComplaintListParams) => [...complaintKeys.all, "mine", params ?? {}] as const,
    admin: {
        all: ["adminComplaints"] as const,
        list: (params?: AdminComplaintListParams) => ["adminComplaints", "list", params ?? {}] as const,
        detail: (id: string) => ["adminComplaints", "detail", id] as const,
    },
};

export function useMyComplaints(params?: ComplaintListParams) {
    return useQuery({
        queryKey: complaintKeys.mine(params),
        queryFn: () => complaintService.getMyComplaints(params),
    });
}

export function useCreateComplaint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateComplaintPayload) => complaintService.createComplaint(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: complaintKeys.all });
        },
    });
}

export function useAdminComplaints(params?: AdminComplaintListParams) {
    return useQuery({
        queryKey: complaintKeys.admin.list(params),
        queryFn: () => adminComplaintService.getAllComplaints(params),
    });
}

export function useUpdateComplaintStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateComplaintStatusPayload }) =>
            adminComplaintService.updateComplaintStatus(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: complaintKeys.admin.all });
        },
    });
}

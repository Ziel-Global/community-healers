import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { candidateService } from "@/services/candidateService";
import { authKeys } from "./useAuthQueries";
import { isExamOnOtherDeviceError } from "@/utils/examSession";

export const candidateKeys = {
    all: ["candidate"] as const,
    me: () => [...candidateKeys.all, "me"] as const,
    documentValidation: () => [...candidateKeys.all, "documentValidation"] as const,
    paymentStatus: () => [...candidateKeys.all, "paymentStatus"] as const,
    examStatus: () => [...candidateKeys.all, "examStatus"] as const,
    examQuestions: () => [...candidateKeys.all, "examQuestions"] as const,
};

export function useCandidateMe(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: candidateKeys.me(),
        queryFn: candidateService.getMe,
        enabled: options?.enabled,
    });
}

export function useDocumentValidation(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: candidateKeys.documentValidation(),
        queryFn: candidateService.validateDocuments,
        enabled: options?.enabled,
    });
}

export function usePaymentStatus(options?: {
    enabled?: boolean;
    refetchInterval?: number | false;
}) {
    return useQuery({
        queryKey: candidateKeys.paymentStatus(),
        queryFn: candidateService.getPaymentStatus,
        enabled: options?.enabled,
        refetchInterval: options?.refetchInterval,
    });
}

export function useExamStatus(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: candidateKeys.examStatus(),
        queryFn: candidateService.getExamStatus,
        enabled: options?.enabled,
    });
}

/**
 * Fetch-on-demand (fired by the "Begin Examination" click), not passive —
 * `enabled: false` + a manual `refetch()`. Replaces ExamPortal's hand-rolled
 * 3-attempt / 1.5s-delay sleep loop: the queryFn throws when the response
 * carries no usable questions (an empty array is treated as a failed
 * attempt, same as before), so TanStack's retry takes over the loop.
 * `retry: 2` + the initial attempt = 3 total attempts, matching
 * QUESTIONS_FETCH_ATTEMPTS. "Exam open on another device" bypasses retries
 * entirely so that specific screen shows immediately instead of after 3
 * doomed attempts.
 */
export function useExamQuestions() {
    return useQuery({
        queryKey: candidateKeys.examQuestions(),
        queryFn: async () => {
            const data = await candidateService.getExamQuestions();
            if (!Array.isArray(data?.questions) || data.questions.length === 0) {
                throw new Error("No exam questions returned");
            }
            return data;
        },
        enabled: false,
        retry: (failureCount, error) => failureCount < 2 && !isExamOnOtherDeviceError(error),
        retryDelay: 1500,
    });
}

export function useUpdateCandidateMe() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: Record<string, unknown>) => candidateService.updateMe(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: candidateKeys.me() });
        },
    });
}

export function useUploadDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ type, file }: { type: string; file: File }) => candidateService.uploadDocument(type, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: candidateKeys.me() });
            queryClient.invalidateQueries({ queryKey: candidateKeys.documentValidation() });
        },
    });
}

export function useScheduleExam() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (examDate: string) => candidateService.scheduleExam(examDate),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authKeys.examSchedule() });
        },
    });
}

/** Fire-and-forget, per-answer-click — errors are logged, never surfaced to the UI (matches prior behavior). */
export function useAutosaveAnswer() {
    return useMutation({
        mutationFn: ({ questionId, selectedOptionNumber }: { questionId: string; selectedOptionNumber: number }) =>
            candidateService.autosaveAnswer(questionId, selectedOptionNumber),
        onError: (error) => {
            console.error("Autosave answer failed:", error);
        },
    });
}

export function useSubmitExam() {
    return useMutation({
        mutationFn: (answers: Array<{ questionId: string; selectedOptionNumber: number }>) =>
            candidateService.submitExam(answers),
    });
}

export function useInitiatePayment() {
    return useMutation({
        mutationFn: candidateService.initiatePayment,
    });
}

export function useConfirmPayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ transactionId, bankTransactionRef }: { transactionId: string; bankTransactionRef: string }) =>
            candidateService.confirmPayment(transactionId, bankTransactionRef),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: candidateKeys.me() });
            queryClient.invalidateQueries({ queryKey: candidateKeys.paymentStatus() });
        },
    });
}

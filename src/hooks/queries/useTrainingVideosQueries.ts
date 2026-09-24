import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    trainingVideosService,
    CreateTrainingVideoPayload,
    UpdateTrainingVideoPayload,
} from "@/services/trainingVideosService";

export const trainingVideoKeys = {
    all: ["trainingVideos"] as const,
    progress: () => [...trainingVideoKeys.all, "progress"] as const,
    list: () => [...trainingVideoKeys.all, "list"] as const,
};

// ---- Training Instructor: play the course ----

export function useTrainingProgress() {
    return useQuery({
        queryKey: trainingVideoKeys.progress(),
        queryFn: () => trainingVideosService.getProgress(),
    });
}

export function usePlayVideo() {
    return useMutation({
        mutationFn: (videoId: string) => trainingVideosService.getPlayUrl(videoId),
    });
}

export function useMarkVideoComplete() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (videoId: string) => trainingVideosService.markComplete(videoId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trainingVideoKeys.progress() });
        },
    });
}

// ---- Super Admin: manage the catalog ----

export function useTrainingVideosList() {
    return useQuery({
        queryKey: trainingVideoKeys.list(),
        queryFn: trainingVideosService.listVideos,
    });
}

export function useCreateTrainingVideo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateTrainingVideoPayload) => trainingVideosService.createVideo(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trainingVideoKeys.list() });
        },
    });
}

export function useUpdateTrainingVideo() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateTrainingVideoPayload }) =>
            trainingVideosService.updateVideo(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trainingVideoKeys.list() });
        },
    });
}

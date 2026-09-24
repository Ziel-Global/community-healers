import { api } from './api';

export interface TrainingVideo {
    id: string;
    title: string;
    r2Key: string;
    sequenceOrder: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface NextVideo {
    id: string;
    title: string;
    sequenceOrder: number;
}

export interface TrainingVideoProgress {
    totalVideos: number;
    lastCompletedSequenceOrder: number;
    nextVideo: NextVideo | null;
}

export interface PlaybackUrlResponse {
    url: string;
    expiresIn: number;
}

export interface CreateTrainingVideoPayload {
    title: string;
    r2Key: string;
    sequenceOrder: number;
}

export interface UpdateTrainingVideoPayload {
    title?: string;
    sequenceOrder?: number;
}

// ---- Training Instructor: play the course ----
// No centerId — progress is keyed by the logged-in instructor's own identity.

export const getProgress = async (): Promise<TrainingVideoProgress> => {
    try {
        const response = await api.get('/internal/training-instructor/training-videos/progress');
        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching training progress:', error);
        throw error;
    }
};

export const getPlayUrl = async (videoId: string): Promise<PlaybackUrlResponse> => {
    try {
        const response = await api.get(`/internal/training-instructor/training-videos/${videoId}/play`);
        return response.data;
    } catch (error: unknown) {
        console.error('Error fetching training video playback URL:', error);
        throw error;
    }
};

export const markComplete = async (videoId: string): Promise<TrainingVideoProgress> => {
    try {
        const response = await api.post(`/internal/training-instructor/training-videos/${videoId}/complete`);
        return response.data;
    } catch (error: unknown) {
        console.error('Error marking training video complete:', error);
        throw error;
    }
};

// ---- Super Admin: manage the catalog ----

export const listVideos = async (): Promise<TrainingVideo[]> => {
    try {
        const response = await api.get('/super-admin/training-videos');
        return response.data || [];
    } catch (error: unknown) {
        console.error('Error fetching training videos:', error);
        throw error;
    }
};

export const createVideo = async (payload: CreateTrainingVideoPayload): Promise<TrainingVideo> => {
    try {
        const response = await api.post('/super-admin/training-videos', payload);
        return response.data;
    } catch (error: unknown) {
        console.error('Error creating training video:', error);
        throw error;
    }
};

export const updateVideo = async (id: string, payload: UpdateTrainingVideoPayload): Promise<TrainingVideo> => {
    try {
        const response = await api.patch(`/super-admin/training-videos/${id}`, payload);
        return response.data;
    } catch (error: unknown) {
        console.error('Error updating training video:', error);
        throw error;
    }
};

export const trainingVideosService = {
    getProgress,
    getPlayUrl,
    markComplete,
    listVideos,
    createVideo,
    updateVideo,
};

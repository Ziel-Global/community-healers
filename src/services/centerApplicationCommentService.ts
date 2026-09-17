import { api } from './api';

export interface ApplicationComment {
    id: string;
    text: string;
    createdAt: string;
    author: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        role: string;
    };
}

/**
 * Shared comment thread on a center application — lives at a neutral path (not under any
 * one role's prefix) since Super Admin, Director of Operations, and Committee members all
 * read from it; only committee members can post. Namespaced under `/internal` so it can't
 * collide with any frontend page route once that prefix is proxied to the backend.
 */
const listComments = async (applicationId: string): Promise<ApplicationComment[]> => {
    const response = await api.get(`/internal/center-applications/${applicationId}/comments`);
    return response.data;
};

const addComment = async (
    applicationId: string,
    text: string,
    scheduledInspectionDate?: string,
): Promise<ApplicationComment> => {
    const response = await api.post(`/internal/center-applications/${applicationId}/comments`, {
        text,
        scheduledInspectionDate,
    });
    return response.data;
};

export const centerApplicationCommentService = {
    listComments,
    addComment,
};

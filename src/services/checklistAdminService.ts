import { api } from './api';
import { getApiErrorMessage } from '../lib/errors';
import type { AdminChecklistItem, CreateChecklistItemPayload, UpdateChecklistItemPayload } from '../types/checklistAdmin';

const CHECKLIST_ITEMS_PREFIX = '/super-admin/checklist-items';

/** Bureau's (and Super Admin's) inspection-checklist builder — every item, active or not. */
export const checklistAdminService = {
    listItems: async (): Promise<AdminChecklistItem[]> => {
        try {
            const response = await api.get(CHECKLIST_ITEMS_PREFIX);
            return response.data;
        } catch (error: unknown) {
            console.error('List Checklist Items error:', error);
            throw new Error(getApiErrorMessage(error, 'Failed to load checklist items.'));
        }
    },

    createItem: async (payload: CreateChecklistItemPayload): Promise<AdminChecklistItem> => {
        try {
            const response = await api.post(CHECKLIST_ITEMS_PREFIX, payload);
            return response.data;
        } catch (error: unknown) {
            console.error('Create Checklist Item error:', error);
            throw new Error(getApiErrorMessage(error, 'Failed to add checklist item.'));
        }
    },

    updateItem: async (id: string, payload: UpdateChecklistItemPayload): Promise<AdminChecklistItem> => {
        try {
            const response = await api.patch(`${CHECKLIST_ITEMS_PREFIX}/${id}`, payload);
            return response.data;
        } catch (error: unknown) {
            console.error('Update Checklist Item error:', error);
            throw new Error(getApiErrorMessage(error, 'Failed to update checklist item.'));
        }
    },
};

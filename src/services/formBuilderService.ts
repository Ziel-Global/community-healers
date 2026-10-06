import { api } from './api';
import { getApiErrorMessage } from '../lib/errors';
import type { CreateFormFieldPayload, FormFieldDefinition, FormKey, UpdateFormFieldPayload } from '../types/formBuilder';

const BUREAU_FORM_FIELDS_PREFIX = '/internal/bureau/form-fields';

/** Public — only the fields Bureau currently has switched on. Used by the applicant-facing onboarding wizard. */
export const getFormFields = async (formKey: FormKey): Promise<FormFieldDefinition[]> => {
    try {
        const response = await api.get(`/center-onboarding/form-fields/${formKey}`);
        return response.data;
    } catch (error: unknown) {
        console.error('Get Form Fields error:', error);
        throw new Error(getApiErrorMessage(error, 'Failed to load form fields.'));
    }
};

/** Bureau's form builder — every field, including hidden native ones, so they can be shown again. */
export const bureauFormBuilderService = {
    listFields: async (formKey: FormKey): Promise<FormFieldDefinition[]> => {
        try {
            const response = await api.get(`${BUREAU_FORM_FIELDS_PREFIX}/${formKey}`);
            return response.data;
        } catch (error: unknown) {
            console.error('List Bureau Form Fields error:', error);
            throw new Error(getApiErrorMessage(error, 'Failed to load form fields.'));
        }
    },

    createField: async (formKey: FormKey, payload: CreateFormFieldPayload): Promise<FormFieldDefinition> => {
        try {
            const response = await api.post(`${BUREAU_FORM_FIELDS_PREFIX}/${formKey}`, payload);
            return response.data;
        } catch (error: unknown) {
            console.error('Create Form Field error:', error);
            throw new Error(getApiErrorMessage(error, 'Failed to add field.'));
        }
    },

    updateField: async (id: string, payload: UpdateFormFieldPayload): Promise<FormFieldDefinition> => {
        try {
            const response = await api.patch(`${BUREAU_FORM_FIELDS_PREFIX}/field/${id}`, payload);
            return response.data;
        } catch (error: unknown) {
            console.error('Update Form Field error:', error);
            throw new Error(getApiErrorMessage(error, 'Failed to update field.'));
        }
    },

    deleteField: async (id: string): Promise<{ id: string }> => {
        try {
            const response = await api.delete(`${BUREAU_FORM_FIELDS_PREFIX}/field/${id}`);
            return response.data;
        } catch (error: unknown) {
            console.error('Delete Form Field error:', error);
            throw new Error(getApiErrorMessage(error, 'Failed to remove field.'));
        }
    },

    reorderFields: async (formKey: FormKey, orderedIds: string[]): Promise<FormFieldDefinition[]> => {
        try {
            const response = await api.patch(`${BUREAU_FORM_FIELDS_PREFIX}/${formKey}/reorder`, { orderedIds });
            return response.data;
        } catch (error: unknown) {
            console.error('Reorder Form Fields error:', error);
            throw new Error(getApiErrorMessage(error, 'Failed to reorder fields.'));
        }
    },
};

export type FormKey = "CENTER_INFO" | "BUILDING_DETAILS" | "STAFF_ROSTER";

export type FormFieldKind = "NATIVE" | "CUSTOM";

export type FormFieldType = "TEXT" | "NUMBER" | "BOOLEAN" | "SELECT" | "DATE";

/** One field on an onboarding form — a NATIVE one of the form's existing hardcoded inputs, or a CUSTOM one Bureau added through the builder. */
export interface FormFieldDefinition {
    id: string;
    formKey: FormKey;
    fieldKey: string;
    kind: FormFieldKind;
    locked: boolean;
    label: string;
    fieldType: FormFieldType | null;
    options: string[] | null;
    required: boolean;
    visible: boolean;
    sortOrder: number;
}

export interface CreateFormFieldPayload {
    label: string;
    fieldType: FormFieldType;
    required?: boolean;
    options?: string[];
}

export interface UpdateFormFieldPayload {
    label?: string;
    required?: boolean;
    visible?: boolean;
    sortOrder?: number;
    options?: string[];
}

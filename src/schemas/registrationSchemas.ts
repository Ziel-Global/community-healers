import { z } from "zod";
import { differenceInYears, isValid, parseISO } from "date-fns";

/**
 * Validation for the candidate personal-info form. Unlike the auth schemas,
 * this form IS localized (English/Urdu via i18n), so schema `.message`
 * strings are short stable CODES, not final display text — callers map a
 * code to the correct translated string via `t()`. Keeps the actual
 * validation RULES centralized here while leaving translation to the UI.
 */
export const PERSONAL_INFO_ERROR_CODES = {
    REQUIRED: "required",
    CNIC_LENGTH: "cnic_length",
    CNIC_FORMAT: "cnic_format",
    DOB_INVALID: "dob_invalid",
    DOB_TOO_YOUNG: "dob_too_young",
} as const;

export const MINIMUM_CANDIDATE_AGE = 16;

export const cnicFieldSchema = z
    .string()
    .trim()
    .min(1, PERSONAL_INFO_ERROR_CODES.REQUIRED)
    .length(13, PERSONAL_INFO_ERROR_CODES.CNIC_LENGTH)
    .regex(/^\d{13}$/, PERSONAL_INFO_ERROR_CODES.CNIC_FORMAT);

export const dobFieldSchema = z
    .string()
    .trim()
    .min(1, PERSONAL_INFO_ERROR_CODES.REQUIRED)
    .refine((value) => isValid(parseISO(value)), PERSONAL_INFO_ERROR_CODES.DOB_INVALID)
    .refine(
        (value) => !isValid(parseISO(value)) || differenceInYears(new Date(), parseISO(value)) >= MINIMUM_CANDIDATE_AGE,
        PERSONAL_INFO_ERROR_CODES.DOB_TOO_YOUNG,
    );

export const personalInfoSchema = z.object({
    fatherName: z.string().trim().min(1, PERSONAL_INFO_ERROR_CODES.REQUIRED),
    cnic: cnicFieldSchema,
    dob: dobFieldSchema,
    city: z.string().trim().min(1, PERSONAL_INFO_ERROR_CODES.REQUIRED),
    address: z.string().trim().min(1, PERSONAL_INFO_ERROR_CODES.REQUIRED),
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;

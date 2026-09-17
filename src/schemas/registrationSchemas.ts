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

/**
 * Kept in sync with the backend's own floor (candidates.service.ts,
 * MINIMUM_REGISTRATION_AGE_YEARS) — this only saves a client-side round trip
 * for an obviously-too-young date; the backend enforces the real boundary
 * regardless of what this constant says.
 */
export const MINIMUM_CANDIDATE_AGE = 13;

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
    // Residential address hierarchy. The exam-centre city is auto-derived
    // server-side from `tehsil` — there is no separate city field here.
    // Required for a new registration to complete; existing candidates who
    // already finished registration before this shipped are never forced
    // back through this screen, since the backend itself leaves these three
    // optional (see UpdateProfileDto).
    province: z.string().trim().min(1, PERSONAL_INFO_ERROR_CODES.REQUIRED),
    district: z.string().trim().min(1, PERSONAL_INFO_ERROR_CODES.REQUIRED),
    tehsil: z.string().trim().min(1, PERSONAL_INFO_ERROR_CODES.REQUIRED),
    address: z.string().trim().min(1, PERSONAL_INFO_ERROR_CODES.REQUIRED),
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;

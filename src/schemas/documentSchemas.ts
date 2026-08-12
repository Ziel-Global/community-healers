import { z } from "zod";

/**
 * Validation for candidate document uploads. This form is localized too, so
 * (like registrationSchemas) `.message` values are short stable CODES — the
 * UI maps a code to the correct translated string.
 */
export const DOCUMENT_ERROR_CODES = {
    EMPTY_FILE: "empty_file",
    TOO_LARGE: "too_large",
    UNSUPPORTED_TYPE: "unsupported_type",
} as const;

export const DOCUMENT_TYPES = ["photo", "passport", "visa", "cnicFront", "cnicBack"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const MAX_DOCUMENT_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const ACCEPTED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const ACCEPTED_DOCUMENT_MIME_TYPES = [...ACCEPTED_IMAGE_MIME_TYPES, "application/pdf"];

/** "photo" must be an image; every other document type also accepts a PDF. */
function allowedMimeTypesFor(type: DocumentType): string[] {
    return type === "photo" ? ACCEPTED_IMAGE_MIME_TYPES : ACCEPTED_DOCUMENT_MIME_TYPES;
}

export const documentMetadataSchema = z
    .object({
        type: z.enum(DOCUMENT_TYPES),
        file: z
            .instanceof(File)
            .refine((file) => file.size > 0, DOCUMENT_ERROR_CODES.EMPTY_FILE)
            .refine((file) => file.size <= MAX_DOCUMENT_FILE_SIZE_BYTES, DOCUMENT_ERROR_CODES.TOO_LARGE),
    })
    .refine(({ type, file }) => allowedMimeTypesFor(type).includes(file.type), {
        message: DOCUMENT_ERROR_CODES.UNSUPPORTED_TYPE,
        path: ["file"],
    });

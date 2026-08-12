import { describe, it, expect } from "vitest";
import {
    candidateLoginSchema,
    candidateSignupSchema,
    candidateVerifySchema,
    emailLoginSchema,
    phoneSchema,
} from "@/schemas/authSchemas";
import {
    PERSONAL_INFO_ERROR_CODES,
    personalInfoSchema,
} from "@/schemas/registrationSchemas";
import {
    DOCUMENT_ERROR_CODES,
    documentMetadataSchema,
} from "@/schemas/documentSchemas";

describe("authSchemas", () => {
    it("phoneSchema accepts common Pakistani mobile formats", () => {
        expect(phoneSchema.safeParse("03001234567").success).toBe(true);
        expect(phoneSchema.safeParse("+923001234567").success).toBe(true);
        expect(phoneSchema.safeParse("923001234567").success).toBe(true);
    });

    it("phoneSchema rejects garbage input", () => {
        expect(phoneSchema.safeParse("12345").success).toBe(false);
        expect(phoneSchema.safeParse("").success).toBe(false);
    });

    it("candidateLoginSchema requires a valid phone and a non-empty password", () => {
        expect(candidateLoginSchema.safeParse({ phoneNumber: "03001234567", password: "x" }).success).toBe(true);
        expect(candidateLoginSchema.safeParse({ phoneNumber: "not-a-phone", password: "x" }).success).toBe(false);
        expect(candidateLoginSchema.safeParse({ phoneNumber: "03001234567", password: "" }).success).toBe(false);
    });

    it("candidateSignupSchema rejects a too-short password", () => {
        const result = candidateSignupSchema.safeParse({
            firstName: "A",
            lastName: "B",
            email: "a@b.com",
            phoneNumber: "03001234567",
            password: "123",
            confirmPassword: "123",
        });
        expect(result.success).toBe(false);
    });

    it("candidateSignupSchema rejects mismatched passwords, pointing at confirmPassword", () => {
        const result = candidateSignupSchema.safeParse({
            firstName: "A",
            lastName: "B",
            email: "a@b.com",
            phoneNumber: "03001234567",
            password: "password1",
            confirmPassword: "password2",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
        }
    });

    it("candidateSignupSchema accepts valid input", () => {
        const result = candidateSignupSchema.safeParse({
            firstName: "A",
            lastName: "B",
            email: "a@b.com",
            phoneNumber: "03001234567",
            password: "password1",
            confirmPassword: "password1",
        });
        expect(result.success).toBe(true);
    });

    it("candidateVerifySchema requires a 6-digit numeric OTP", () => {
        expect(candidateVerifySchema.safeParse({ phoneNumber: "03001234567", otp: "123456" }).success).toBe(true);
        expect(candidateVerifySchema.safeParse({ phoneNumber: "03001234567", otp: "12345" }).success).toBe(false);
        expect(candidateVerifySchema.safeParse({ phoneNumber: "03001234567", otp: "12345a" }).success).toBe(false);
    });

    it("emailLoginSchema rejects an invalid email", () => {
        expect(emailLoginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
        expect(emailLoginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
    });
});

describe("registrationSchemas — personalInfoSchema", () => {
    const valid = {
        fatherName: "Father Name",
        cnic: "1234567890123",
        dob: "2000-01-01",
        city: "city-id",
        address: "123 Street",
    };

    it("accepts fully valid personal info", () => {
        expect(personalInfoSchema.safeParse(valid).success).toBe(true);
    });

    it("flags missing required fields with the REQUIRED code", () => {
        const result = personalInfoSchema.safeParse({ ...valid, fatherName: "" });
        expect(result.success).toBe(false);
        if (!result.success) {
            const issue = result.error.issues.find((i) => i.path[0] === "fatherName");
            expect(issue?.message).toBe(PERSONAL_INFO_ERROR_CODES.REQUIRED);
        }
    });

    it("rejects a CNIC that isn't exactly 13 digits", () => {
        const result = personalInfoSchema.safeParse({ ...valid, cnic: "123" });
        expect(result.success).toBe(false);
        if (!result.success) {
            const issue = result.error.issues.find((i) => i.path[0] === "cnic");
            expect(issue?.message).toBe(PERSONAL_INFO_ERROR_CODES.CNIC_LENGTH);
        }
    });

    it("rejects a CNIC containing non-digit characters", () => {
        const result = personalInfoSchema.safeParse({ ...valid, cnic: "12345abcde123" });
        expect(result.success).toBe(false);
    });

    it("rejects a candidate younger than 16, with the DOB_TOO_YOUNG code", () => {
        const oneYearOld = new Date();
        oneYearOld.setFullYear(oneYearOld.getFullYear() - 1);
        const result = personalInfoSchema.safeParse({
            ...valid,
            dob: oneYearOld.toISOString().split("T")[0],
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            const issue = result.error.issues.find((i) => i.path[0] === "dob");
            expect(issue?.message).toBe(PERSONAL_INFO_ERROR_CODES.DOB_TOO_YOUNG);
        }
    });

    it("accepts a candidate exactly at the minimum age", () => {
        const sixteenYearsAgo = new Date();
        sixteenYearsAgo.setFullYear(sixteenYearsAgo.getFullYear() - 16);
        sixteenYearsAgo.setDate(sixteenYearsAgo.getDate() - 1);
        const result = personalInfoSchema.safeParse({
            ...valid,
            dob: sixteenYearsAgo.toISOString().split("T")[0],
        });
        expect(result.success).toBe(true);
    });
});

describe("documentSchemas — documentMetadataSchema", () => {
    function makeFile(name: string, type: string, sizeBytes: number): File {
        const blob = new Blob([new Uint8Array(sizeBytes)], { type });
        return new File([blob], name, { type });
    }

    it("accepts a valid image for a photo document", () => {
        const file = makeFile("photo.jpg", "image/jpeg", 1024);
        expect(documentMetadataSchema.safeParse({ type: "photo", file }).success).toBe(true);
    });

    it("accepts a PDF for a non-photo document type", () => {
        const file = makeFile("passport.pdf", "application/pdf", 1024);
        expect(documentMetadataSchema.safeParse({ type: "passport", file }).success).toBe(true);
    });

    it("rejects a PDF for the photo document type (photo must be an image)", () => {
        const file = makeFile("photo.pdf", "application/pdf", 1024);
        const result = documentMetadataSchema.safeParse({ type: "photo", file });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe(DOCUMENT_ERROR_CODES.UNSUPPORTED_TYPE);
        }
    });

    it("rejects a file over the 5MB size limit", () => {
        const file = makeFile("big.jpg", "image/jpeg", 6 * 1024 * 1024);
        const result = documentMetadataSchema.safeParse({ type: "photo", file });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe(DOCUMENT_ERROR_CODES.TOO_LARGE);
        }
    });

    it("rejects an empty file", () => {
        const file = makeFile("empty.jpg", "image/jpeg", 0);
        const result = documentMetadataSchema.safeParse({ type: "photo", file });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0].message).toBe(DOCUMENT_ERROR_CODES.EMPTY_FILE);
        }
    });

    it("rejects an unrecognized document type", () => {
        const file = makeFile("photo.jpg", "image/jpeg", 1024);
        expect(documentMetadataSchema.safeParse({ type: "notADocType", file }).success).toBe(false);
    });
});

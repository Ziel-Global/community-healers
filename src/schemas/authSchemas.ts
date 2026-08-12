import { z } from "zod";

/**
 * Validation schemas for the four portal logins plus candidate signup/OTP
 * verification and the (currently simulated) forgot-password flow. None of
 * these forms use i18n today, so schema `.message` strings are shown to the
 * user as-is.
 */

// Matches the backend's normalizePhone(): 03XXXXXXXXX, +923XXXXXXXXX, or 923XXXXXXXXX.
const phoneRegex = /^(\+92|92|0)?3\d{9}$/;

export const phoneSchema = z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(phoneRegex, "Enter a valid Pakistani mobile number (e.g. 03001234567)");

export const passwordSchema = z
    .string()
    .min(6, "Password must be at least 6 characters");

export const emailSchema = z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address");

export const otpSchema = z
    .string()
    .length(6, "Enter the 6-digit code")
    .regex(/^\d{6}$/, "Code must contain only digits");

/** Candidate login: phone + password. */
export const candidateLoginSchema = z.object({
    phoneNumber: phoneSchema,
    password: z.string().min(1, "Password is required"),
});

/** Candidate signup. */
export const candidateSignupSchema = z
    .object({
        firstName: z.string().trim().min(1, "First name is required"),
        lastName: z.string().trim().min(1, "Last name is required"),
        email: emailSchema,
        phoneNumber: phoneSchema,
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

/** Candidate OTP verification (post-signup). */
export const candidateVerifySchema = z.object({
    phoneNumber: phoneSchema,
    otp: otpSchema,
});

/** Center admin / ministry / super admin login — all share the same shape. */
export const emailLoginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
});

/** Forgot-password flow, step 1: phone number. */
export const forgotPasswordPhoneSchema = z.object({
    phone: phoneSchema,
});

/** Forgot-password flow, final step: new password + confirmation. */
export const resetPasswordSchema = z
    .object({
        newPassword: passwordSchema,
        confirmNewPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: "Passwords do not match",
        path: ["confirmNewPassword"],
    });

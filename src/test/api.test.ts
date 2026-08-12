import { describe, it, expect } from "vitest";
import type { AxiosResponse } from "axios";
import { parseRetryAfterSeconds, buildRateLimitMessage, unwrapEnvelope } from "@/services/api";

function fakeResponse(data: unknown): AxiosResponse {
    return {
        data,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {} as AxiosResponse["config"],
    };
}

describe("parseRetryAfterSeconds", () => {
    it("parses a numeric delay-seconds header", () => {
        expect(parseRetryAfterSeconds("30")).toBe(30);
    });

    it("parses an HTTP-date header into remaining seconds", () => {
        const future = new Date(Date.now() + 45_000).toUTCString();
        const seconds = parseRetryAfterSeconds(future);
        expect(seconds).not.toBeNull();
        // allow small timing slack
        expect(seconds).toBeGreaterThanOrEqual(43);
        expect(seconds).toBeLessThanOrEqual(46);
    });

    it("returns null when the header is missing", () => {
        expect(parseRetryAfterSeconds(undefined)).toBeNull();
        expect(parseRetryAfterSeconds(null)).toBeNull();
    });

    it("returns null for a garbage header value", () => {
        expect(parseRetryAfterSeconds("not-a-number-or-date")).toBeNull();
    });

    it("never returns a negative number for a past date", () => {
        const past = new Date(Date.now() - 10_000).toUTCString();
        expect(parseRetryAfterSeconds(past)).toBe(0);
    });
});

describe("buildRateLimitMessage", () => {
    it("includes the wait time when Retry-After is present", () => {
        expect(buildRateLimitMessage("30")).toBe(
            "Too many requests. Please wait 30 seconds and try again.",
        );
    });

    it("uses singular 'second' for a 1-second wait", () => {
        expect(buildRateLimitMessage("1")).toBe(
            "Too many requests. Please wait 1 second and try again.",
        );
    });

    it("falls back to a generic message when Retry-After is missing", () => {
        expect(buildRateLimitMessage(undefined)).toBe(
            "You're making requests too quickly. Please wait a moment and try again.",
        );
    });

    it("falls back to a generic message when Retry-After is unparseable", () => {
        expect(buildRateLimitMessage("garbage")).toBe(
            "You're making requests too quickly. Please wait a moment and try again.",
        );
    });
});

describe("unwrapEnvelope", () => {
    it("strips the backend's single response envelope, leaving the real payload", () => {
        const response = fakeResponse({
            appName: "Community Healers",
            path: "/candidates/me/status",
            statusCode: 200,
            data: { candidateStatus: "VERIFIED", examDate: "2026-07-29" },
            apiVersion: "1.0.0",
            message: "Success!",
            error: null,
            userId: "user-1",
        });

        const result = unwrapEnvelope(response);

        expect(result.data).toEqual({ candidateStatus: "VERIFIED", examDate: "2026-07-29" });
    });

    it("does not double-unwrap — a payload that itself has no further envelope stays intact", () => {
        const response = fakeResponse({
            appName: "Community Healers",
            path: "/auth/login/candidate",
            statusCode: 201,
            data: { accessToken: "abc", refreshToken: "def" },
            apiVersion: "1.0.0",
            message: "Candidate login successful",
            error: null,
            userId: null,
        });

        const result = unwrapEnvelope(response);

        expect(result.data).toEqual({ accessToken: "abc", refreshToken: "def" });
    });

    it("leaves the response untouched if the body doesn't look like the envelope", () => {
        const response = fakeResponse("plain text body");
        const result = unwrapEnvelope(response);
        expect(result.data).toBe("plain text body");
    });

    it("leaves an array response untouched (no 'data' key to unwrap)", () => {
        const response = fakeResponse([1, 2, 3]);
        const result = unwrapEnvelope(response);
        expect(result.data).toEqual([1, 2, 3]);
    });
});

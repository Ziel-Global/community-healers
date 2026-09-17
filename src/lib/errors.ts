import axios from "axios";

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

/**
 * Service functions in this app throw two different shapes: candidateService/
 * centerAdminService/ministryService rethrow the raw axios error (so
 * `error.response?.data?.message` is where the backend's message lives), while
 * authService/superAdminService wrap it in `new Error(message)` (so only
 * `error.message` survives — the axios response is discarded). This checks
 * both, in the right order, so callers get a correct message either way.
 */
export function getApiErrorMessage(error: unknown, fallback: string = DEFAULT_ERROR_MESSAGE): string {
    if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.message;
        if (typeof backendMessage === "string" && backendMessage.trim()) {
            return backendMessage;
        }
        // NestJS's ValidationPipe returns `message` as a string[] (one entry
        // per failed field), not a string — without this branch every
        // validation error falls through to Axios's generic
        // "Request failed with status code NNN" instead of the actual reason.
        if (Array.isArray(backendMessage) && backendMessage.length > 0) {
            return backendMessage.filter((m) => typeof m === "string").join(" ");
        }
        if (error.message) {
            return error.message;
        }
        return fallback;
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}

/**
 * Some backend errors (the exam-start gates, liveness) carry a machine-readable
 * `error` code alongside the human-readable `message` — e.g. `EXAM_NOT_RELEASED`.
 * Branch on this, never on the message string, which can change wording freely.
 */
export function getApiErrorCode(error: unknown): string | undefined {
    if (axios.isAxiosError(error)) {
        const code = error.response?.data?.error;
        if (typeof code === "string") return code;
    }
    return undefined;
}

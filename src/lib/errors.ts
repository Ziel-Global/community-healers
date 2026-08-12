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

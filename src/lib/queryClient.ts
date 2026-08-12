import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

const NO_RETRY_STATUS_CODES = new Set([400, 401, 403, 404, 422]);

/**
 * The backend's 401 handling already triggers a hard redirect (see the
 * response interceptor in services/api.ts), and 400/403/404/422 are
 * validation/business errors, not transient failures — retrying them just
 * delays the user seeing the real error. Everything else (network blips,
 * 5xx) gets one retry.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
    if (axios.isAxiosError(error) && error.response) {
        if (NO_RETRY_STATUS_CODES.has(error.response.status)) {
            return false;
        }
    }
    return failureCount < 1;
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            retry: shouldRetry,
        },
        mutations: {
            retry: false,
        },
    },
});

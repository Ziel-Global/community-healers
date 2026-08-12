import type { ErrorInfo } from "react";

/**
 * Single seam for reporting crashes caught by an ErrorBoundary. Console-only
 * today — there is no backend endpoint yet to receive client-side crash
 * reports (the backend's error-logs module only captures server-side
 * exceptions). Wire a real backend call or a monitoring SDK in here later
 * without touching every ErrorBoundary call site.
 */
export function logClientError(error: unknown, info: ErrorInfo): void {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    console.error("[ErrorBoundary] Unhandled UI crash:", {
        message,
        stack,
        componentStack: info.componentStack,
        path: typeof window !== "undefined" ? window.location.pathname : undefined,
        timestamp: new Date().toISOString(),
    });
}

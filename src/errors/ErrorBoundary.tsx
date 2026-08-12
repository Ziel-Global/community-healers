import { ReactNode } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./ErrorFallback";
import { logClientError } from "./errorLogger";

interface AppErrorBoundaryProps {
    children: ReactNode;
    /** When any value in this array changes, a triggered fallback resets automatically. */
    resetKeys?: unknown[];
    fallbackTitle?: string;
    fallbackDescription?: string;
    homePath?: string;
}

/**
 * App-wide default for catching render-time crashes: wires up our fallback
 * UI and error logging so call sites don't repeat that configuration.
 */
export function AppErrorBoundary({
    children,
    resetKeys,
    fallbackTitle,
    fallbackDescription,
    homePath,
}: AppErrorBoundaryProps) {
    return (
        <ReactErrorBoundary
            onError={logClientError}
            resetKeys={resetKeys}
            FallbackComponent={({ error, resetErrorBoundary }) => (
                <ErrorFallback
                    error={error}
                    resetErrorBoundary={resetErrorBoundary}
                    title={fallbackTitle}
                    description={fallbackDescription}
                    homePath={homePath}
                />
            )}
        >
            {children}
        </ReactErrorBoundary>
    );
}

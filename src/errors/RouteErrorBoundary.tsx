import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AppErrorBoundary } from "./ErrorBoundary";

interface RouteErrorBoundaryProps {
    children: ReactNode;
}

/**
 * Resets automatically on navigation (keyed on pathname), so leaving a
 * crashed page clears the fallback instead of it getting stuck showing on
 * whatever route you land on next. Must render under <BrowserRouter>.
 */
export function RouteErrorBoundary({ children }: RouteErrorBoundaryProps) {
    const location = useLocation();

    return (
        <AppErrorBoundary resetKeys={[location.pathname]}>
            {children}
        </AppErrorBoundary>
    );
}

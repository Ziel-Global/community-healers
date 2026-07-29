import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PortalType, PORTAL_ALLOWED_ROLES, ROLE_HOME_PATH } from '@/types/roles';

interface ProtectedRouteProps {
    children: React.ReactNode;
    portalType: PortalType;
}

const authPaths: Record<PortalType, string> = {
    candidate: '/candidate/auth',
    center: '/center/auth',
    admin: '/admin/auth',
    ministry: '/ministry/auth',
    exam: '/training/auth',
};

export function ProtectedRoute({ children, portalType }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        // Show a minimal centered spinner while auth state is resolving
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to={authPaths[portalType] || '/'} replace />;
    }

    // Authenticated, but not necessarily authorized for THIS portal — a
    // candidate token must not be able to open the center/admin/ministry UI
    // just because it's a valid, logged-in session.
    const allowedRoles = PORTAL_ALLOWED_ROLES[portalType];
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to={ROLE_HOME_PATH[user.role] || '/'} replace />;
    }

    return <>{children}</>;
}

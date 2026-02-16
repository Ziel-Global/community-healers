import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    portalType: 'candidate' | 'center' | 'admin' | 'ministry' | 'exam';
}

const authPaths: Record<string, string> = {
    candidate: '/candidate/auth',
    center: '/center/auth',
    admin: '/admin/auth',
    ministry: '/ministry/auth',
    exam: '/exam/auth',
};

export function ProtectedRoute({ children, portalType }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        // Show a minimal centered spinner while auth state is resolving
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={authPaths[portalType] || '/'} replace />;
    }

    return <>{children}</>;
}

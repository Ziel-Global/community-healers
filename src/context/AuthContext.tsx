import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User, CandidateLoginCredentials, CenterAdminLoginCredentials, MinistryLoginCredentials, SuperAdminLoginCredentials, SignupCredentials, AuthState, CandidateVerificationCredentials, ExamScheduledResponse } from '../types/auth';
import { authService } from '../services/authService';
import i18n from '../i18n';
import { authKeys, useExamSchedule } from '../hooks/queries/useAuthQueries';

interface AuthContextType extends AuthState {
    loginCandidate: (credentials: CandidateLoginCredentials) => Promise<void>;
    loginCenterAdmin: (credentials: CenterAdminLoginCredentials) => Promise<void>;
    loginMinistry: (credentials: MinistryLoginCredentials) => Promise<void>;
    loginSuperAdmin: (credentials: SuperAdminLoginCredentials) => Promise<void>;
    signup: (credentials: SignupCredentials) => Promise<void>;
    verifyCandidate: (credentials: CandidateVerificationCredentials) => Promise<void>;
    logout: () => Promise<void>;
    examScheduleInfo: ExamScheduledResponse | null;
    checkExamSchedule: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

function applyLoggedInUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
}

function clearStoredSession() {
    localStorage.removeItem('user');
    localStorage.removeItem('examScheduleInfo');
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const queryClient = useQueryClient();
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
    });

    // Backed by useExamSchedule (see hooks/queries/useAuthQueries.ts) instead of
    // manually-managed state + a localStorage mirror — only fetches once a
    // candidate is actually authenticated.
    const examScheduleQuery = useExamSchedule({
        enabled: state.isAuthenticated && state.user?.role === 'CANDIDATE',
    });
    const examScheduleInfo = examScheduleQuery.data ?? null;

    /** Persists the logged-in user and marks the session active — every successful login/verify/session-check path ends here. */
    const hydrateSession = (user: User) => {
        applyLoggedInUser(user);
        setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
        });
    };

    // The access token lives in an httpOnly cookie the browser manages — it's
    // never readable by JS, so there's no client-side expiry check to make
    // anymore. Instead, verify the session against the backend directly.
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await authService.getMe();
                hydrateSession(response.user);
            } catch {
                // No valid session cookie (never logged in, expired, or revoked).
                clearStoredSession();
                setState((prev) => ({ ...prev, isLoading: false }));
            }
        };

        checkAuth();
    }, []);

    const loginCandidate = async (credentials: CandidateLoginCredentials) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await authService.loginCandidate(credentials);
            hydrateSession(response.user);

            // examScheduleQuery becomes enabled now that isAuthenticated + role
            // are set (candidate), fetching automatically; invalidate too in
            // case a query for this key was already cached from before.
            if (response.user.role === 'CANDIDATE') {
                queryClient.invalidateQueries({ queryKey: authKeys.examSchedule() });
            }
        } catch (error: unknown) {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Login failed',
            }));
            throw error;
        }
    };

    const loginCenterAdmin = async (credentials: CenterAdminLoginCredentials) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await authService.loginCenterAdmin(credentials);
            hydrateSession(response.user);
        } catch (error: unknown) {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Login failed',
            }));
            throw error;
        }
    };

    const loginMinistry = async (credentials: MinistryLoginCredentials) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await authService.loginMinistry(credentials);
            hydrateSession(response.user);
        } catch (error: unknown) {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Login failed',
            }));
            throw error;
        }
    };

    const loginSuperAdmin = async (credentials: SuperAdminLoginCredentials) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await authService.loginSuperAdmin(credentials);
            hydrateSession(response.user);
        } catch (error: unknown) {
            console.error("Login error details:", error);
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Login failed',
            }));
            throw error;
        }
    };

    const signup = async (credentials: SignupCredentials) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            // Only requests an OTP — no session exists yet. verifyCandidate()
            // (after the user enters the OTP) is what actually logs them in.
            await authService.signup(credentials);
            setState((prev) => ({ ...prev, isLoading: false }));
        } catch (error: unknown) {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Signup failed',
            }));
            throw error;
        }
    };

    const verifyCandidate = async (credentials: CandidateVerificationCredentials) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await authService.verifyCandidate(credentials);
            hydrateSession(response.user);
        } catch (error: unknown) {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Verification failed',
            }));
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            clearStoredSession();

            // Reset language to English (LTR) on logout
            i18n.changeLanguage('en');
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = 'en';

            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
            queryClient.removeQueries({ queryKey: authKeys.examSchedule() });
        }
    };

    const checkExamSchedule = async () => {
        await examScheduleQuery.refetch();
    };

    const value = {
        ...state,
        loginCandidate,
        loginCenterAdmin,
        loginMinistry,
        loginSuperAdmin,
        signup,
        verifyCandidate,
        logout,
        examScheduleInfo,
        checkExamSchedule,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

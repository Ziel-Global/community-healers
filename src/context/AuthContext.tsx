import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, CandidateLoginCredentials, CenterAdminLoginCredentials, MinistryLoginCredentials, SuperAdminLoginCredentials, SignupCredentials, AuthState, CandidateVerificationCredentials, ExamScheduledResponse } from '../types/auth';
import { authService } from '../services/authService';
import { parseJwt, isTokenExpired } from '../utils/jwt';

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
    });

    const [examScheduleInfo, setExamScheduleInfo] = useState<ExamScheduledResponse | null>(null);

    // Check for existing token on mount
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            const storedExamInfo = localStorage.getItem('examScheduleInfo');

            if (storedToken && storedUser && storedUser !== "undefined" && storedToken !== "undefined") {
                // Check if token is expired before restoring auth state
                if (isTokenExpired(storedToken)) {
                    console.warn('Stored JWT token is expired — clearing session.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('examScheduleInfo');
                    setState((prev) => ({ ...prev, isLoading: false }));
                    return;
                }

                try {
                    // Ideally, validate token with backend here
                    const user = JSON.parse(storedUser);
                    setState({
                        user,
                        token: storedToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });

                    // Load exam schedule info for candidates
                    if ((user.role === 'student' || user.role === 'CANDIDATE') && storedExamInfo && storedExamInfo !== "undefined") {
                        try {
                            setExamScheduleInfo(JSON.parse(storedExamInfo));
                        } catch (e) {
                            console.error('Failed to parse exam schedule info:', e);
                        }
                    }
                } catch (error) {
                    console.error('Failed to parse user from local storage:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('examScheduleInfo');
                    setState((prev) => ({ ...prev, isLoading: false }));
                }
            } else {
                // Clear invalid items if they exist
                if (storedUser === "undefined" || storedToken === "undefined") {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    localStorage.removeItem('examScheduleInfo');
                }
                setState((prev) => ({ ...prev, isLoading: false }));
            }
        };

        checkAuth();
    }, []);

    const loginCandidate = async (credentials: CandidateLoginCredentials) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await authService.loginCandidate(credentials);
            const token = response.token ||
                response.accessToken ||
                response.access_token ||
                response.data?.data?.accessToken ||
                response.data?.accessToken;

            if (!token) {
                console.error("Login response structure:", response);
                throw new Error("No access token received from server");
            }

            let user = response.user;
            if (!user) {
                const decoded = parseJwt(token);
                if (decoded) {
                    user = {
                        id: decoded.sub || decoded.id,
                        email: decoded.email,
                        firstName: decoded.firstName || 'Candidate',
                        lastName: decoded.lastName || '',
                        role: decoded.role || 'student',
                        phoneNumber: decoded.phoneNumber || credentials.phoneNumber,
                    };
                }
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setState({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

            // Check exam schedule after successful login for candidates
            if (user.role === 'student' || (user.role as string) === 'CANDIDATE') {
                try {
                    const examInfo = await authService.checkExamScheduled();
                    setExamScheduleInfo(examInfo);
                    localStorage.setItem('examScheduleInfo', JSON.stringify(examInfo));
                } catch (error) {
                    console.error('Failed to check exam schedule:', error);
                }
            }
        } catch (error: any) {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error.message || 'Login failed',
            }));
            throw error;
        }
    };

    const loginCenterAdmin = async (credentials: CenterAdminLoginCredentials) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await authService.loginCenterAdmin(credentials);
            const token = response.token ||
                response.accessToken ||
                response.access_token ||
                response.data?.data?.accessToken ||
                response.data?.accessToken;

            if (!token) {
                throw new Error("No access token received from server");
            }

            let user = response.user;
            if (!user) {
                const decoded = parseJwt(token);
                if (decoded) {
                    user = {
                        id: decoded.sub || decoded.id,
                        email: decoded.email,
                        firstName: decoded.firstName || 'Center',
                        lastName: decoded.lastName || 'Admin',
                        role: decoded.role || 'center_admin',
                        phoneNumber: decoded.phoneNumber || '',
                    };
                }
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setState({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error: any) {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error.message || 'Login failed',
            }));
            throw error;
        }
    };

    const loginMinistry = async (credentials: MinistryLoginCredentials) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await authService.loginMinistry(credentials);
            const token = response.token ||
                response.accessToken ||
                response.access_token ||
                response.data?.data?.accessToken ||
                response.data?.accessToken;

            if (!token) {
                throw new Error("No access token received from server");
            }

            let user = response.user;
            if (!user) {
                const decoded = parseJwt(token);
                if (decoded) {
                    user = {
                        id: decoded.sub || decoded.id,
                        email: decoded.email,
                        firstName: decoded.firstName || 'Ministry',
                        lastName: decoded.lastName || 'Official',
                        role: decoded.role || 'ministry',
                        phoneNumber: decoded.phoneNumber || '',
                    };
                }
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setState({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error: any) {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error.message || 'Login failed',
            }));
            throw error;
        }
    };

    const loginSuperAdmin = async (credentials: SuperAdminLoginCredentials) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await authService.loginSuperAdmin(credentials);
            // Handle deeply nested token: response.data.data.accessToken
            const token = response.token ||
                response.accessToken ||
                response.access_token ||
                response.data?.data?.accessToken ||
                response.data?.accessToken;

            if (!token) {
                console.error("Login response structure:", response);
                throw new Error("No access token received from server");
            }

            let user = response.user;
            if (!user) {
                const decoded = parseJwt(token);
                if (decoded) {
                    user = {
                        id: decoded.sub || decoded.id || decoded.userId,
                        email: decoded.email,
                        firstName: decoded.firstName || 'Admin', // Fallback if not in token
                        lastName: decoded.lastName || 'User',
                        role: decoded.role || 'admin',
                        phoneNumber: decoded.phoneNumber || '',
                    };
                }
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setState({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error: any) {
            console.error("Login error details:", error);
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error.message || 'Login failed',
            }));
            throw error;
        }
    };

    const signup = async (credentials: SignupCredentials) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await authService.signup(credentials);
            const token = response.token || response.accessToken || response.access_token;
            const user = response.user;

            // Optional: Token might not be returned on signup request if OTP is required first
            if (token) {
                localStorage.setItem('token', token);
                // Also set user if token is present
                if (user) localStorage.setItem('user', JSON.stringify(user));
            }
            // If user is returned but no token, we might still want to set it?
            // Usually signup logic handled inside component for OTP flow, but here we just update state
            if (user && token) {
                setState({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });
            } else {
                setState((prev) => ({ ...prev, isLoading: false }));
            }
        } catch (error: any) {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error.message || 'Signup failed',
            }));
            throw error;
        }
    };

    const verifyCandidate = async (credentials: CandidateVerificationCredentials) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await authService.verifyCandidate(credentials);
            const token = response.token ||
                response.accessToken ||
                response.access_token ||
                response.data?.data?.accessToken ||
                response.data?.accessToken;

            if (!token) {
                console.error("Verification response structure:", response);
                throw new Error("No access token received from server");
            }

            let user = response.user;
            if (!user) {
                const decoded = parseJwt(token);
                if (decoded) {
                    user = {
                        id: decoded.sub || decoded.id,
                        email: decoded.email,
                        firstName: decoded.firstName || 'Candidate',
                        lastName: decoded.lastName || '',
                        role: decoded.role || 'CANDIDATE',
                        phoneNumber: decoded.phoneNumber || credentials.phoneNumber,
                    };
                }
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setState({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error: any) {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error.message || 'Verification failed',
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
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            setState({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
            setExamScheduleInfo(null);
        }
    };

    const checkExamSchedule = async () => {
        try {
            const examInfo = await authService.checkExamScheduled();
            setExamScheduleInfo(examInfo);
            localStorage.setItem('examScheduleInfo', JSON.stringify(examInfo));
        } catch (error) {
            console.error('Failed to check exam schedule:', error);
        }
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

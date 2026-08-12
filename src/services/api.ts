import axios, { AxiosResponse } from 'axios';
import i18n from '../i18n';

/**
 * Relative base URL by design: the session token lives in an httpOnly cookie
 * now, not localStorage, so every request needs to be same-origin for the
 * browser to attach it (cross-site cookies get blocked by Safari/Chrome's
 * third-party cookie restrictions). A same-origin proxy sits in front of the
 * real backend in every environment — Vite's dev proxy locally, a Vercel
 * rewrite in testing, whatever reverse-proxy fronts it in production — so
 * this code never needs to know the backend's actual origin.
 */
export const api = axios.create({
    baseURL: '',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        // Lets the backend distinguish real browser XHR/fetch calls from a
        // forged cross-site request — a CSRF attempt can't add this header
        // without triggering a CORS preflight our origin allowlist rejects.
        'X-Requested-With': 'XMLHttpRequest',
    },
});

/**
 * Parses a `Retry-After` header into whole seconds. Per HTTP spec it's either
 * a delay in seconds ("30") or an HTTP-date to wait until — handle both.
 */
export function parseRetryAfterSeconds(retryAfterHeader?: string | null): number | null {
    if (!retryAfterHeader) return null;

    const asSeconds = Number(retryAfterHeader);
    if (!Number.isNaN(asSeconds)) {
        return Math.max(0, Math.round(asSeconds));
    }

    const asDate = new Date(retryAfterHeader);
    if (!Number.isNaN(asDate.getTime())) {
        return Math.max(0, Math.round((asDate.getTime() - Date.now()) / 1000));
    }

    return null;
}

export function buildRateLimitMessage(retryAfterHeader?: string | null): string {
    const seconds = parseRetryAfterSeconds(retryAfterHeader);
    if (seconds && seconds > 0) {
        return i18n.t('common.rateLimited', { count: seconds });
    }
    return i18n.t('common.rateLimitedGeneric');
}

/**
 * Every response from this backend is wrapped once by its global
 * DataResponseInterceptor: `{ appName, path, statusCode, data, apiVersion,
 * message, error, userId }`. Unwrap that single envelope here so every call
 * site gets the real payload directly via `response.data` — no more ad-hoc
 * `response.data.data` (or deeper) chains guessed per call site.
 */
export function unwrapEnvelope(response: AxiosResponse): AxiosResponse {
    const body = response.data;
    if (body && typeof body === 'object' && 'data' in body) {
        response.data = body.data;
    }
    return response;
}

/**
 * Response interceptor — unwraps the backend's response envelope (see
 * `unwrapEnvelope`), and catches 401 Unauthorized responses (expired/invalid
 * JWT) and 429 Too Many Requests (rate limiting).
 * On 401: clears auth data from localStorage and redirects to the correct login page.
 * On 429: rewrites the error message to a clear, retry-aware one. Callers already
 * read `error.response?.data?.message` everywhere, so this alone surfaces the
 * clearer message through every existing toast/alert without per-page changes.
 */
api.interceptors.response.use(
    (response) => unwrapEnvelope(response),
    (error) => {
        if (error.response && error.response.status === 429) {
            const message = buildRateLimitMessage(error.response.headers?.['retry-after']);

            if (error.response.data && typeof error.response.data === 'object') {
                error.response.data.message = message;
            } else {
                error.response.data = { message };
            }
        }

        if (error.response && error.response.status === 401) {
            // Don't redirect if this is a login/auth request failure
            // (wrong credentials should just show error, not redirect), and
            // don't redirect on /auth/me either — a 401 there just means
            // "not logged in yet" on first visit, not "session expired".
            const requestUrl = error.config?.url || '';
            const isAuthRequest = requestUrl.includes('/auth/login') ||
                                 requestUrl.includes('/auth/signup') ||
                                 requestUrl.includes('/auth/verify') ||
                                 requestUrl.includes('/auth/me');

            if (isAuthRequest) {
                // Just pass the error through for login attempts
                return Promise.reject(error);
            }

            // For other 401 errors (expired/invalid session during
            // authenticated requests), clear session and redirect to the
            // correct login page. The token itself lives in an httpOnly
            // cookie we can't read — role comes from the non-sensitive user
            // profile blob already stored alongside it.
            let redirectPath = '/';

            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const role = (JSON.parse(storedUser)?.role as string | undefined)?.toLowerCase();
                    if (role === 'student' || role === 'candidate') {
                        redirectPath = '/candidate/auth';
                    } else if (role === 'center_admin' || role === 'center-admin') {
                        redirectPath = '/center/auth';
                    } else if (role === 'ministry') {
                        redirectPath = '/ministry/auth';
                    } else if (role === 'admin' || role === 'super_admin' || role === 'super-admin') {
                        redirectPath = '/admin/auth';
                    }
                } catch {
                    // malformed stored user — fall through to default redirect
                }
            }

            // Clear all auth data
            localStorage.removeItem('user');
            localStorage.removeItem('examScheduleInfo');

            // Reset language to English (LTR) on session expiry
            i18n.changeLanguage('en');
            document.documentElement.dir = 'ltr';
            document.documentElement.lang = 'en';

            // Hard redirect to login page (avoids React state issues)
            window.location.href = redirectPath;
        }

        return Promise.reject(error);
    }
);

export default api;


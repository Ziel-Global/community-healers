export const parseJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to parse JWT", e);
        return null;
    }
};

/**
 * Checks whether a JWT token is expired.
 * Uses a 30-second buffer so we don't attempt API calls with a nearly-expired token.
 * Returns true if the token is expired, malformed, or missing an exp claim.
 */
export const isTokenExpired = (token: string): boolean => {
    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) {
        return true; // Treat tokens without exp as expired
    }
    const currentTime = Math.floor(Date.now() / 1000);
    const bufferSeconds = 30;
    return decoded.exp < currentTime + bufferSeconds;
};

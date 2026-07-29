/**
 * Canonical role vocabulary — must match the backend's Roles enum
 * (ministry_backend/src/utils/enums.ts) exactly, since these values come
 * straight from the JWT `role` claim issued by that backend.
 */
export type UserRole = 'SUPER_ADMIN' | 'CANDIDATE' | 'CENTER_ADMIN' | 'MINISTRY';

export type PortalType = 'candidate' | 'center' | 'admin' | 'ministry' | 'exam';

/**
 * Which roles may access each portal. SUPER_ADMIN is included everywhere
 * because the backend's own login endpoints let a super admin authenticate
 * through any portal's login route (see `roleBasedLogin` and
 * `loginCandidateByPhone` in the backend), always keeping their real
 * SUPER_ADMIN role in the token rather than masquerading as the portal role.
 */
export const PORTAL_ALLOWED_ROLES: Record<PortalType, UserRole[]> = {
    candidate: ['CANDIDATE', 'SUPER_ADMIN'],
    exam: ['CANDIDATE', 'SUPER_ADMIN'],
    center: ['CENTER_ADMIN', 'SUPER_ADMIN'],
    ministry: ['MINISTRY', 'SUPER_ADMIN'],
    admin: ['SUPER_ADMIN'],
};

/** Where to send a logged-in user who hits a portal their role can't access. */
export const ROLE_HOME_PATH: Record<UserRole, string> = {
    CANDIDATE: '/candidate',
    CENTER_ADMIN: '/center',
    MINISTRY: '/ministry',
    SUPER_ADMIN: '/admin',
};

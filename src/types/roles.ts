/**
 * Canonical role vocabulary — must match the backend's Roles enum
 * (ministry_backend/src/utils/enums.ts) exactly, since these values come
 * straight from the JWT `role` claim issued by that backend.
 */
export type UserRole =
    | 'SUPER_ADMIN'
    | 'CANDIDATE'
    | 'CENTER_ADMIN'
    | 'MINISTRY'
    | 'COMMITTEE_MEMBER'
    | 'COMMITTEE_CHAIRMAN'
    | 'DIRECTOR_OPERATIONS';

export type PortalType = 'candidate' | 'center' | 'admin' | 'ministry' | 'exam' | 'committee' | 'committee-chairman' | 'director-operations';

/**
 * Which roles may access each portal. SUPER_ADMIN is included on most portals
 * because the backend's own login endpoints let a super admin authenticate
 * through any portal's login route (see `roleBasedLogin` and
 * `loginCandidateByPhone` in the backend), always keeping their real
 * SUPER_ADMIN role in the token rather than masquerading as the portal role.
 *
 * Director of Operations is the deliberate exception: it's a fully separate
 * role from Super Admin, not a Super-Admin-flavored portal. Super Admin only
 * ever gets read access to that pipeline (the /admin/applications view-only
 * pages), never the DO portal itself — matched on the backend by
 * StrictRolesGuard, which (unlike RolesGuard) does not let Super Admin bypass
 * this check either.
 */
export const PORTAL_ALLOWED_ROLES: Record<PortalType, UserRole[]> = {
    candidate: ['CANDIDATE', 'SUPER_ADMIN'],
    exam: ['CANDIDATE', 'SUPER_ADMIN'],
    center: ['CENTER_ADMIN', 'SUPER_ADMIN'],
    ministry: ['MINISTRY', 'SUPER_ADMIN'],
    admin: ['SUPER_ADMIN'],
    committee: ['COMMITTEE_MEMBER', 'SUPER_ADMIN'],
    'committee-chairman': ['COMMITTEE_CHAIRMAN'],
    'director-operations': ['DIRECTOR_OPERATIONS'],
};

/** Where to send a logged-in user who hits a portal their role can't access. */
export const ROLE_HOME_PATH: Record<UserRole, string> = {
    CANDIDATE: '/candidate',
    CENTER_ADMIN: '/center',
    MINISTRY: '/ministry',
    SUPER_ADMIN: '/admin',
    COMMITTEE_MEMBER: '/committee',
    COMMITTEE_CHAIRMAN: '/committee-chairman',
    DIRECTOR_OPERATIONS: '/director-operations',
};

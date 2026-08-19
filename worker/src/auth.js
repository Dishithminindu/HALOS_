/**
 * HALOS v2.0 - Cloudflare Worker: Authentication & Authorization Middleware
 * Role-Based Access Control (RBAC): ADMIN, RESEARCHER, DATA_COLLECTOR
 */

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  RESEARCHER: 'RESEARCHER',
  DATA_COLLECTOR: 'DATA_COLLECTOR'
};

/**
 * Validates request authorization headers.
 * In this research prototype, supports Bearer tokens or authenticated session headers.
 * AUTHENTICATION PLACEHOLDER: Connect with Cloudflare Access, Auth0, or Clerk for production.
 */
export function verifyAuth(request, env, requiredRoles = []) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  // If no auth required or dev bypass header present
  const devRole = request.headers.get('X-HALOS-Role');
  
  if (!token && !devRole) {
    // In prototype mode, default to authenticated researcher session if permitted by config
    return {
      authenticated: true,
      userId: 'usr_researcher_demo',
      role: USER_ROLES.RESEARCHER,
      isPlaceholder: true
    };
  }

  const activeRole = devRole || USER_ROLES.RESEARCHER;

  if (requiredRoles.length > 0 && !requiredRoles.includes(activeRole)) {
    return {
      authenticated: false,
      error: `Access denied. Requires one of roles: ${requiredRoles.join(', ')}`,
      code: 'FORBIDDEN'
    };
  }

  return {
    authenticated: true,
    userId: token ? `usr_${token.slice(0, 8)}` : 'usr_researcher_active',
    role: activeRole,
    isPlaceholder: !token
  };
}

/**
 * HALOS v2.0 - Role-Based Authentication & Session Controller
 * Manages researcher sessions, roles (ADMIN, RESEARCHER, DATA_COLLECTOR) and API tokens.
 * AUTHENTICATION PLACEHOLDER: Connect with Cloudflare Access, Auth0, or Clerk for production deployments.
 */

const HALOS_AUTH = (function() {
  const DEFAULT_ROLE = 'RESEARCHER';

  function getCurrentRole() {
    return localStorage.getItem('halos_user_role') || DEFAULT_ROLE;
  }

  function setRole(role) {
    localStorage.setItem('halos_user_role', role);
    updateUI();
  }

  function setAuthToken(token) {
    if (token) {
      localStorage.setItem('halos_auth_token', token);
    } else {
      localStorage.removeItem('halos_auth_token');
    }
  }

  function updateUI() {
    const role = getCurrentRole();
    const badgeEl = document.getElementById('user-role-badge');
    const nameEl = document.getElementById('user-role-name');

    if (badgeEl) badgeEl.textContent = role;
    if (nameEl) nameEl.textContent = role === 'ADMIN' ? 'Research Administrator' : role === 'RESEARCHER' ? 'Principal Investigator' : 'Data Collector';
  }

  return {
    init() {
      updateUI();
    },
    getRole: getCurrentRole,
    setRole,
    setAuthToken,
    updateUI,
    logout() {
      localStorage.removeItem('halos_auth_token');
      localStorage.removeItem('halos_user_role');
      HALOS_UTILS.clearActiveParticipant();
      window.location.href = '/login.html';
    }
  };
})();

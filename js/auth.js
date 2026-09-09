/**
 * HALOS v2.0 - Role-Based Authentication & Session Controller
 * Manages registered researcher authentication, roles (ADMIN, RESEARCHER, DATA_COLLECTOR)
 * and access control for restricted Research & Data sections.
 */

const HALOS_AUTH = (function() {
  function isAuthenticated() {
    const isAuth = localStorage.getItem('halos_is_authenticated') === 'true';
    const token = localStorage.getItem('halos_auth_token');
    return Boolean(isAuth && token);
  }

  function getCurrentRole() {
    if (!isAuthenticated()) return null;
    return localStorage.getItem('halos_user_role') || 'RESEARCHER';
  }

  function getCurrentUser() {
    if (!isAuthenticated()) {
      return {
        isAuthenticated: false,
        role: null,
        name: 'Unregistered Guest',
        email: null,
        token: null
      };
    }
    return {
      isAuthenticated: true,
      role: localStorage.getItem('halos_user_role') || 'RESEARCHER',
      name: localStorage.getItem('halos_user_name') || 'Authorized Investigator',
      email: localStorage.getItem('halos_user_email') || 'researcher@uop.ac.lk',
      token: localStorage.getItem('halos_auth_token')
    };
  }

  function login({ role = 'RESEARCHER', token, name, email }) {
    if (!token) {
      token = `HALOS-${role}-${Date.now().toString(36).toUpperCase()}`;
    }
    localStorage.setItem('halos_is_authenticated', 'true');
    localStorage.setItem('halos_user_role', role);
    localStorage.setItem('halos_auth_token', token);
    if (name) localStorage.setItem('halos_user_name', name);
    if (email) localStorage.setItem('halos_user_email', email);

    updateUI();
    window.dispatchEvent(new CustomEvent('halos:authChanged', { detail: getCurrentUser() }));
  }

  function logout() {
    localStorage.removeItem('halos_is_authenticated');
    localStorage.removeItem('halos_auth_token');
    localStorage.removeItem('halos_user_role');
    localStorage.removeItem('halos_user_name');
    localStorage.removeItem('halos_user_email');
    HALOS_UTILS.clearActiveParticipant();
    window.location.href = '/login.html';
  }

  function requireAuth(allowedRoles = ['RESEARCHER', 'ADMIN']) {
    if (!isAuthenticated()) {
      const currentPath = window.location.pathname + window.location.search;
      sessionStorage.setItem('halos_auth_redirect', currentPath);
      window.location.href = `/login.html?redirect=${encodeURIComponent(currentPath)}&reason=auth_required`;
      return false;
    }

    const role = getCurrentRole();
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      HALOS_UTILS.showToast(`Access Restricted: Role '${role}' is not authorized for this section.`, 'error');
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 1200);
      return false;
    }

    return true;
  }

  function updateUI() {
    const user = getCurrentUser();
    const badgeEl = document.getElementById('user-role-badge');
    const nameEl = document.getElementById('user-role-name');
    const sidebarFooter = document.querySelector('.sidebar-footer');

    if (badgeEl) {
      badgeEl.textContent = user.isAuthenticated ? user.role : 'GUEST';
    }
    if (nameEl) {
      nameEl.textContent = user.isAuthenticated ? user.name : 'Unregistered Guest';
    }

    if (sidebarFooter) {
      let authActionBtn = document.getElementById('sidebar-auth-action-btn');
      if (!authActionBtn) {
        authActionBtn = document.createElement('div');
        authActionBtn.id = 'sidebar-auth-action-btn';
        authActionBtn.style.cssText = 'margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; font-size: 11.5px;';
        sidebarFooter.appendChild(authActionBtn);
      }

      if (user.isAuthenticated) {
        authActionBtn.innerHTML = `
          <span style="color: var(--risk-lower); display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--risk-lower); display: inline-block;"></span>
            Authorized
          </span>
          <button id="btn-sidebar-logout" class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 11px; line-height: 1.4; border-radius: 4px; color: var(--text-muted);">
            Sign Out
          </button>
        `;
        const logoutBtn = document.getElementById('btn-sidebar-logout');
        if (logoutBtn) {
          logoutBtn.onclick = (e) => {
            e.preventDefault();
            logout();
          };
        }
      } else {
        authActionBtn.innerHTML = `
          <span style="color: #d97706; display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #d97706; display: inline-block;"></span>
            Guest Mode
          </span>
          <a href="/login.html" class="btn btn-primary btn-sm" style="padding: 2px 10px; font-size: 11px; line-height: 1.4; border-radius: 4px; text-decoration: none;">
            Sign In →
          </a>
        `;
      }
    }

    // Update Research & Data links in sidebar
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      const isResearchLink = href.includes('patients.html') || href.includes('research-dashboard.html');

      if (isResearchLink) {
        let authBadge = link.querySelector('.nav-auth-restricted-badge');
        if (!user.isAuthenticated) {
          if (!authBadge) {
            authBadge = document.createElement('span');
            authBadge.className = 'nav-auth-restricted-badge';
            authBadge.style.cssText = 'margin-left: auto; font-size: 9.5px; font-weight: 700; text-transform: uppercase; background: #fee2e2; color: #b91c1c; padding: 2px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px;';
            authBadge.innerHTML = '🔒 Authorized';
            link.appendChild(authBadge);
          }
        } else {
          if (authBadge) authBadge.remove();
        }
      }
    });
  }

  return {
    init() {
      updateUI();
    },
    isAuthenticated,
    getRole: getCurrentRole,
    getUser: getCurrentUser,
    login,
    logout,
    requireAuth,
    updateUI
  };
})();

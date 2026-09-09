/**
 * HALOS v2.0 - Core Application Shell Controller
 * Manages loading transitions, responsive sidebar, active route highlighting, and participant status.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Auth State
  HALOS_AUTH.init();

  // 2. Splash Screen Transition
  const splash = document.getElementById('splash-screen');
  if (splash) {
    setTimeout(() => {
      splash.classList.add('hidden');
    }, 450);
  }

  // 3. Highlight Active Navigation Item
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/index.html';
  document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || (currentPath === '' && href === '/index.html') || (currentPath.endsWith(href) && href !== '/index.html'))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 4. Mobile Navigation Drawer Toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('app-sidebar');
  let backdrop = document.querySelector('.sidebar-backdrop');

  if (!backdrop && sidebar) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
  }

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      if (backdrop) backdrop.classList.toggle('active');
    });
  }

  if (backdrop && sidebar) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      backdrop.classList.remove('active');
    });
  }

  // 5. Update Active Participant Header Indicator & Navigation Status
  function updateParticipantIndicator() {
    const activeParticipant = HALOS_UTILS.getActiveParticipant();
    const hasConsent = HALOS_UTILS.hasVerifiedConsent(activeParticipant);
    const indicatorEl = document.getElementById('active-participant-indicator');
    const studyIdEl = document.getElementById('active-study-id-text');
    const emptyNotice = document.getElementById('no-participant-notice');

    if (indicatorEl && studyIdEl) {
      if (activeParticipant && activeParticipant.study_id) {
        indicatorEl.style.display = 'inline-flex';
        studyIdEl.textContent = activeParticipant.study_id;
        if (emptyNotice) emptyNotice.style.display = 'none';
      } else {
        indicatorEl.style.display = 'none';
        if (emptyNotice) {
          emptyNotice.style.display = 'inline-flex';
          emptyNotice.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;color:#d97706;font-size:12px;font-weight:600;"><svg style="width:14px;height:14px;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> Preview Mode (No Consent)</span>`;
        }
      }
    }

    // Update sidebar navigation items to indicate Preview status if unconsented
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      const isSubmittableStep = href.includes('dietary-recall.html') || href.includes('monthly-questionnaire.html') || href.includes('results.html');
      
      let badge = link.querySelector('.nav-lock-badge');
      if (isSubmittableStep) {
        if (!hasConsent) {
          if (!badge) {
            badge = document.createElement('span');
            badge.className = 'nav-lock-badge';
            badge.style.cssText = 'margin-left: auto; font-size: 10px; font-weight: 700; text-transform: uppercase; background: rgba(245, 158, 11, 0.2); color: #d97706; padding: 2px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px;';
            badge.innerHTML = '🔒 Preview';
            link.appendChild(badge);
          }
        } else if (badge) {
          badge.remove();
        }
      }
    });

    // Intercept clicks on Research & Data links if unauthenticated
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      const isResearchLink = href.includes('patients.html') || href.includes('research-dashboard.html');

      if (isResearchLink) {
        link.addEventListener('click', (e) => {
          if (!HALOS_AUTH.isAuthenticated()) {
            e.preventDefault();
            HALOS_UTILS.showToast('🔒 Restricted: Registered researcher login required to access Research & Data.', 'warning');
            setTimeout(() => {
              window.location.href = `/login.html?redirect=${encodeURIComponent(href)}&reason=auth_required`;
            }, 300);
          }
        });
      }
    });
  }

  updateParticipantIndicator();
  window.addEventListener('halos:participantChanged', updateParticipantIndicator);
  window.addEventListener('halos:authChanged', () => {
    HALOS_AUTH.updateUI();
    updateParticipantIndicator();
  });

  // Global shortcut to clear active participant
  const clearBtn = document.getElementById('btn-clear-participant');
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      HALOS_UTILS.clearActiveParticipant();
      HALOS_UTILS.showToast('Participant session cleared.', 'info');
      window.location.href = '/assessment.html';
    });
  }
});

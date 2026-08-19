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

  // 5. Update Active Participant Header Indicator
  function updateParticipantIndicator() {
    const activeParticipant = HALOS_UTILS.getActiveParticipant();
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
        if (emptyNotice) emptyNotice.style.display = 'block';
      }
    }
  }

  updateParticipantIndicator();
  window.addEventListener('halos:participantChanged', updateParticipantIndicator);

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

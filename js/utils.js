/**
 * HALOS v2.0 - Scientific Utilities & UI Helpers
 * Standardized conversions, toast notifications, and participant session management.
 */

const HALOS_UTILS = (function() {
  const SODIUM_TO_SALT_FACTOR = 2.5;
  const DEFAULT_REFERENCE_SALT_G_DAY = 5.0;

  return {
    // -------------------------------------------------------------
    // SCIENTIFIC CONVERSIONS
    // -------------------------------------------------------------
    sodiumToSalt(sodiumMg) {
      if (sodiumMg === null || sodiumMg === undefined || isNaN(sodiumMg)) return 0;
      return Number(((Number(sodiumMg) * SODIUM_TO_SALT_FACTOR) / 1000.0).toFixed(2));
    },

    saltToSodium(saltG) {
      if (saltG === null || saltG === undefined || isNaN(saltG)) return 0;
      return Math.round((Number(saltG) * 1000.0) / SODIUM_TO_SALT_FACTOR);
    },

    computeReferencePercentage(saltG, refG = DEFAULT_REFERENCE_SALT_G_DAY) {
      if (!saltG || refG <= 0) return 0;
      return Number(((Number(saltG) / refG) * 100.0).toFixed(1));
    },

    determineRiskCategory(saltG) {
      const s = Number(saltG);
      if (s < 5.0) return 'LOWER';
      if (s <= 7.0) return 'MODERATE';
      return 'HIGHER';
    },

    computeBmi(weightKg, heightCm) {
      if (!weightKg || !heightCm || heightCm <= 0) return null;
      const heightM = heightCm / 100.0;
      return Number((weightKg / (heightM * heightM)).toFixed(2));
    },

    // -------------------------------------------------------------
    // PARTICIPANT SESSION CACHE
    // -------------------------------------------------------------
    getActiveParticipant() {
      try {
        const raw = sessionStorage.getItem('halos_active_participant');
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    },

    async getOrFetchActiveParticipant() {
      // Do not auto-assign external participants silently. Only return explicit active session.
      return this.getActiveParticipant();
    },

    hasVerifiedConsent(participant) {
      const p = participant || this.getActiveParticipant();
      if (!p || !p.id) return false;
      if (p.ethical_consent_verified === true || p.consent_agreed === true) return true;
      if (p.screening && (p.screening.consent_obtained === true || p.screening.consent_agreed === true)) return true;
      return false;
    },

    setActiveParticipant(participant) {
      try {
        if (participant) {
          // Flag consent if valid screening exists
          if (participant.consent_agreed || (participant.screening && participant.screening.consent_obtained)) {
            participant.ethical_consent_verified = true;
          }
        }
        sessionStorage.setItem('halos_active_participant', JSON.stringify(participant));
        // Dispatch custom event for navbar updates
        window.dispatchEvent(new CustomEvent('halos:participantChanged', { detail: participant }));
      } catch (e) {
        console.error('Failed to save active participant session', e);
      }
    },

    clearActiveParticipant() {
      sessionStorage.removeItem('halos_active_participant');
      window.dispatchEvent(new CustomEvent('halos:participantChanged', { detail: null }));
    },

    // -------------------------------------------------------------
    // PAGE SEQUENCING & ETHICAL ACCESS ENFORCEMENT
    // -------------------------------------------------------------
    enforcePageSequencing(currentStep, options = { allowProviderBypass: true }) {
      const participant = this.getActiveParticipant();
      const hasConsent = this.hasVerifiedConsent(participant);
      const isAuthResearcher = typeof HALOS_AUTH !== 'undefined' && HALOS_AUTH.isAuthenticated && HALOS_AUTH.isAuthenticated();

      // If authorized provider/researcher is in provider mode, permit access
      if (options.allowProviderBypass && isAuthResearcher) {
        return true;
      }

      // Step 1 is always accessible
      if (currentStep <= 1) return true;

      // Steps 2, 3, 4 strictly require Step 1 completion
      if (!hasConsent || !participant || !participant.id) {
        this.showToast('⚠️ Page Sequence Locked: Step 1 (Participant Registration & Informed Consent) must be completed before accessing next steps.', 'warning');
        setTimeout(() => {
          window.location.href = `/assessment.html?reason=consent_required&blocked_step=${currentStep}`;
        }, 400);
        return false;
      }

      return true;
    },

    // -------------------------------------------------------------
    // TOAST NOTIFICATIONS
    // -------------------------------------------------------------
    showToast(message, type = 'info', duration = 3500) {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.innerHTML = `
        <span class="toast-message">${this.escapeHtml(message)}</span>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 250);
      }, duration);
    },

    // -------------------------------------------------------------
    // LOADING OVERLAY
    // -------------------------------------------------------------
    showLoading(message = 'Processing request...') {
      if (this._loadingTimeout) {
        clearTimeout(this._loadingTimeout);
        this._loadingTimeout = null;
      }
      let overlay = document.getElementById('global-loading-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'global-loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
          <div class="loading-card">
            <div class="spinner-ring"></div>
            <p id="loading-overlay-text" style="font-weight: 600; color: var(--text-main); font-size: 14px;">${this.escapeHtml(message)}</p>
          </div>
        `;
        document.body.appendChild(overlay);
      } else {
        const textEl = document.getElementById('loading-overlay-text');
        if (textEl) textEl.textContent = message;
      }
      overlay.classList.add('active');

      // Fail-safe: Auto-hide after 5 seconds to prevent permanent UI lock in case of network timeouts
      this._loadingTimeout = setTimeout(() => {
        this.hideLoading();
      }, 5000);
    },

    hideLoading() {
      if (this._loadingTimeout) {
        clearTimeout(this._loadingTimeout);
        this._loadingTimeout = null;
      }
      const overlay = document.getElementById('global-loading-overlay');
      if (overlay) {
        overlay.classList.remove('active');
      }
    },

    // -------------------------------------------------------------
    // FORMATTING & SECURITY
    // -------------------------------------------------------------
    formatDate(isoString) {
      if (!isoString) return '—';
      try {
        const d = new Date(isoString);
        return d.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return isoString;
      }
    },

    escapeHtml(str) {
      if (typeof str !== 'string') return String(str || '');
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  };
})();

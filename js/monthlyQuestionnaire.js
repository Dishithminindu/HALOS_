/**
 * HALOS v2.0 - SIAT Monthly Questionnaire Form Controller
 * Trilingual Rendering & Ethical Protocol Support
 */

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('siat-form') || document.getElementById('monthly-questionnaire-form');
  const participantDisplay = document.getElementById('active-participant-display') || document.getElementById('monthly-study-id');
  const providerToggle = document.getElementById('provider-mode-toggle') || document.getElementById('toggle-provider-mode');
  const providerControls = document.getElementById('provider-controls') || document.getElementById('provider-model-panel');
  const providerSelect = document.getElementById('provider-participant-select') || document.getElementById('provider-select-participant');
  const providerSyncStatus = document.getElementById('provider-sync-status');
  const btnLoadProfile = document.getElementById('btn-load-profile') || document.getElementById('btn-provider-quick-baseline');
  const btnReset = document.getElementById('btn-reset-form') || document.getElementById('btn-provider-clear');
  const submitBtn = document.getElementById('btn-submit-siat') || document.getElementById('btn-save-monthly');

  const siat = window.HALOS_SIAT;
  if (!siat) {
    console.error('HALOS_SIAT definition not loaded.');
    return;
  }

  const i18n = window.HALOS_I18N;
  const t = (k, fallback) => (i18n ? i18n.t(k) : fallback);

  // Check active participant & ethical consent
  let participant = HALOS_UTILS.getActiveParticipant();
  const hasConsent = participant && participant.ethical_consent_verified === true;
  let isProviderMode = false;

  function updateStudyIdDisplay() {
    if (!participantDisplay) return;
    if (participant && participant.study_id) {
      participantDisplay.innerHTML = `
        <span class="participant-indicator" title="Active Study ID">
          <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background-color:#16a34a;"></span>
          ${participant.study_id}
          ${hasConsent ? ` (${t('lbl_consent_granted', 'Consent Granted')})` : ` (${t('lbl_pending_consent', 'Pending Step 1')})`}
        </span>
      `;
    } else {
      participantDisplay.innerHTML = `
        <span class="participant-indicator" style="background:#fef2f2; color:#b91c1c; border-color:#fecaca;" title="${t('lbl_no_active_participant', 'No active participant selected')}">
          ⚠️ ${t('lbl_unassigned_participant', 'No Participant - Step 1 Required')}
        </span>
      `;
    }

    if (providerControls) {
      providerControls.style.display = isProviderMode ? 'flex' : 'none';
    }
  }

  updateStudyIdDisplay();

  // Helper to collect current answers so they are preserved across language switches
  function collectCurrentFormAnswers() {
    if (!form) return {};
    const answers = {};

    siat.sectionB.forEach((q) => {
      if (q.type === 'likert' || q.type === 'radio') {
        const chk = form.querySelector(`input[name="${q.id}"]:checked`);
        if (chk) answers[q.id] = chk.value;
      } else if (q.type === 'select') {
        const sel = form.querySelector(`select[name="${q.id}"]`);
        if (sel) answers[q.id] = sel.value;
      } else if (q.type === 'number') {
        const num = form.querySelector(`input[name="${q.id}"]`);
        if (num) answers[q.id] = num.value;
      }
    });

    siat.sectionC.forEach((group) => {
      group.items.forEach((item) => {
        const freqChk = form.querySelector(`input[name="${item.key}_freq"]:checked`);
        const portionChk = form.querySelector(`input[name="${item.key}_portion"]:checked`);
        if (freqChk) answers[`${item.key}_freq`] = freqChk.value;
        if (portionChk) answers[`${item.key}_portion`] = portionChk.value;
      });
    });

    siat.sectionD.forEach((q) => {
      if (q.type === 'radio' || q.type === 'likert') {
        const chk = form.querySelector(`input[name="${q.id}"]:checked`);
        if (chk) answers[q.id] = chk.value;
      } else if (q.type === 'multicheck') {
        const checkedBoxes = Array.from(form.querySelectorAll(`input[name="${q.id}"]:checked`));
        if (checkedBoxes.length > 0) {
          answers[q.id] = checkedBoxes.map(cb => cb.value);
        }
      }
    });

    return answers;
  }

  // Master Questionnaire Renderer (Trilingual)
  function renderSiatQuestionnaire() {
    // 1. RENDER SECTION B
    const sectionBContainer = document.getElementById('siat-section-b-content');
    if (sectionBContainer) {
      sectionBContainer.innerHTML = siat.sectionB.map((q) => {
        if (q.type === 'likert') {
          return `
            <div class="frequency-group-card" style="margin-bottom: 16px;">
              <div class="frequency-item-title">${q.title}</div>
              <div class="frequency-scale-row" style="margin-top: 10px;">
                ${q.options.map((opt, idx) => {
                  const optVal = typeof opt === 'object' ? opt.value : opt;
                  const optLabel = typeof opt === 'object' ? opt.label : opt;
                  return `
                    <label class="freq-option-label" style="min-width: 90px;">
                      <input type="radio" name="${q.id}" value="${optVal}" ${idx === 0 ? 'checked' : ''} />
                      <span class="freq-option-text" style="font-size: 12px; margin-top: 2px;">${optLabel}</span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        } else if (q.type === 'select') {
          return `
            <div class="frequency-group-card" style="margin-bottom: 16px;">
              <div class="frequency-item-title">${q.title}</div>
              <div style="margin-top: 10px; max-width: 480px;">
                <select name="${q.id}" class="form-control" style="background-color: var(--bg-surface); padding: 10px;">
                  ${q.options.map((opt) => {
                    const optVal = typeof opt === 'object' ? opt.value : opt;
                    const optLabel = typeof opt === 'object' ? opt.label : opt;
                    return `<option value="${optVal}">${optLabel}</option>`;
                  }).join('')}
                </select>
              </div>
            </div>
          `;
        } else if (q.type === 'number') {
          return `
            <div class="frequency-group-card" style="margin-bottom: 16px;">
              <div class="frequency-item-title">${q.title}</div>
              <div style="margin-top: 10px; display: flex; align-items: center; gap: 12px;">
                <input type="number" name="${q.id}" min="${q.min}" max="${q.max}" value="${q.default}" class="form-control" style="max-width: 140px; font-weight: 600;" />
                <span style="font-size: 13px; color: var(--text-muted); font-weight: 500;">${q.unit}</span>
              </div>
            </div>
          `;
        }
        return '';
      }).join('');
    }

    // 2. RENDER SECTION C
    const sectionCContainer = document.getElementById('siat-section-c-content');
    if (sectionCContainer) {
      const highSodiumLabel = t('badge_high_sodium', '⚠️ High Sodium Contributor');
      const stdPortionLabel = t('lbl_std_portion', 'Std. Portion');
      const freqLabel = t('hdr_freq_consumption', 'Frequency of Consumption:');
      const portionLabel = t('hdr_portion_size', 'Portion Size When Eaten:');
      const optSmall = t('opt_portion_small', 'Small (< std)');
      const optMedium = t('opt_portion_medium', 'Medium (std)');
      const optLarge = t('opt_portion_large', 'Large (> std)');

      sectionCContainer.innerHTML = siat.sectionC.map((group) => `
        <div style="margin-bottom: 28px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; border-bottom: 2px solid var(--border-subtle); padding-bottom: 8px;">
            <span style="background: var(--primary); color: #ffffff; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;">
              ${group.groupId}
            </span>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">
              ${group.groupTitle}
            </h3>
          </div>
          ${group.items.map((item) => `
            <div class="frequency-group-card" id="card-${item.key}" style="margin-bottom: 14px; padding: 14px 16px; transition: border-color 0.2s, background 0.2s;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px;">
                <div class="frequency-item-title" style="font-size: 14px; font-weight: 600;">
                  ${item.name}
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span id="alert-${item.key}" style="display: none; font-size: 11px; font-weight: 700; color: #dc2626; background: #fee2e2; padding: 2px 8px; border-radius: 4px;">
                    ${highSodiumLabel}
                  </span>
                  <span style="font-size: 12px; color: var(--text-muted); background: var(--bg-surface-subtle); padding: 2px 8px; border-radius: 4px;">
                    ${stdPortionLabel}: <strong>${item.stdPortion}</strong>
                  </span>
                </div>
              </div>

              <!-- Frequency Scale (0 to 7) -->
              <div style="margin-top: 10px;">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 600;">
                  ${freqLabel}
                </span>
                <div class="frequency-scale-row" style="margin-top: 6px;">
                  ${siat.freqScale.map((scale) => `
                    <label class="freq-option-label">
                      <input type="radio" name="${item.key}_freq" value="${scale.value}" ${scale.value === 0 ? 'checked' : ''} data-item-key="${item.key}" />
                      <span class="freq-option-num">${scale.value}</span>
                      <span class="freq-option-text">${scale.label}</span>
                    </label>
                  `).join('')}
                </div>
              </div>

              <!-- Portion Size selector -->
              <div style="margin-top: 10px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 600;">
                  ${portionLabel}
                </span>
                <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer;">
                  <input type="radio" name="${item.key}_portion" value="Small" /> ${optSmall}
                </label>
                <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer;">
                  <input type="radio" name="${item.key}_portion" value="Medium" checked /> ${optMedium}
                </label>
                <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer;">
                  <input type="radio" name="${item.key}_portion" value="Large" /> ${optLarge}
                </label>
              </div>
            </div>
          `).join('')}
        </div>
      `).join('');

      // Attach real-time high-salt warning highlights
      sectionCContainer.querySelectorAll('input[type="radio"][data-item-key]').forEach(input => {
        input.addEventListener('change', () => {
          const itemKey = input.getAttribute('data-item-key');
          const freqVal = parseInt(input.value, 10);
          const alertBadge = document.getElementById(`alert-${itemKey}`);
          const card = document.getElementById(`card-${itemKey}`);

          if (freqVal >= 4) { // 2-4/week or higher
            if (alertBadge) alertBadge.style.display = 'inline-block';
            if (card) card.style.borderColor = '#fca5a5';
          } else {
            if (alertBadge) alertBadge.style.display = 'none';
            if (card) card.style.borderColor = 'var(--border-subtle)';
          }
        });
      });
    }

    // 3. RENDER SECTION D
    const sectionDContainer = document.getElementById('siat-section-d-content');
    if (sectionDContainer) {
      sectionDContainer.innerHTML = siat.sectionD.map((q) => {
        if (q.type === 'radio' || q.type === 'likert') {
          return `
            <div class="frequency-group-card" style="margin-bottom: 16px;">
              <div class="frequency-item-title">${q.title}</div>
              <div class="frequency-scale-row" style="margin-top: 10px;">
                ${q.options.map((opt, idx) => {
                  const optVal = typeof opt === 'object' ? opt.value : opt;
                  const optLabel = typeof opt === 'object' ? opt.label : opt;
                  return `
                    <label class="freq-option-label" style="min-width: 100px;">
                      <input type="radio" name="${q.id}" value="${optVal}" ${idx === 0 ? 'checked' : ''} />
                      <span class="freq-option-text" style="font-size: 12px; margin-top: 2px;">${optLabel}</span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        } else if (q.type === 'multicheck') {
          return `
            <div class="frequency-group-card" style="margin-bottom: 16px;">
              <div class="frequency-item-title">${q.title}</div>
              <div style="margin-top: 10px; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 8px;">
                ${q.options.map((opt) => {
                  const optVal = typeof opt === 'object' ? opt.value : opt;
                  const optLabel = typeof opt === 'object' ? opt.label : opt;
                  return `
                    <label style="display: flex; align-items: flex-start; gap: 8px; font-size: 13px; padding: 6px 10px; background: var(--bg-surface-subtle); border-radius: 6px; cursor: pointer;">
                      <input type="checkbox" name="${q.id}" value="${optVal}" style="margin-top: 2px;" />
                      <span>${optLabel}</span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }
        return '';
      }).join('');
    }
  }

  // Initial render
  renderSiatQuestionnaire();

  // Populate answers helper
  function populateFormAnswers(answers) {
    if (!answers || typeof answers !== 'object') return;

    for (const [key, value] of Object.entries(answers)) {
      if (Array.isArray(value)) {
        const checkboxes = document.querySelectorAll(`input[name="${key}"]`);
        checkboxes.forEach((cb) => {
          cb.checked = value.includes(cb.value);
        });
      } else {
        const radio = document.querySelector(`input[name="${key}"][value="${value}"]`);
        if (radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change'));
        } else {
          const field = document.querySelector(`[name="${key}"]`);
          if (field) field.value = value;
        }
      }
    }
  }

  // Re-render when language changes without losing user input
  function handleLanguageChange() {
    const currentAnswers = collectCurrentFormAnswers();
    renderSiatQuestionnaire();
    populateFormAnswers(currentAnswers);
    updateStudyIdDisplay();
    updateSubmissionButtonState();
  }
  window.addEventListener('halos:languageChanged', handleLanguageChange);
  document.addEventListener('halos:languageChanged', handleLanguageChange);

  // 4. PROVIDER MODEL & D1 SYNCHRONIZATION
  async function loadCohortParticipants() {
    if (!providerSelect) return;

    try {
      const res = await HALOS_API.getParticipants();
      if (res.ok && Array.isArray(res.data) && res.data.length > 0) {
        providerSelect.innerHTML = '<option value="">-- Select Active Cohort Participant --</option>' +
          res.data.map(p => `
            <option value="${p.id}" data-study-id="${p.study_id || ''}" ${participant && participant.id === p.id ? 'selected' : ''}>
              ${p.study_id || p.id} (Age: ${p.age || '?'}, ${p.sex || '?'}) ${p.questionnaire_count ? '• Has SIAT' : ''}
            </option>
          `).join('');
      } else {
        providerSelect.innerHTML = `
          <option value="">-- Select Active Cohort Participant --</option>
          ${participant ? `<option value="${participant.id}" selected>${participant.study_id || participant.id} (Active Session)</option>` : ''}
          <option value="HALOS-UOP-001">HALOS-UOP-001 (Peradeniya Outpatient Pilot)</option>
          <option value="HALOS-UOP-002">HALOS-UOP-002 (Kandy Hypertension Clinic)</option>
          <option value="HALOS-UOP-003">HALOS-UOP-003 (Community Cohort)</option>
        `;
      }
    } catch {
      if (participant) {
        providerSelect.innerHTML = `<option value="${participant.id}" selected>${participant.study_id || participant.id} (Active Session)</option>`;
      }
    }
  }

  async function syncParticipantResponsesFromD1(participantId) {
    if (!participantId) return;

    if (providerSyncStatus) {
      providerSyncStatus.innerHTML = '<span style="color: #2563eb;">🔄 Fetching D1 responses...</span>';
    }

    try {
      const existingRes = await HALOS_API.getMonthlyQuestionnaire(participantId);

      if (existingRes.ok && existingRes.data && existingRes.data.answers) {
        populateFormAnswers(existingRes.data.answers);
        if (providerSyncStatus) {
          providerSyncStatus.innerHTML = '<span style="color: #16a34a;">✓ D1 Responses Synchronized</span>';
        }
        HALOS_UTILS.showToast(`Loaded saved SIAT records from D1 for ${participantId}.`, 'success');
      } else {
        if (providerSyncStatus) {
          providerSyncStatus.innerHTML = '<span style="color: #64748b;">Ready (No prior D1 record)</span>';
        }
      }
    } catch (err) {
      console.warn('D1 response check skipped:', err);
      if (providerSyncStatus) {
        providerSyncStatus.innerHTML = '<span style="color: #64748b;">Ready for input</span>';
      }
    }
  }

  // Initialize Provider Dropdown and Sync
  await loadCohortParticipants();

  if (participant && participant.id) {
    syncParticipantResponsesFromD1(participant.id);
  }

  // Handle participant dropdown change in Provider Model
  if (providerSelect) {
    providerSelect.addEventListener('change', async () => {
      const selectedId = providerSelect.value;
      if (!selectedId) return;

      const selectedOpt = providerSelect.options[providerSelect.selectedIndex];
      const studyId = selectedOpt.getAttribute('data-study-id') || selectedId;

      participant = {
        id: selectedId,
        study_id: studyId,
        ethical_consent_verified: true,
        age: 45,
        sex: 'Female'
      };
      HALOS_UTILS.setActiveParticipant(participant);
      updateStudyIdDisplay();
      updateSubmissionButtonState();

      await syncParticipantResponsesFromD1(selectedId);
    });
  }

  // Fast Clinical Preset
  if (btnLoadProfile) {
    btnLoadProfile.addEventListener('click', () => {
      const b1 = document.querySelector('input[name="B1"][value="Often"]');
      if (b1) b1.checked = true;
      const b2 = document.querySelector('input[name="B2"][value="Often"]');
      if (b2) b2.checked = true;
      const b3 = document.querySelector('select[name="B3"]');
      if (b3) b3.value = 'Table salt / Fine vacuum-dried salt (kudu lunu)';
      const b4 = document.querySelector('input[name="B4"][value="Sometimes"]');
      if (b4) b4.checked = true;
      const b5 = document.querySelector('input[name="B5"][value="Often"]');
      if (b5) b5.checked = true;
      const b6 = document.querySelector('input[name="B6"]');
      if (b6) b6.value = 5;
      const b7 = document.querySelector('input[name="B7"]');
      if (b7) b7.value = 8;

      const presets = {
        'C1_1_freq': '2', // Dried fish
        'C1_3_freq': '1', // Maldive fish
        'C1_4_freq': '2', // Canned fish
        'C3_1_freq': '2', // Lime pickle
        'C3_2_freq': '3', // Lunu miris
        'C4_1_freq': '3', // Papadam
        'C5_3_freq': '6', // Bakery bread
        'C6_1_freq': '1', // Soya sauce
        'C7_1_freq': '1'  // Instant noodles
      };

      for (const [k, v] of Object.entries(presets)) {
        const r = document.querySelector(`input[name="${k}"][value="${v}"]`);
        if (r) {
          r.checked = true;
          r.dispatchEvent(new Event('change'));
        }
      }

      HALOS_UTILS.showToast('Applied standard clinical dietary baseline profile.', 'info');
    });
  }

  // Reset Form Button
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (form) form.reset();
      document.querySelectorAll('input[type="radio"][value="0"]').forEach(r => {
        r.checked = true;
        r.dispatchEvent(new Event('change'));
      });
      document.querySelectorAll('input[value="Medium"]').forEach(r => {
        r.checked = true;
      });
      HALOS_UTILS.showToast('Questionnaire inputs reset.', 'info');
    });
  }

  // Provider Mode Toggle Change
  if (providerToggle) {
    providerToggle.addEventListener('change', () => {
      isProviderMode = providerToggle.checked;
      updateStudyIdDisplay();
      updateSubmissionButtonState();
    });
  }

  function updateSubmissionButtonState() {
    if (!submitBtn) return;

    if (isProviderMode) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
      submitBtn.title = 'Provider Administration Mode';
      submitBtn.innerHTML = `${t('btn_save_siat_provider', 'Save Provider Assessment & Predict Sodium Intake')} &rarr;`;
    } else if (!hasConsent) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
      submitBtn.style.cursor = 'not-allowed';
      submitBtn.title = 'Ethical Protocol: Step 1 Informed Consent required before responses can be submitted.';
      submitBtn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;"><svg style="width:16px;height:16px;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> ${t('btn_submission_locked', 'Submission Locked (Requires Step 1 Consent)')}</span>`;
    } else {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
      submitBtn.title = '';
      submitBtn.innerHTML = `${t('btn_save_siat', 'Save SIAT Questionnaire & Compute Salt Prediction')} &rarr;`;
    }
  }

  updateSubmissionButtonState();

  // 5. FORM SUBMISSION HANDLER
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let targetParticipant = participant;

      if (!targetParticipant || !targetParticipant.id) {
        if (providerSelect && providerSelect.value) {
          targetParticipant = {
            id: providerSelect.value,
            study_id: providerSelect.options[providerSelect.selectedIndex].text.split(' ')[0] || providerSelect.value,
            ethical_consent_verified: true
          };
          HALOS_UTILS.setActiveParticipant(targetParticipant);
        } else if (isProviderMode) {
          targetParticipant = {
            id: `clinical_${Date.now()}`,
            study_id: 'HALOS-CLINICAL-01',
            age: 45,
            sex: 'Female',
            bmi: 23.5,
            ethical_consent_verified: true,
            provider_mode: true
          };
          HALOS_UTILS.setActiveParticipant(targetParticipant);
        } else {
          HALOS_UTILS.showToast(t('msg_consent_required', '⚠️ Ethical Protocol: Please complete Step 1 Informed Consent before submitting.'), 'warning');
          return;
        }
      }

      const answers = {};

      // Collect Section B
      siat.sectionB.forEach((q) => {
        if (q.type === 'likert' || q.type === 'radio') {
          const chk = form.querySelector(`input[name="${q.id}"]:checked`);
          answers[q.id] = chk ? chk.value : (q.options[0]?.value || q.options[0]);
        } else if (q.type === 'select') {
          const sel = form.querySelector(`select[name="${q.id}"]`);
          answers[q.id] = sel ? sel.value : (q.options[0]?.value || q.options[0]);
        } else if (q.type === 'number') {
          const num = form.querySelector(`input[name="${q.id}"]`);
          answers[q.id] = num ? parseFloat(num.value) || 0 : q.default;
        }
      });

      // Collect Section C
      siat.sectionC.forEach((group) => {
        group.items.forEach((item) => {
          const freqChk = form.querySelector(`input[name="${item.key}_freq"]:checked`);
          const portionChk = form.querySelector(`input[name="${item.key}_portion"]:checked`);

          answers[`${item.key}_freq`] = freqChk ? parseInt(freqChk.value, 10) : 0;
          answers[`${item.key}_portion`] = portionChk ? portionChk.value : 'Medium';
        });
      });

      // Backward-compatible ML feature aliases
      answers['processed_food_frequency'] = answers['C2_1_freq'] || answers['C4_1_freq'] || 0;
      answers['dried_fish_frequency'] = answers['C1_1_freq'] || answers['C1_2_freq'] || 0;
      answers['salted_fish_frequency'] = answers['C1_2_freq'] || 0;
      answers['pickle_frequency'] = answers['C3_1_freq'] || 0;
      answers['fast_food_frequency'] = answers['C7_4_freq'] || answers['C7_2_freq'] || 0;
      answers['restaurant_food_frequency'] = (answers['B6'] && answers['B6'] > 7) ? 5 : (answers['B6'] > 2 ? 3 : 1);
      answers['instant_noodle_frequency'] = answers['C7_1_freq'] || 0;
      answers['added_salt_frequency'] = answers['B1'] === 'Always' ? 6 : (answers['B1'] === 'Often' ? 4 : (answers['B1'] === 'Sometimes' ? 3 : 0));
      answers['snack_frequency'] = answers['C4_1_freq'] || answers['C4_2_freq'] || 0;
      answers['condiment_frequency'] = answers['C6_1_freq'] || answers['C6_2_freq'] || 0;

      // Collect Section D
      siat.sectionD.forEach((q) => {
        if (q.type === 'radio' || q.type === 'likert') {
          const chk = form.querySelector(`input[name="${q.id}"]:checked`);
          answers[q.id] = chk ? chk.value : (q.options[0]?.value || q.options[0]);
        } else if (q.type === 'multicheck') {
          const checkedBoxes = Array.from(form.querySelectorAll(`input[name="${q.id}"]:checked`));
          answers[q.id] = checkedBoxes.map(cb => cb.value);
        }
      });

      // Add provider attribution
      answers['provider_administered'] = isProviderMode;
      const currentUser = window.HALOS_AUTH ? window.HALOS_AUTH.getCurrentUser() : null;
      if (currentUser) {
        answers['administered_by'] = currentUser.email;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="spinner-ring" style="width: 16px; height: 16px; border-width: 2px; margin: 0 6px 0 0; display: inline-block;"></span>
          ${t('btn_saving_assessment', 'Saving Assessment & Generating Prediction...')}
        `;
      }
      HALOS_UTILS.showLoading(t('msg_loading_siat', 'Persisting SIAT assessment to D1 and building ML feature vector...'));

      try {
        const res = await HALOS_API.saveMonthlyQuestionnaire(targetParticipant.id, answers);
        HALOS_UTILS.hideLoading();

        if (res.ok) {
          HALOS_UTILS.showToast(t('msg_siat_saved', 'SIAT assessment saved successfully! Forwarding to AI Assessment...'), 'success');
          setTimeout(() => {
            window.location.href = '/results.html';
          }, 600);
        } else {
          if (submitBtn) {
            submitBtn.disabled = false;
            updateSubmissionButtonState();
          }
          HALOS_UTILS.showToast(res.error || 'Failed to save questionnaire.', 'error');
        }
      } catch (err) {
        HALOS_UTILS.hideLoading();
        if (submitBtn) {
          submitBtn.disabled = false;
          updateSubmissionButtonState();
        }
        HALOS_UTILS.showToast('Communication failure with D1 API.', 'error');
      }
    });
  }
});

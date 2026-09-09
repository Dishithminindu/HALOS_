/**
 * HALOS v2.0 - Participant Registration & Assessment Initializer
 * Registers participant into Cloudflare D1 with cryptographically secure Study IDs,
 * enforcing Section 0 (Screening) and Section A (Sociodemographics).
 * Multilingual support: English, Sinhala, Tamil.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('participant-registration-form');
  const heightInput = document.getElementById('input-height');
  const weightInput = document.getElementById('input-weight');
  const bmiDisplay = document.getElementById('preview-bmi-value');
  const bmiCategoryDisplay = document.getElementById('preview-bmi-category');
  const submitBtn = document.getElementById('btn-register-participant');
  const eligibilityBadge = document.getElementById('eligibility-status-badge');
  const exclusionCheckboxes = document.querySelectorAll('.exclusion-checkbox');

  const i18n = window.HALOS_I18N;
  const t = (k, fallback) => (i18n ? i18n.t(k) : fallback);

  // Real-time BMI computation with Asian cut-offs
  function updateBmiPreview() {
    const height = parseFloat(heightInput?.value || '0');
    const weight = parseFloat(weightInput?.value || '0');

    if (height >= 100 && weight >= 25) {
      const heightM = height / 100.0;
      const bmi = Number((weight / (heightM * heightM)).toFixed(2));
      if (bmiDisplay) {
        bmiDisplay.textContent = `${bmi} kg/m²`;
      }
      if (bmiCategoryDisplay) {
        if (bmi < 18.5) {
          bmiCategoryDisplay.textContent = t('bmi_underweight', 'Underweight (<18.5)');
          bmiCategoryDisplay.style.background = '#e0f2fe';
          bmiCategoryDisplay.style.color = '#0369a1';
        } else if (bmi <= 22.9) {
          bmiCategoryDisplay.textContent = t('bmi_normal', 'Normal range (18.5–22.9)');
          bmiCategoryDisplay.style.background = '#dcfce7';
          bmiCategoryDisplay.style.color = '#15803d';
        } else if (bmi <= 27.4) {
          bmiCategoryDisplay.textContent = t('bmi_overweight', 'Overweight (23.0–27.4)');
          bmiCategoryDisplay.style.background = '#fef3c7';
          bmiCategoryDisplay.style.color = '#b45309';
        } else {
          bmiCategoryDisplay.textContent = t('bmi_obese', 'Obese (≥27.5)');
          bmiCategoryDisplay.style.background = '#fee2e2';
          bmiCategoryDisplay.style.color = '#b91c1c';
        }
      }
    } else {
      if (bmiDisplay) bmiDisplay.textContent = '—';
      if (bmiCategoryDisplay) bmiCategoryDisplay.textContent = '';
    }
  }

  if (heightInput) heightInput.addEventListener('input', updateBmiPreview);
  if (weightInput) weightInput.addEventListener('input', updateBmiPreview);
  updateBmiPreview();

  // Real-time Eligibility Check
  function checkEligibility() {
    let hasExclusion = false;
    exclusionCheckboxes.forEach(cb => {
      if (cb.checked) hasExclusion = true;
    });

    const under18 = document.querySelector('input[name="screen_age_18"]:checked')?.value === 'NO';
    const notAffiliated = document.querySelector('input[name="screen_uop_affiliated"]:checked')?.value === 'NO';
    const noConsent = document.querySelector('input[name="consent_agreed"]:checked')?.value === 'NO';

    if (hasExclusion || under18 || notAffiliated || noConsent) {
      if (eligibilityBadge) {
        eligibilityBadge.style.backgroundColor = '#fee2e2';
        eligibilityBadge.style.color = '#991b1b';
        let reason = t('msg_ineligible_criteria', 'Participant meets exclusion criteria.');
        if (under18) reason = t('msg_ineligible_age', 'Participant must be ≥18 years.');
        else if (notAffiliated) reason = t('msg_ineligible_uop', 'Participant must be affiliated with University of Peradeniya.');
        else if (noConsent) reason = t('msg_ineligible_consent', 'Informed consent is required.');
        eligibilityBadge.innerHTML = `⚠️ <strong>${t('lbl_ineligible', 'Ineligible')}:</strong> ${reason}`;
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
      }
      return false;
    } else {
      if (eligibilityBadge) {
        eligibilityBadge.style.backgroundColor = '#d1fae5';
        eligibilityBadge.style.color = '#065f46';
        eligibilityBadge.innerHTML = `✓ <strong>${t('lbl_eligible', 'Eligible')}:</strong> ${t('msg_eligible_criteria', 'Participant meets all protocol criteria.')}`;
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
      }
      return true;
    }
  }

  exclusionCheckboxes.forEach(cb => cb.addEventListener('change', checkEligibility));
  document.querySelectorAll('input[name="screen_age_18"], input[name="screen_uop_affiliated"], input[name="consent_agreed"]').forEach(el => {
    el.addEventListener('change', checkEligibility);
  });

  // Language Change Listener to re-evaluate dynamic messages
  document.addEventListener('halos:languageChanged', () => {
    updateBmiPreview();
    checkEligibility();
  });

  // Check if active participant already loaded
  const existingParticipant = HALOS_UTILS.getActiveParticipant();
  if (existingParticipant && document.getElementById('existing-participant-banner')) {
    const banner = document.getElementById('existing-participant-banner');
    const studyIdEl = document.getElementById('existing-study-id');
    if (banner && studyIdEl) {
      studyIdEl.textContent = existingParticipant.study_id;
      banner.style.display = 'block';
    }
  }

  // Handle Form Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!checkEligibility()) {
        HALOS_UTILS.showToast(t('msg_ineligible_toast', 'Participant does not meet eligibility criteria.'), 'error');
        return;
      }

      const screening = {
        age_18_or_older: document.querySelector('input[name="screen_age_18"]:checked')?.value === 'YES',
        exclusion_criteria: {
          pregnant_or_breastfeeding: document.getElementById('excl-pregnant')?.checked || false,
          prescribed_low_sodium: document.getElementById('excl-low-salt')?.checked || false,
          other_therapeutic_diet: document.getElementById('excl-therapeutic')?.checked || false,
          tube_or_enteral_feeding: document.getElementById('excl-tube-feeding')?.checked || false,
          difficulty_swallowing: document.getElementById('excl-swallowing')?.checked || false,
          illness_past_week: document.getElementById('excl-recent-illness')?.checked || false
        },
        uop_affiliated: document.querySelector('input[name="screen_uop_affiliated"]:checked')?.value === 'YES',
        language_proficient: document.querySelector('input[name="screen_language"]:checked')?.value === 'YES',
        consent_obtained: document.querySelector('input[name="consent_agreed"]:checked')?.value === 'YES',
        willing_two_recalls: document.querySelector('input[name="willing_two_recalls"]:checked')?.value || 'YES',
        is_eligible: true
      };

      const sociodemographics = {
        status_at_uop: document.getElementById('select-status-uop')?.value || '',
        faculty_or_division: document.getElementById('select-faculty')?.value || '',
        education_level: document.getElementById('select-education')?.value || '',
        marital_status: document.getElementById('select-marital')?.value || '',
        ethnicity: document.getElementById('select-ethnicity')?.value || '',
        residence_semester: document.getElementById('select-residence')?.value || '',
        has_hypertension: document.getElementById('select-hypertension')?.value || 'NO',
        advised_reduce_salt: document.getElementById('select-advised-salt')?.value || 'NO'
      };

      const formData = {
        age: parseInt(document.getElementById('input-age')?.value || '', 10),
        sex: document.getElementById('select-sex')?.value,
        height_cm: parseFloat(heightInput?.value || ''),
        weight_kg: parseFloat(weightInput?.value || ''),
        study_group: document.getElementById('input-study-group')?.value || 'GENERAL_POPULATION',
        consent_agreed: true,
        screening,
        sociodemographics
      };

      // 1. Client-Side Validation
      const val = HALOS_VALIDATION.validateParticipantForm(formData);
      if (!val.isValid) {
        HALOS_VALIDATION.applyFormErrors(form, val.errors);
        HALOS_UTILS.showToast(t('msg_validation_errors', 'Please correct the highlighted validation errors.'), 'error');
        return;
      }

      // 2. Submit to Worker API
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="spinner-ring" style="width: 16px; height: 16px; border-width: 2px; margin: 0 6px 0 0; display: inline-block;"></span>
          ${t('btn_saving_d1', 'Saving to Cloudflare D1...')}
        `;
      }
      HALOS_UTILS.showLoading(t('msg_registering_d1', 'Registering participant & generating Study ID in D1...'));

      try {
        const res = await HALOS_API.createParticipant(formData);
        HALOS_UTILS.hideLoading();

        if (!res.ok) {
          HALOS_UTILS.showToast(res.error || t('msg_reg_failed', 'Failed to register participant.'), 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `${t('btn_register_proceed', 'Register & Proceed to 24-hr Recall')} &rarr;`;
          }
          return;
        }

        // 3. Save Active Session with Verified Consent
        const participantData = Object.assign({}, res.data, {
          ethical_consent_verified: true,
          consent_agreed: true
        });
        HALOS_UTILS.setActiveParticipant(participantData);
        HALOS_UTILS.showToast(`${t('msg_reg_success', 'Participant registered!')} ${t('lbl_study_id', 'Study ID')}: ${res.data.study_id}`, 'success');

        // 4. Smooth Transition to Dietary Recall
        setTimeout(() => {
          window.location.href = '/dietary-recall.html';
        }, 500);
      } catch (err) {
        HALOS_UTILS.hideLoading();
        HALOS_UTILS.showToast(t('msg_network_error', 'Network error while communicating with Cloudflare D1.'), 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${t('btn_register_proceed', 'Register & Proceed to 24-hr Recall')} &rarr;`;
        }
      }
    });
  }
});

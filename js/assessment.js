/**
 * HALOS v2.0 - Participant Registration & Assessment Initializer
 * Registers participant into Cloudflare D1 with cryptographically secure Study IDs.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('participant-registration-form');
  const heightInput = document.getElementById('input-height');
  const weightInput = document.getElementById('input-weight');
  const bmiDisplay = document.getElementById('preview-bmi-value');
  const submitBtn = document.getElementById('btn-register-participant');

  // Real-time BMI computation
  function updateBmiPreview() {
    const height = parseFloat(heightInput?.value || '0');
    const weight = parseFloat(weightInput?.value || '0');

    if (height >= 100 && weight >= 25) {
      const bmi = HALOS_UTILS.computeBmi(weight, height);
      if (bmiDisplay) {
        bmiDisplay.textContent = bmi ? `${bmi} kg/m²` : '—';
      }
    } else {
      if (bmiDisplay) bmiDisplay.textContent = '—';
    }
  }

  if (heightInput) heightInput.addEventListener('input', updateBmiPreview);
  if (weightInput) weightInput.addEventListener('input', updateBmiPreview);

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

      const formData = {
        age: parseInt(document.getElementById('input-age')?.value || '', 10),
        sex: document.getElementById('select-sex')?.value,
        height_cm: parseFloat(heightInput?.value || ''),
        weight_kg: parseFloat(weightInput?.value || ''),
        study_group: document.getElementById('input-study-group')?.value || 'GENERAL_POPULATION',
        consent_agreed: document.getElementById('check-consent')?.checked
      };

      // 1. Client-Side Validation
      const val = HALOS_VALIDATION.validateParticipantForm(formData);
      if (!val.isValid) {
        HALOS_VALIDATION.applyFormErrors(form, val.errors);
        HALOS_UTILS.showToast('Please correct the highlighted validation errors.', 'error');
        return;
      }

      // 2. Submit to Worker API
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="spinner-ring" style="width: 16px; height: 16px; border-width: 2px; margin: 0 6px 0 0; display: inline-block;"></span>
          Saving to Cloudflare D1...
        `;
      }
      HALOS_UTILS.showLoading('Registering participant & generating Study ID in D1...');

      try {
        const res = await HALOS_API.createParticipant(formData);
        HALOS_UTILS.hideLoading();

        if (!res.ok) {
          HALOS_UTILS.showToast(res.error || 'Failed to register participant.', 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Register & Proceed to 24-hr Recall →';
          }
          return;
        }

        // 3. Save Active Session
        HALOS_UTILS.setActiveParticipant(res.data);
        HALOS_UTILS.showToast(`Participant registered successfully! Study ID: ${res.data.study_id}`, 'success');

        // 4. Smooth Transition to Dietary Recall
        setTimeout(() => {
          window.location.href = '/dietary-recall.html';
        }, 600);
      } catch (err) {
        HALOS_UTILS.hideLoading();
        HALOS_UTILS.showToast('Network error while communicating with Cloudflare D1.', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Register & Proceed to 24-hr Recall →';
        }
      }
    });
  }
});

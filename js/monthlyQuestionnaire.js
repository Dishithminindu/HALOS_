/**
 * HALOS v2.0 - Monthly Food-Frequency Questionnaire Controller
 * Frequency survey response collector and automatic habit scoring for Cloudflare D1.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const participant = HALOS_UTILS.getActiveParticipant();
  if (!participant || !participant.id) {
    HALOS_UTILS.showToast('Please register or select a participant before completing the questionnaire.', 'warning');
    setTimeout(() => { window.location.href = '/assessment.html'; }, 1000);
    return;
  }

  const studyIdSpan = document.getElementById('monthly-study-id');
  if (studyIdSpan) studyIdSpan.textContent = participant.study_id;

  const form = document.getElementById('monthly-questionnaire-form');
  const submitBtn = document.getElementById('btn-save-monthly');

  // Load existing answers if present
  HALOS_UTILS.showLoading('Loading questionnaire status from D1...');
  const existingRes = await HALOS_API.getMonthlyQuestionnaire(participant.id);
  HALOS_UTILS.hideLoading();

  if (existingRes.ok && existingRes.data && existingRes.data.answers) {
    const answers = existingRes.data.answers;
    for (const [key, value] of Object.entries(answers)) {
      const radio = document.querySelector(`input[name="${key}"][value="${value}"]`);
      if (radio) radio.checked = true;
    }
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const frequencyKeys = [
        'processed_food_frequency',
        'dried_fish_frequency',
        'salted_fish_frequency',
        'pickle_frequency',
        'fast_food_frequency',
        'restaurant_food_frequency',
        'instant_noodle_frequency',
        'added_salt_frequency',
        'snack_frequency',
        'condiment_frequency'
      ];

      const answers = {};
      let missingCount = 0;

      for (const key of frequencyKeys) {
        const checked = form.querySelector(`input[name="${key}"]:checked`);
        if (checked) {
          answers[key] = parseInt(checked.value, 10);
        } else {
          answers[key] = 0; // Default to never if unanswered
          missingCount++;
        }
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="spinner-ring" style="width: 16px; height: 16px; border-width: 2px; margin: 0 6px 0 0; display: inline-block;"></span>
          Saving Questionnaire & Generating Features...
        `;
      }
      HALOS_UTILS.showLoading('Saving responses to D1 and building feature vector...');

      const res = await HALOS_API.saveMonthlyQuestionnaire(participant.id, answers);
      HALOS_UTILS.hideLoading();

      if (res.ok) {
        HALOS_UTILS.showToast('Monthly questionnaire saved! Proceeding to AI-assisted assessment...', 'success');
        setTimeout(() => {
          window.location.href = '/results.html';
        }, 500);
      } else {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Save Questionnaire & Run Prediction →';
        }
        HALOS_UTILS.showToast(res.error || 'Failed to save questionnaire.', 'error');
      }
    });
  }
});

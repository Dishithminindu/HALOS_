/**
 * HALOS v2.0 - Prediction Results & Model Explainability Controller
 * Displays AI-assisted dietary salt assessment, gauge, feature importance, and historical records.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Enforce page sequencing: participants cannot view Step 4 without completing Step 1
  if (!HALOS_UTILS.enforcePageSequencing(4, { allowProviderBypass: true })) {
    const contentBody = document.querySelector('.content-body');
    if (contentBody) {
      contentBody.innerHTML = `
        <div class="card" style="text-align: center; padding: 48px 24px; max-width: 620px; margin: 40px auto; border-top: 4px solid #d97706;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
            <svg style="width: 28px; height: 28px;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">Step 1 Required: Participant Registration & Ethical Consent</h3>
          <p style="color: var(--text-muted); font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            Under the University of Peradeniya scientific study guidelines and ethical protocols, you cannot view or compute the AI Salt Intake Assessment (Step 4) without first recording participant demographic screening and verified informed consent on Step 1.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <a href="/assessment.html" class="btn btn-primary btn-lg">
              Proceed to Step 1: Participant Consent & Registration →
            </a>
            <a href="/login.html" class="btn btn-secondary btn-lg">
              Provider / Investigator Login
            </a>
          </div>
        </div>
      `;
    }
    return;
  }

  const participant = HALOS_UTILS.getActiveParticipant();
  const hasConsent = HALOS_UTILS.hasVerifiedConsent(participant);

  // Set participant metadata in UI
  const studyIdSpan = document.getElementById('results-study-id');
  const bmiSpan = document.getElementById('results-participant-bmi');
  const btnRerun = document.getElementById('btn-rerun-prediction');

  if (studyIdSpan) {
    if (hasConsent && participant && participant.study_id) {
      studyIdSpan.textContent = participant.study_id;
    } else {
      studyIdSpan.innerHTML = '<span style="color: #b45309; font-weight: 600; background: #fef3c7; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Inspection Mode (No Consented Participant)</span>';
    }
  }

  if (bmiSpan) {
    bmiSpan.textContent = (hasConsent && participant && (participant.bmi || participant.weight_kg))
      ? `${participant.bmi || HALOS_UTILS.computeBmi(participant.weight_kg, participant.height_cm)} kg/m²`
      : '—';
  }

  if (!hasConsent || !participant || !participant.id) {
    if (btnRerun) {
      btnRerun.disabled = true;
      btnRerun.style.opacity = '0.6';
      btnRerun.style.cursor = 'not-allowed';
      btnRerun.innerHTML = '🔒 Prediction Locked (Step 1 Consent Required)';
    }

    const heroCard = document.getElementById('results-hero-card');
    if (heroCard) {
      heroCard.innerHTML = `
        <div style="border-left: 5px solid #d97706; background: #fffbeb; padding: 24px; border-radius: 8px;">
          <h3 style="font-size: 17px; font-weight: 700; color: #92400e; margin: 0 0 8px 0; display: flex; align-items: center; gap: 8px;">
            <svg style="width: 20px; height: 20px; color: #d97706;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            Ethical Research Protocol: Step 1 Screening & Consent Required
          </h3>
          <p style="font-size: 13.5px; color: #78350f; line-height: 1.5; margin: 0 0 16px 0; max-width: 720px;">
            The AI Salt Assessment model computes calibrated intake and SHAP explainability from verified participant sociodemographics (Step 1), 24-hour multiple-pass recall (Step 2), and SIAT food frequency responses (Step 3). Under University of Peradeniya research ethics protocols, AI predictions cannot be computed or recorded without an active, consented participant.
          </p>
          <a href="/assessment.html" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 6px;">
            Start Step 1: Participant Screening & Consent →
          </a>
        </div>
      `;
    }
    return;
  }

  async function runAssessment() {
    HALOS_UTILS.showLoading('Executing AI-assisted salt intake assessment...');
    if (btnRerun) btnRerun.disabled = true;

    // Execute prediction via Worker API
    const res = await HALOS_API.predict(participant.id, {
      reference_salt_g_day: 5.0,
      allow_demo_fallback: true
    });
    HALOS_UTILS.hideLoading();
    if (btnRerun) btnRerun.disabled = false;

    if (!res.ok) {
      HALOS_UTILS.showToast(res.error || 'AI prediction service is currently unavailable.', 'error');
      renderUnavailableState(res.error);
      return;
    }

    renderPredictionResults(res.data);
    await loadPredictionHistory();
  }

  function renderUnavailableState(errorMessage) {
    const heroCard = document.getElementById('results-hero-card');
    if (heroCard) {
      heroCard.innerHTML = `
        <div class="alert alert-danger" style="margin-bottom: 0;">
          <div>
            <h3 style="font-weight: 700; margin-bottom: 4px;">AI Prediction Service Unavailable</h3>
            <p>${HALOS_UTILS.escapeHtml(errorMessage || 'The machine-learning inference microservice is not responding. Please ensure the Python FastAPI backend is running.')}</p>
          </div>
        </div>
      `;
    }
  }

  let lastPredictionData = null;

  function renderPredictionResults(data) {
    lastPredictionData = data;
    // 1. Primary Salt & Sodium Values
    const saltValEl = document.getElementById('predicted-salt-value');
    const sodiumValEl = document.getElementById('predicted-sodium-value');
    const refPercentEl = document.getElementById('reference-percentage-value');
    const riskBadgeEl = document.getElementById('risk-category-badge');
    const modelNameEl = document.getElementById('model-name-label');
    const modelVersionEl = document.getElementById('model-version-label');
    const intervalEl = document.getElementById('prediction-interval-value');
    const probEl = document.getElementById('classification-probability-value');
    const demoBanner = document.getElementById('demo-mode-alert-banner');

    if (saltValEl) saltValEl.textContent = `${data.predicted_salt_g_day} g/day`;
    if (sodiumValEl) sodiumValEl.textContent = `${data.predicted_sodium_mg_day} mg/day`;
    if (refPercentEl) refPercentEl.textContent = `${data.reference_percentage}%`;

    if (modelNameEl) modelNameEl.textContent = data.model_name;
    if (modelVersionEl) modelVersionEl.textContent = data.model_version;

    // Demo Mode Notice
    if (demoBanner) {
      if (data.is_demo === 1) {
        demoBanner.style.display = 'flex';
      } else {
        demoBanner.style.display = 'none';
      }
    }

    // Risk category badge
    if (riskBadgeEl) {
      const cat = data.risk_category || 'MODERATE';
      riskBadgeEl.className = `badge badge-${cat.toLowerCase()}`;
      const symbol = cat === 'HIGHER' ? '▲' : cat === 'MODERATE' ? '●' : '▼';
      const catKey = cat === 'HIGHER' ? 'cat_higher' : cat === 'LOWER' ? 'cat_lower' : 'cat_moderate';
      const catText = window.HALOS_I18N ? window.HALOS_I18N.t(catKey, `${cat} INTAKE`) : `${cat} INTAKE`;
      riskBadgeEl.innerHTML = `<span>${symbol}</span> <span>${catText}</span>`;
    }

    // Prediction interval
    if (intervalEl) {
      if (data.prediction_interval_low !== null && data.prediction_interval_high !== null) {
        intervalEl.textContent = `${data.prediction_interval_low} – ${data.prediction_interval_high} g/day`;
      } else {
        intervalEl.textContent = 'Prediction interval unavailable';
      }
    }

    // Classification probability
    if (probEl) {
      if (data.classification_probability !== null) {
        const pct = Math.round(data.classification_probability * 100);
        const curLang = window.HALOS_I18N ? window.HALOS_I18N.getLanguage() : 'en';
        if (curLang === 'si') {
          probEl.textContent = `${data.risk_category} කාණ්ඩය සඳහා ${pct}% ඇස්තමේන්තුගත සම්භාවිතාව`;
        } else if (curLang === 'ta') {
          probEl.textContent = `${data.risk_category} பிரிவிற்கான ${pct}% மதிப்பிடப்பட்ட நிகழ்தகவு`;
        } else {
          probEl.textContent = `${pct}% estimated probability for ${data.risk_category} classification`;
        }
      } else {
        probEl.textContent = 'Classification probability not generated';
      }
    }

    // 2. Position Gauge Pointer (Scale 0 to 12.5g)
    const gaugePointer = document.getElementById('gauge-pointer-marker');
    if (gaugePointer) {
      const maxScale = 12.5;
      const percentage = Math.min(100, Math.max(0, (data.predicted_salt_g_day / maxScale) * 100));
      gaugePointer.style.left = `${percentage}%`;
    }

    // 3. Render Top Contributing Features
    renderFeatureImportance(data.top_contributions || []);
  }

  function renderFeatureImportance(features) {
    const container = document.getElementById('feature-importance-list');
    if (!container) return;

    if (features.length === 0) {
      container.innerHTML = `
        <div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 16px;">
          Feature importance metrics available when trained Random Forest model is connected.
        </div>
      `;
      return;
    }

    const curLang = window.HALOS_I18N ? window.HALOS_I18N.getLanguage() : 'en';
    const featureLabels = {
      en: {
        recall_salt_g_day: '24-Hour Recall Salt Equivalent',
        recall_sodium_mg: '24-Hour Recall Sodium Intake',
        dried_fish_frequency: 'Monthly Dried Fish Consumption',
        salted_fish_frequency: 'Monthly Salted Fish / Maldive Fish',
        added_salt_frequency: 'Habitual Added Table Salt',
        processed_food_frequency: 'Monthly Processed / Canned Food',
        instant_noodle_frequency: 'Monthly Instant Noodles Frequency',
        pickle_frequency: 'Monthly Pickle / Achcharu Frequency',
        monthly_frequency_score: 'Composite Food Frequency Score',
        bmi: 'Body Mass Index (BMI)',
        age: 'Participant Age',
        condiment_frequency: 'Monthly Salty Condiment / Soy Sauce',
        restaurant_food_frequency: 'Restaurant & Takeaway Food',
        fast_food_frequency: 'Fast Food Consumption'
      },
      si: {
        recall_salt_g_day: 'පැය 24 ආහාර සිහිපත් කිරීමේ ලුණු ප්‍රමාණය',
        recall_sodium_mg: 'පැය 24 සෝඩියම් ප්‍රමාණය',
        dried_fish_frequency: 'මාසික කරවල පරිභෝජනය',
        salted_fish_frequency: 'මාසික ලුණු මාළු / උම්බලකඩ',
        added_salt_frequency: 'කෑම වේලට එකතු කරන ලුණු',
        processed_food_frequency: 'මාසික සැකසූ ආහාර පරිභෝජනය',
        instant_noodle_frequency: 'ක්ෂණික නූඩ්ල්ස් පරිභෝජනය',
        pickle_frequency: 'අච්චාරු / ලුණු දැමූ ආහාර',
        monthly_frequency_score: 'සමස්ත ආහාර සංඛ්‍යාත ලකුණු',
        bmi: 'ශරීර ස්කන්ධ දර්ශකය (BMI)',
        age: 'සහභාගිවන්නාගේ වයස',
        condiment_frequency: 'සෝස් / රසකාරක භාවිතය',
        restaurant_food_frequency: 'හෝටල් සහ ක්ෂණික ආහාර',
        fast_food_frequency: 'ක්ෂණික ආහාර පරිභෝජනය'
      },
      ta: {
        recall_salt_g_day: '24 மணிநேர உணவு நினைவு உப்பு அளவு',
        recall_sodium_mg: '24 மணிநேர சோடியம் உட்கொள்ளல்',
        dried_fish_frequency: 'மாதாந்திர கருவாடு நுகர்வு',
        salted_fish_frequency: 'மாதாந்திர உப்பு மீன் / மாசி கருவாடு',
        added_salt_frequency: 'வழக்கமான கூடுதல் மேஜை உப்பு',
        processed_food_frequency: 'மாதாந்திர பதப்படுத்தப்பட்ட உணவு',
        instant_noodle_frequency: 'மாதாந்திர உடனடி நூடுல்ஸ்',
        pickle_frequency: 'மாதாந்திர ஊறுகாய் நுகர்வு',
        monthly_frequency_score: 'கூட்டு உணவு அதிர்வெண் மதிப்பெண்',
        bmi: 'உடல் நிறை குறியீடு (BMI)',
        age: 'பங்கேற்பாளரின் வயது',
        condiment_frequency: 'மாதாந்திர சோயா சாஸ் / சுவையூட்டிகள்',
        restaurant_food_frequency: 'உணவக மற்றும் வெளியே வாங்கிய உணவுகள்',
        fast_food_frequency: 'துரித உணவு நுகர்வு'
      }
    };

    const langDict = featureLabels[curLang] || featureLabels.en;
    const modelWeightLabel = curLang === 'si' ? 'ආකෘති බර' : curLang === 'ta' ? 'மாதிரி எடை' : 'model weight';

    container.innerHTML = features.map(item => {
      const label = langDict[item.feature] || featureLabels.en[item.feature] || item.feature.replace(/_/g, ' ');
      const widthPct = Math.min(100, Math.round(item.importance * 250));
      return `
        <div class="feature-bar-item">
          <div class="feature-bar-meta">
            <span>${HALOS_UTILS.escapeHtml(label)}</span>
            <span style="color: var(--text-muted);">${(item.importance * 100).toFixed(1)}% ${modelWeightLabel}</span>
          </div>
          <div class="feature-bar-track">
            <div class="feature-bar-fill" style="width: ${widthPct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  async function loadPredictionHistory() {
    const historyContainer = document.getElementById('prediction-history-tbody');
    if (!historyContainer) return;

    const res = await HALOS_API.getPredictionHistory(participant.id);
    if (!res.ok || !res.data || res.data.length === 0) {
      historyContainer.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 20px;">
            No historical predictions found for this participant.
          </td>
        </tr>
      `;
      return;
    }

    historyContainer.innerHTML = res.data.map(item => `
      <tr>
        <td>${HALOS_UTILS.formatDate(item.created_at)}</td>
        <td><strong>${item.predicted_salt_g_day} g</strong></td>
        <td>${item.predicted_sodium_mg_day} mg</td>
        <td>${item.reference_percentage}%</td>
        <td>
          <span class="badge badge-${item.risk_category.toLowerCase()}">
            ${item.risk_category}
          </span>
        </td>
        <td>${HALOS_UTILS.escapeHtml(item.model_name)} <span style="font-size: 11px; color: var(--text-muted);">(${item.model_version})</span></td>
        <td>${item.is_demo ? '<span class="badge badge-demo">DEMO</span>' : '<span class="badge badge-lower">VERIFIED ML</span>'}</td>
      </tr>
    `).join('');
  }

  if (btnRerun) {
    btnRerun.addEventListener('click', runAssessment);
  }

  // Initial Assessment Execution
  await runAssessment();
});

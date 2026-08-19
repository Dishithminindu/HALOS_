/**
 * HALOS v2.0 - Prediction Results & Model Explainability Controller
 * Displays AI-assisted dietary salt assessment, gauge, feature importance, and historical records.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const participant = HALOS_UTILS.getActiveParticipant();
  if (!participant || !participant.id) {
    HALOS_UTILS.showToast('Please register or select a participant to view results.', 'warning');
    setTimeout(() => { window.location.href = '/assessment.html'; }, 1000);
    return;
  }

  // Set participant metadata in UI
  const studyIdSpan = document.getElementById('results-study-id');
  const bmiSpan = document.getElementById('results-participant-bmi');
  if (studyIdSpan) studyIdSpan.textContent = participant.study_id;
  if (bmiSpan) bmiSpan.textContent = `${participant.bmi || HALOS_UTILS.computeBmi(participant.weight_kg, participant.height_cm)} kg/m²`;

  const btnRerun = document.getElementById('btn-rerun-prediction');

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

  function renderPredictionResults(data) {
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
      riskBadgeEl.innerHTML = `<span>${symbol}</span> <span>${cat} INTAKE</span>`;
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
        probEl.textContent = `${pct}% estimated probability for ${data.risk_category} classification`;
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

    const featureLabels = {
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
    };

    container.innerHTML = features.map(item => {
      const label = featureLabels[item.feature] || item.feature.replace(/_/g, ' ');
      const widthPct = Math.min(100, Math.round(item.importance * 250));
      return `
        <div class="feature-bar-item">
          <div class="feature-bar-meta">
            <span>${HALOS_UTILS.escapeHtml(label)}</span>
            <span style="color: var(--text-muted);">${(item.importance * 100).toFixed(1)}% model weight</span>
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

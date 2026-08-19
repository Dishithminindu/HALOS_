/**
 * HALOS v2.0 - Research Analytics, Model Benchmarking & CSV Export
 */

document.addEventListener('DOMContentLoaded', async () => {
  HALOS_UTILS.showLoading('Loading scientific cohort metrics and model metadata...');

  const btnExportCsv = document.getElementById('btn-export-research-csv');

  try {
    // 1. Fetch Research Summary
    const summaryRes = await HALOS_API.getResearchSummary();
    if (summaryRes.ok && summaryRes.data) {
      renderCohortAnalytics(summaryRes.data);
    }

    // 2. Fetch Model Metadata
    const modelMeta = await HALOS_API.getModelMetadata();
    renderModelComparison(modelMeta);
  } catch (err) {
    console.error('Error loading research data:', err);
  } finally {
    HALOS_UTILS.hideLoading();
  }

  function renderCohortAnalytics(summary) {
    const totalPartEl = document.getElementById('res-total-participants');
    const meanSaltEl = document.getElementById('res-mean-salt');
    const medianSaltEl = document.getElementById('res-median-salt');
    const pctHigherEl = document.getElementById('res-pct-higher');
    const pctModerateEl = document.getElementById('res-pct-moderate');
    const pctLowerEl = document.getElementById('res-pct-lower');

    if (totalPartEl) totalPartEl.textContent = summary.total_participants;
    if (meanSaltEl) meanSaltEl.textContent = summary.mean_predicted_salt_g_day > 0 ? `${summary.mean_predicted_salt_g_day} g/day` : '—';
    if (medianSaltEl) medianSaltEl.textContent = summary.median_predicted_salt_g_day > 0 ? `${summary.median_predicted_salt_g_day} g/day` : '—';

    if (pctHigherEl) pctHigherEl.textContent = `${summary.risk_distribution.higher_percentage}% (${summary.risk_distribution.higher_count} pts)`;
    if (pctModerateEl) pctModerateEl.textContent = `${summary.risk_distribution.moderate_percentage}% (${summary.risk_distribution.moderate_count} pts)`;
    if (pctLowerEl) pctLowerEl.textContent = `${summary.risk_distribution.lower_percentage}% (${summary.risk_distribution.lower_count} pts)`;

    // Render Distribution Histogram Bins
    const binsContainer = document.getElementById('intake-distribution-bins');
    if (binsContainer && summary.intake_distribution_bins) {
      const maxCount = Math.max(1, ...Object.values(summary.intake_distribution_bins));
      binsContainer.innerHTML = Object.entries(summary.intake_distribution_bins).map(([binLabel, count]) => {
        const fillWidth = Math.round((count / maxCount) * 100);
        return `
          <div class="feature-bar-item">
            <div class="feature-bar-meta">
              <span>${binLabel}</span>
              <span><strong>${count}</strong> assessments</span>
            </div>
            <div class="feature-bar-track">
              <div class="feature-bar-fill" style="width: ${fillWidth}%; background-color: var(--secondary);"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  function renderModelComparison(meta) {
    const tbody = document.getElementById('model-comparison-tbody');
    const metaDateEl = document.getElementById('model-training-date');
    const trainSizeEl = document.getElementById('model-train-size');
    const testSizeEl = document.getElementById('model-test-size');

    if (!tbody) return;

    if (!meta || !meta.model_comparison) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">
            No model training artifacts detected. Run <code>python ml-service/train.py</code> to train models and generate scientific validation metrics.
          </td>
        </tr>
      `;
      return;
    }

    if (metaDateEl) metaDateEl.textContent = meta.training_date || '—';
    if (trainSizeEl) trainSizeEl.textContent = `${meta.training_sample_size} records (85%)`;
    if (testSizeEl) testSizeEl.textContent = `${meta.test_sample_size} records (15%)`;

    const rows = [];
    for (const [modelName, metrics] of Object.entries(meta.model_comparison)) {
      const isBest = modelName === meta.model_name;
      rows.push(`
        <tr class="${isBest ? 'best-model-row' : ''}">
          <td>
            <strong>${HALOS_UTILS.escapeHtml(modelName)}</strong>
            ${isBest ? ' <span class="badge badge-lower" style="margin-left: 6px;">Selected</span>' : ''}
          </td>
          <td>${metrics.cv_mae}</td>
          <td>${metrics.cv_rmse}</td>
          <td><strong>${metrics.cv_r2}</strong></td>
          <td>${metrics.test_mae}</td>
          <td>${metrics.test_rmse}</td>
          <td><strong>${metrics.test_r2}</strong></td>
        </tr>
      `);
    }

    tbody.innerHTML = rows.join('');
  }

  // Handle CSV Export
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', async () => {
      HALOS_UTILS.showLoading('Generating de-identified research dataset from Cloudflare D1...');
      btnExportCsv.disabled = true;

      const res = await HALOS_API.exportResearchCsv();
      HALOS_UTILS.hideLoading();
      btnExportCsv.disabled = false;

      if (res.ok && res.data) {
        const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `halos_research_export_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        HALOS_UTILS.showToast('Research dataset CSV downloaded successfully.', 'success');
      } else {
        HALOS_UTILS.showToast(res.error || 'Failed to generate research export.', 'error');
      }
    });
  }
});

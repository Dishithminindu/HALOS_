/**
 * HALOS v2.0 - Overview Dashboard Controller
 * Displays live research cohort metrics, recent activity, and quick assessment launcher.
 */

document.addEventListener('DOMContentLoaded', async () => {
  HALOS_UTILS.showLoading('Loading HALOS research dashboard...');

  try {
    // 1. Load Research Overview Stats
    const summaryRes = await HALOS_API.getResearchSummary();
    if (summaryRes.ok && summaryRes.data) {
      renderSummaryCards(summaryRes.data);
    }

    // 2. Load Recent Participants
    const participantsRes = await HALOS_API.listParticipants(8, 0);
    if (participantsRes.ok && participantsRes.data) {
      renderRecentParticipants(participantsRes.data);
    }
  } catch (err) {
    console.error('Error loading dashboard:', err);
  } finally {
    HALOS_UTILS.hideLoading();
  }

  function renderSummaryCards(summary) {
    const totalPartEl = document.getElementById('stat-total-participants');
    const totalRecallsEl = document.getElementById('stat-total-recalls');
    const totalPredsEl = document.getElementById('stat-total-predictions');
    const meanSaltEl = document.getElementById('stat-mean-salt');
    const higherPctEl = document.getElementById('stat-higher-risk-pct');

    if (totalPartEl) totalPartEl.textContent = summary.total_participants;
    if (totalRecallsEl) totalRecallsEl.textContent = summary.total_dietary_recalls;
    if (totalPredsEl) totalPredsEl.textContent = summary.total_predictions;
    if (meanSaltEl) meanSaltEl.textContent = summary.mean_predicted_salt_g_day > 0 ? `${summary.mean_predicted_salt_g_day} g` : '—';
    if (higherPctEl) higherPctEl.textContent = `${summary.risk_distribution.higher_percentage}%`;
  }

  function renderRecentParticipants(list) {
    const tbody = document.getElementById('recent-participants-tbody');
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">
            No research participants registered yet. Click "Register New Participant" to start.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(p => {
      const riskClass = p.latest_risk_category ? p.latest_risk_category.toLowerCase() : 'neutral';
      const riskLabel = p.latest_risk_category || 'Pending Assessment';

      return `
        <tr>
          <td><strong style="font-family: var(--font-mono);">${HALOS_UTILS.escapeHtml(p.study_id)}</strong></td>
          <td>${p.age} yrs (${p.sex})</td>
          <td>${p.bmi ? `${p.bmi} kg/m²` : '—'}</td>
          <td>${p.recall_count > 0 ? `<span class="badge badge-lower">${p.recall_count} items</span>` : '<span class="badge badge-neutral">Not logged</span>'}</td>
          <td>${p.questionnaire_count > 0 ? '<span class="badge badge-lower">Complete</span>' : '<span class="badge badge-neutral">Pending</span>'}</td>
          <td>
            ${p.latest_predicted_salt ? `<strong>${p.latest_predicted_salt} g/day</strong>` : '—'}
            <span class="badge badge-${riskClass}" style="margin-left: 4px;">${riskLabel}</span>
          </td>
          <td>
            <button class="btn btn-secondary btn-sm btn-select-participant" data-id="${p.id}" data-study-id="${p.study_id}" data-age="${p.age}" data-sex="${p.sex}" data-height="${p.height_cm}" data-weight="${p.weight_kg}" data-bmi="${p.bmi}">
              Open & Assessment →
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-select-participant').forEach(btn => {
      btn.addEventListener('click', () => {
        const participant = {
          id: btn.getAttribute('data-id'),
          study_id: btn.getAttribute('data-study-id'),
          age: parseInt(btn.getAttribute('data-age'), 10),
          sex: btn.getAttribute('data-sex'),
          height_cm: parseFloat(btn.getAttribute('data-height')),
          weight_kg: parseFloat(btn.getAttribute('data-weight')),
          bmi: parseFloat(btn.getAttribute('data-bmi'))
        };
        HALOS_UTILS.setActiveParticipant(participant);
        HALOS_UTILS.showToast(`Selected participant ${participant.study_id}`, 'info');
        window.location.href = '/dietary-recall.html';
      });
    });
  }
});

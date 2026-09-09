/**
 * HALOS v2.0 - 24-Hour Dietary Recall Controller
 * 5-Step Multiple-Pass Method adapted for Sri Lankan dietary and culinary practices.
 * Food database selector, household portion measures, cultural probes, and D1 synchronization.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Enforce page sequencing: participants cannot view Step 2 without completing Step 1
  if (!HALOS_UTILS.enforcePageSequencing(2, { allowProviderBypass: true })) {
    const contentBody = document.querySelector('.content-body');
    if (contentBody) {
      contentBody.innerHTML = `
        <div class="card" style="text-align: center; padding: 48px 24px; max-width: 620px; margin: 40px auto; border-top: 4px solid #d97706;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
            <svg style="width: 28px; height: 28px;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h3 style="font-size: 20px; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">Step 1 Required: Participant Registration & Ethical Consent</h3>
          <p style="color: var(--text-muted); font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            Under the University of Peradeniya scientific study guidelines and ethical protocols, you cannot view or complete the 24-Hour Dietary Recall (Step 2) without first recording participant demographic screening and verified informed consent on Step 1.
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

  // 1. Session Recovery & Ethical Protocol Consent check
  const participant = HALOS_UTILS.getActiveParticipant();
  const hasConsent = HALOS_UTILS.hasVerifiedConsent(participant);

  // Set participant header info or read-only preview indicator
  const studyIdSpan = document.getElementById('recall-study-id');
  if (studyIdSpan) {
    if (hasConsent && participant && participant.study_id) {
      studyIdSpan.textContent = participant.study_id;
    } else {
      studyIdSpan.innerHTML = '<span style="color: #b45309; font-weight: 600; background: #fef3c7; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Inspection Mode (No Consented Participant)</span>';
    }
  }

  // If unconsented, display prominent Ethical Protocol Guard banner
  const contentBody = document.querySelector('.content-body');
  if (!hasConsent && contentBody) {
    const guardBanner = document.createElement('div');
    guardBanner.id = 'ethical-protocol-guard-banner';
    guardBanner.style.cssText = 'background: #fffbeb; border: 1px solid #fde68a; border-left: 5px solid #d97706; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; box-shadow: 0 1px 3px rgba(0,0,0,0.05);';
    guardBanner.innerHTML = `
      <div style="flex: 1; min-width: 280px;">
        <div style="font-weight: 700; color: #92400e; font-size: 15px; display: flex; align-items: center; gap: 8px;">
          <svg style="width: 20px; height: 20px; color: #d97706;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          Ethical Research Protocol Enforcement: Read-Only Inspection Mode
        </div>
        <div style="font-size: 13px; color: #78350f; margin-top: 6px; line-height: 1.5; max-width: 760px;">
          You are viewing the 24-Hour Dietary Recall instrument in preview mode. Under University of Peradeniya research ethics protocols, <strong>meal data collection, intake logging, and submissions are strictly blocked</strong> until Participant Screening & Informed Consent (Step 1) is completed.
        </div>
      </div>
      <a href="/assessment.html" class="btn btn-primary btn-sm" style="white-space: nowrap; align-self: center;">
        Complete Step 1 Consent & Registration →
      </a>
    `;
    // Insert after stepper
    const stepper = contentBody.querySelector('.stepper-container');
    if (stepper) {
      stepper.insertAdjacentElement('afterend', guardBanner);
    } else {
      contentBody.insertBefore(guardBanner, contentBody.firstChild);
    }

    // Update stepper status
    const stepNodes = contentBody.querySelectorAll('.step-node');
    if (stepNodes.length > 0) {
      stepNodes[0].classList.remove('completed');
      const stepCircle = stepNodes[0].querySelector('.step-circle');
      if (stepCircle) stepCircle.textContent = '1';
      const stepLabel = stepNodes[0].querySelector('.step-label');
      if (stepLabel) stepLabel.innerHTML = 'Registration <span style="color:#d97706;font-size:10px;display:block;">(Required)</span>';
    }
  }

  // Load Food Database
  let foodDatabase = { categories: [], foods: [] };
  try {
    foodDatabase = await HALOS_API.getFoodDatabase();
  } catch (e) {
    console.error('Failed to load food database', e);
  }

  // Active state
  let currentMeal = 'BREAKFAST';
  let selectedFood = null;
  let currentCategory = 'ALL';

  // DOM Elements
  const mealTabs = document.querySelectorAll('.meal-tab-btn');
  const activeMealBadge = document.getElementById('active-meal-badge');
  const mealTimeInput = document.getElementById('input-meal-time');
  const mealLocationSelect = document.getElementById('select-meal-location');
  const foodSearchInput = document.getElementById('food-search-input');
  const categoryChipsContainer = document.getElementById('category-chips');
  const foodPickerGrid = document.getElementById('food-picker-grid');
  const selectedFoodNameEl = document.getElementById('selected-food-name');
  const selectedFoodMetaEl = document.getElementById('selected-food-meta');
  const portionInput = document.getElementById('input-portion-quantity');
  const portionUnitEl = document.getElementById('input-portion-unit');
  const previewSodiumEl = document.getElementById('preview-item-sodium');
  const previewSaltEl = document.getElementById('preview-item-salt');
  const btnAddFood = document.getElementById('btn-add-food-item');
  const recallEntriesContainer = document.getElementById('recall-entries-list');
  const totalSodiumDisplay = document.getElementById('summary-total-sodium');
  const totalSaltDisplay = document.getElementById('summary-total-salt');
  const totalItemsDisplay = document.getElementById('summary-total-items');
  const sopStepBoxes = document.querySelectorAll('.sop-step-box');
  const quickMeasureBtns = document.querySelectorAll('.btn-quick-portion');

  // SOP Pass Navigation
  sopStepBoxes.forEach(box => {
    box.addEventListener('click', () => {
      sopStepBoxes.forEach(b => b.classList.remove('active'));
      box.classList.add('active');
      const step = box.getAttribute('data-step');
      const guidance = document.getElementById('sop-probe-guidance');
      if (guidance) {
        if (step === '2' || step === '5') {
          guidance.style.display = 'block';
        }
      }
    });
  });

  // Render Category Filter Chips
  function renderCategoryChips() {
    if (!categoryChipsContainer) return;
    categoryChipsContainer.innerHTML = `
      <button class="category-chip ${currentCategory === 'ALL' ? 'active' : ''}" data-cat="ALL">All Categories (${foodDatabase.foods.length})</button>
      ${foodDatabase.categories.map(cat => `
        <button class="category-chip ${currentCategory === cat ? 'active' : ''}" data-cat="${HALOS_UTILS.escapeHtml(cat)}">${HALOS_UTILS.escapeHtml(cat)}</button>
      `).join('')}
    `;

    categoryChipsContainer.querySelectorAll('.category-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.getAttribute('data-cat') || 'ALL';
        renderCategoryChips();
        renderFoodPicker();
      });
    });
  }

  // Render Food Items in Selector
  function renderFoodPicker() {
    if (!foodPickerGrid) return;
    const query = (foodSearchInput?.value || '').toLowerCase().trim();

    const filtered = foodDatabase.foods.filter(item => {
      const matchCat = currentCategory === 'ALL' || item.category === currentCategory;
      const matchQuery = !query ||
        item.food_name.toLowerCase().includes(query) ||
        (item.sinhala_name && item.sinhala_name.toLowerCase().includes(query)) ||
        (item.tamil_name && item.tamil_name.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      foodPickerGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 24px; color: var(--text-muted);">
          No matching food items found for "${HALOS_UTILS.escapeHtml(query)}". Try typing rice, dhal, karawala, or sambol.
        </div>
      `;
      return;
    }

    const curLang = window.HALOS_I18N ? window.HALOS_I18N.getLanguage() : 'en';
    foodPickerGrid.innerHTML = filtered.map(item => {
      const isSelected = selectedFood && selectedFood.food_id === item.food_id;
      let primaryName = item.food_name;
      let subName = '';
      if (curLang === 'si' && item.sinhala_name) {
        primaryName = item.sinhala_name;
        subName = `(${item.food_name})`;
      } else if (curLang === 'ta' && item.tamil_name) {
        primaryName = item.tamil_name;
        subName = `(${item.food_name})`;
      } else if (item.sinhala_name) {
        subName = `(${item.sinhala_name})`;
      }
      const badge = subName ? `<span style="font-size: 11px; color: var(--primary); font-weight: 500;">${subName}</span>` : '';
      return `
        <div class="food-item-option ${isSelected ? 'active' : ''}" data-id="${item.food_id}">
          <div>
            <div class="food-item-name">${HALOS_UTILS.escapeHtml(primaryName)} ${badge}</div>
            <div class="food-item-sub">${HALOS_UTILS.escapeHtml(item.category)} • Std: ${item.serving_size || 100}g</div>
          </div>
          <div style="margin-top: 8px; font-size: 11px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; color: ${item.high_sodium_flag ? 'var(--risk-higher)' : 'var(--text-muted)'};">
            <span>${item.sodium_mg_per_100g} mg Na / 100g</span>
            ${item.high_sodium_flag ? '<span style="background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 4px; font-size: 10px;">▲ High Sodium</span>' : ''}
          </div>
        </div>
      `;
    }).join('');

    foodPickerGrid.querySelectorAll('.food-item-option').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const food = foodDatabase.foods.find(f => f.food_id === id);
        if (food) {
          selectFoodItem(food);
        }
      });
    });
  }

  function selectFoodItem(food) {
    selectedFood = food;
    renderFoodPicker();

    const curLang = window.HALOS_I18N ? window.HALOS_I18N.getLanguage() : 'en';
    let foodTitle = food.food_name;
    if (curLang === 'si' && food.sinhala_name) foodTitle = `${food.sinhala_name} (${food.food_name})`;
    else if (curLang === 'ta' && food.tamil_name) foodTitle = `${food.tamil_name} (${food.food_name})`;
    else if (food.sinhala_name) foodTitle = `${food.food_name} (${food.sinhala_name})`;

    if (selectedFoodNameEl) selectedFoodNameEl.textContent = foodTitle;
    if (selectedFoodMetaEl) selectedFoodMetaEl.textContent = `${food.category} • Reference standard: ${food.serving_size}g (${food.serving_unit || 'g'}) • ${food.sodium_mg_per_100g} mg Na/100g`;
    if (portionInput) portionInput.value = food.serving_size || 100;
    if (portionUnitEl) portionUnitEl.textContent = 'grams (g)';

    updatePortionCalculation();
    if (btnAddFood) btnAddFood.disabled = false;
  }

  // Quick Household Measure Click Handlers
  quickMeasureBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const grams = btn.getAttribute('data-grams');
      if (portionInput && grams) {
        portionInput.value = grams;
        updatePortionCalculation();
      }
    });
  });

  function updatePortionCalculation() {
    if (!selectedFood) return;
    const qty = parseFloat(portionInput?.value || '0');
    if (qty > 0) {
      const sodiumMg = Math.round((selectedFood.sodium_mg_per_100g * qty) / 100.0);
      const saltG = HALOS_UTILS.sodiumToSalt(sodiumMg);

      if (previewSodiumEl) previewSodiumEl.textContent = `${sodiumMg} mg`;
      if (previewSaltEl) previewSaltEl.textContent = `${saltG} g`;
    } else {
      if (previewSodiumEl) previewSodiumEl.textContent = '0 mg';
      if (previewSaltEl) previewSaltEl.textContent = '0 g';
    }
  }

  if (foodSearchInput) foodSearchInput.addEventListener('input', renderFoodPicker);
  if (portionInput) portionInput.addEventListener('input', updatePortionCalculation);

  // Meal Selection Tabs
  const defaultMealTimes = {
    EARLY_MORNING: '06:00',
    BREAKFAST: '07:30',
    MID_MORNING: '10:30',
    LUNCH: '13:00',
    MID_AFTERNOON: '16:00',
    DINNER: '20:00',
    LATE_NIGHT: '22:00'
  };

  mealTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      mealTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentMeal = tab.getAttribute('data-meal') || 'BREAKFAST';
      if (activeMealBadge) activeMealBadge.textContent = currentMeal.replace('_', ' ');
      if (mealTimeInput && defaultMealTimes[currentMeal]) {
        mealTimeInput.value = defaultMealTimes[currentMeal];
      }
      renderRecallEntries();
    });
  });

  // Load and Render Existing Recall Entries from D1
  async function loadExistingRecall() {
    if (!hasConsent || !participant || !participant.id) {
      window._currentRecalls = [];
      updateSummaryHeader({ total_sodium_mg: 0, total_salt_g: 0, total_food_count: 0 });
      renderRecallEntries();
      return;
    }

    HALOS_UTILS.showLoading('Fetching 24-hour recall records from D1...');
    const res = await HALOS_API.getRecallEntries(participant.id);
    HALOS_UTILS.hideLoading();

    if (res.ok && res.data) {
      window._currentRecalls = res.data.entries || [];
      updateSummaryHeader(res.data.summary);
      renderRecallEntries();
    }
  }

  function updateSummaryHeader(summary) {
    if (!summary) return;
    if (totalSodiumDisplay) totalSodiumDisplay.textContent = `${summary.total_sodium_mg} mg`;
    if (totalSaltDisplay) totalSaltDisplay.textContent = `${summary.total_salt_g} g`;
    if (totalItemsDisplay) totalItemsDisplay.textContent = `${summary.total_food_count} items`;

    const targetPill = document.getElementById('salt-target-pill');
    if (targetPill) {
      if (summary.total_salt_g > 5.0) {
        targetPill.style.background = '#fee2e2';
        targetPill.style.color = '#991b1b';
        targetPill.textContent = `▲ Exceeds WHO Limit (${summary.total_salt_g}g / 5g)`;
      } else {
        targetPill.style.background = '#e0f2fe';
        targetPill.style.color = '#0369a1';
        targetPill.textContent = `Within WHO Guideline (≤5.0 g/day)`;
      }
    }
  }

  function renderRecallEntries() {
    if (!recallEntriesContainer) return;
    const entries = (window._currentRecalls || []).filter(e => e.meal === currentMeal);

    if (entries.length === 0) {
      if (!hasConsent) {
        recallEntriesContainer.innerHTML = `
          <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
            <div style="color: #92400e; font-weight: 600; margin-bottom: 4px;">Read-Only Inspection Mode</div>
            No foods recorded. To record and submit meals into the research cohort database, please complete <a href="/assessment.html" style="color: var(--primary); font-weight: 600; text-decoration: underline;">Step 1: Participant Screening & Consent</a>.
          </div>
        `;
      } else {
        recallEntriesContainer.innerHTML = `
          <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
            No foods recorded for <strong>${currentMeal.replace('_', ' ')}</strong> yet. Select items above to log consumption.
          </div>
        `;
      }
      return;
    }

    recallEntriesContainer.innerHTML = entries.map(item => {
      const probes = item.discretionary_probes && item.discretionary_probes.length > 0
        ? `<div style="font-size: 11px; color: var(--accent); margin-top: 3px;">Probes: ${item.discretionary_probes.join(', ')}</div>`
        : '';
      const timeLoc = item.meal_time || item.dining_location
        ? `<span style="font-size: 11px; color: var(--text-muted);">(${item.meal_time || ''} @ ${item.dining_location || 'Home'})</span>`
        : '';

      return `
        <div class="recall-item-row" id="row-${item.id}">
          <div class="recall-item-info">
            <span class="recall-item-name">${HALOS_UTILS.escapeHtml(item.food_name)} ${timeLoc}</span>
            <span class="recall-item-metrics">
              Portion: ${item.quantity}${item.unit} • Sodium: <strong>${item.sodium_mg} mg</strong> • Salt-equivalent: <strong>${item.salt_g} g</strong>
            </span>
            ${probes}
          </div>
          <button class="btn btn-secondary btn-sm btn-delete-recall" data-id="${item.id}" style="color: var(--risk-higher);">
            Delete
          </button>
        </div>
      `;
    }).join('');

    recallEntriesContainer.querySelectorAll('.btn-delete-recall').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!hasConsent) {
          HALOS_UTILS.showToast('⚠️ Ethical Protocol: Deletion locked in read-only inspection mode.', 'warning');
          return;
        }
        const id = btn.getAttribute('data-id');
        if (confirm('Delete this food entry from the research record?')) {
          HALOS_UTILS.showLoading('Removing record from D1...');
          const delRes = await HALOS_API.deleteRecallEntry(id);
          HALOS_UTILS.hideLoading();
          if (delRes.ok) {
            window._currentRecalls = (window._currentRecalls || []).filter(e => e.id !== id);
            updateSummaryHeader(delRes.data.summary);
            renderRecallEntries();
            HALOS_UTILS.showToast('Item removed from 24-hr recall.', 'info');
          } else {
            HALOS_UTILS.showToast(delRes.error || 'Failed to delete record.', 'error');
          }
        }
      });
    });
  }

  // Configure Add Food Item button based on ethical protocol state
  if (btnAddFood) {
    if (!hasConsent) {
      btnAddFood.disabled = true;
      btnAddFood.style.opacity = '0.7';
      btnAddFood.style.cursor = 'not-allowed';
      btnAddFood.title = 'Ethical Protocol: Participant screening and informed consent required on Step 1 before adding meals.';
      btnAddFood.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px;"><svg style="width:16px;height:16px;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> Submission Locked (Requires Step 1 Consent)</span>';
    }

    btnAddFood.addEventListener('click', async () => {
      if (!hasConsent || !participant || !participant.id) {
        HALOS_UTILS.showToast('⚠️ Ethical Protocol Violation: Cannot submit or log dietary intake without completing Step 1 Screening & Informed Consent.', 'error');
        return;
      }

      if (!selectedFood) {
        HALOS_UTILS.showToast('Please select a food item first.', 'warning');
        return;
      }

      const qty = parseFloat(portionInput?.value || '0');
      if (qty <= 0) {
        HALOS_UTILS.showToast('Please enter a valid portion size in grams.', 'warning');
        return;
      }

      // Collect discretionary probes
      const activeProbes = [];
      document.querySelectorAll('.recall-dish-probe:checked').forEach(cb => {
        activeProbes.push(cb.value);
      });

      const sodiumMg = Math.round((selectedFood.sodium_mg_per_100g * qty) / 100.0);
      const saltG = HALOS_UTILS.sodiumToSalt(sodiumMg);

      const payload = {
        meal: currentMeal,
        food_id: selectedFood.food_id,
        food_name: selectedFood.food_name,
        quantity: qty,
        unit: 'g',
        sodium_mg: sodiumMg,
        salt_g: saltG,
        preparation_notes: selectedFood.cooking_notes || '',
        meal_time: mealTimeInput?.value || '07:30',
        dining_location: mealLocationSelect?.value || 'Home',
        discretionary_probes: activeProbes
      };

      btnAddFood.disabled = true;
      HALOS_UTILS.showLoading('Saving dietary entry to D1...');
      const res = await HALOS_API.addRecallEntry(participant.id, payload);
      HALOS_UTILS.hideLoading();
      btnAddFood.disabled = false;

      if (res.ok && res.data) {
        window._currentRecalls = window._currentRecalls || [];
        window._currentRecalls.push(res.data.item);
        updateSummaryHeader(res.data.summary);
        renderRecallEntries();
        HALOS_UTILS.showToast(`Logged ${selectedFood.food_name} (${saltG}g salt-equivalent) in ${currentMeal}.`, 'success');
      } else {
        HALOS_UTILS.showToast(res.error || 'Failed to save dietary recall entry.', 'error');
      }
    });
  }

  // Re-render when language changes
  function handleLangChange() {
    renderCategoryChips();
    renderFoodPicker();
    if (selectedFood) selectFoodItem(selectedFood);
  }
  window.addEventListener('halos:languageChanged', handleLangChange);
  document.addEventListener('halos:languageChanged', handleLangChange);

  // Initialize Data
  renderCategoryChips();
  renderFoodPicker();
  await loadExistingRecall();
});

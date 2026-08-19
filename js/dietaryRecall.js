/**
 * HALOS v2.0 - 24-Hour Dietary Recall Controller
 * Food database selector, meal entry logging, sodium accumulator, and D1 synchronization.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const participant = HALOS_UTILS.getActiveParticipant();
  if (!participant || !participant.id) {
    HALOS_UTILS.showToast('Please register or select a participant before conducting dietary recall.', 'warning');
    setTimeout(() => { window.location.href = '/assessment.html'; }, 1000);
    return;
  }

  // Set participant header info
  const studyIdSpan = document.getElementById('recall-study-id');
  if (studyIdSpan) studyIdSpan.textContent = participant.study_id;

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

  // Render Category Filter Chips
  function renderCategoryChips() {
    if (!categoryChipsContainer) return;
    categoryChipsContainer.innerHTML = `
      <button class="category-chip ${currentCategory === 'ALL' ? 'active' : ''}" data-cat="ALL">All Categories</button>
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
      const matchQuery = !query || item.food_name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      foodPickerGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 24px; color: var(--text-muted);">
          No matching food items found in prototype composition database.
        </div>
      `;
      return;
    }

    foodPickerGrid.innerHTML = filtered.map(item => `
      <div class="food-item-option ${selectedFood && selectedFood.food_id === item.food_id ? 'active' : ''}" data-id="${item.food_id}">
        <div>
          <div class="food-item-name">${HALOS_UTILS.escapeHtml(item.food_name)}</div>
          <div class="food-item-sub">${HALOS_UTILS.escapeHtml(item.category)} • ${item.serving_unit}</div>
        </div>
        <div style="margin-top: 8px; font-size: 11px; font-weight: 600; color: ${item.high_sodium_flag ? 'var(--risk-higher)' : 'var(--text-muted)'};">
          ${item.sodium_mg_per_100g} mg Na / 100g ${item.high_sodium_flag ? '▲ High Sodium' : ''}
        </div>
      </div>
    `).join('');

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

    if (selectedFoodNameEl) selectedFoodNameEl.textContent = food.food_name;
    if (selectedFoodMetaEl) selectedFoodMetaEl.textContent = `${food.category} (Standard: ${food.serving_size}g / ${food.serving_unit})`;
    if (portionInput) portionInput.value = food.serving_size;
    if (portionUnitEl) portionUnitEl.textContent = 'grams (g)';

    updatePortionCalculation();
    if (btnAddFood) btnAddFood.disabled = false;
  }

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
  mealTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      mealTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentMeal = tab.getAttribute('data-meal') || 'BREAKFAST';
      renderRecallEntries();
    });
  });

  // Load and Render Existing Recall Entries from D1
  async function loadExistingRecall() {
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
  }

  function renderRecallEntries() {
    if (!recallEntriesContainer) return;
    const entries = (window._currentRecalls || []).filter(e => e.meal === currentMeal);

    if (entries.length === 0) {
      recallEntriesContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
          No foods recorded for <strong>${currentMeal.replace('_', ' ')}</strong> yet. Select items above to log consumption.
        </div>
      `;
      return;
    }

    recallEntriesContainer.innerHTML = entries.map(item => `
      <div class="recall-item-row" id="row-${item.id}">
        <div class="recall-item-info">
          <span class="recall-item-name">${HALOS_UTILS.escapeHtml(item.food_name)}</span>
          <span class="recall-item-metrics">
            Portion: ${item.quantity}${item.unit} • Sodium: <strong>${item.sodium_mg} mg</strong> • Salt-equivalent: <strong>${item.salt_g} g</strong>
          </span>
        </div>
        <button class="btn btn-secondary btn-sm btn-delete-recall" data-id="${item.id}" style="color: var(--risk-higher);">
          Delete
        </button>
      </div>
    `).join('');

    recallEntriesContainer.querySelectorAll('.btn-delete-recall').forEach(btn => {
      btn.addEventListener('click', async () => {
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

  // Add Food Item to D1
  if (btnAddFood) {
    btnAddFood.addEventListener('click', async () => {
      if (!selectedFood) {
        HALOS_UTILS.showToast('Please select a food item first.', 'warning');
        return;
      }

      const qty = parseFloat(portionInput?.value || '0');
      if (qty <= 0) {
        HALOS_UTILS.showToast('Please enter a valid portion size in grams.', 'warning');
        return;
      }

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
        preparation_notes: ''
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

  // Initialize Data
  renderCategoryChips();
  renderFoodPicker();
  await loadExistingRecall();
});

/**
 * HALOS v2.0 - 24-Hour Dietary Recall Controller
 * Meal-by-meal dietary record management and sodium/salt equivalent calculations.
 */

import { validateRecallEntry } from './validation.js';
import { logAuditEvent } from './audit.js';

export async function addRecallEntry(db, participantId, data) {
  const val = validateRecallEntry(data);
  if (!val.valid) {
    return { ok: false, error: val.errors.join(' '), code: 'VALIDATION_FAILED' };
  }

  // Verify participant exists
  const p = await db.prepare(`SELECT id FROM participants WHERE id = ?`).bind(participantId).first();
  if (!p) {
    return { ok: false, error: 'Participant not found.', code: 'PARTICIPANT_NOT_FOUND' };
  }

  const id = `rec_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  const now = new Date().toISOString();
  const meal = String(data.meal).toUpperCase();
  const quantity = Number(data.quantity);
  const sodiumMg = Number(data.sodium_mg || 0);
  
  // Mathematical formula: salt_g = sodium_mg * 2.5 / 1000
  const saltG = Number(data.salt_g !== undefined ? data.salt_g : ((sodiumMg * 2.5) / 1000.0).toFixed(2));
  const prepNotes = data.preparation_notes || '';

  await db.prepare(`
    INSERT INTO dietary_recalls (id, participant_id, meal, food_id, food_name, quantity, unit, sodium_mg, salt_g, preparation_notes, recorded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    participantId,
    meal,
    data.food_id,
    data.food_name,
    quantity,
    data.unit || 'g',
    sodiumMg,
    saltG,
    prepNotes,
    now
  ).run();

  await logAuditEvent(db, 'RECALL_ITEM_ADDED', participantId, { recallId: id, foodName: data.food_name });

  // Calculate new totals for participant
  const totals = await getParticipantRecallTotals(db, participantId);

  return {
    ok: true,
    data: {
      item: {
        id,
        participant_id: participantId,
        meal,
        food_id: data.food_id,
        food_name: data.food_name,
        quantity,
        unit: data.unit || 'g',
        sodium_mg: sodiumMg,
        salt_g: saltG,
        preparation_notes: prepNotes,
        recorded_at: now
      },
      summary: totals
    }
  };
}

export async function getParticipantRecallTotals(db, participantId) {
  const rows = await db.prepare(`
    SELECT meal, food_id, sodium_mg, salt_g FROM dietary_recalls WHERE participant_id = ?
  `).bind(participantId).all();

  const entries = rows.results || [];
  let totalSodiumMg = 0;
  let totalSaltG = 0;
  const mealBreakdown = {
    BREAKFAST: { count: 0, sodium_mg: 0, salt_g: 0 },
    MORNING_SNACK: { count: 0, sodium_mg: 0, salt_g: 0 },
    LUNCH: { count: 0, sodium_mg: 0, salt_g: 0 },
    AFTERNOON_SNACK: { count: 0, sodium_mg: 0, salt_g: 0 },
    DINNER: { count: 0, sodium_mg: 0, salt_g: 0 },
    EVENING_SNACK: { count: 0, sodium_mg: 0, salt_g: 0 }
  };

  const distinctMeals = new Set();

  for (const item of entries) {
    totalSodiumMg += Number(item.sodium_mg) || 0;
    totalSaltG += Number(item.salt_g) || 0;
    const m = item.meal;
    if (mealBreakdown[m]) {
      mealBreakdown[m].count += 1;
      mealBreakdown[m].sodium_mg += Number(item.sodium_mg) || 0;
      mealBreakdown[m].salt_g += Number(item.salt_g) || 0;
      distinctMeals.add(m);
    }
  }

  return {
    total_food_count: entries.length,
    number_of_meals: distinctMeals.size,
    total_sodium_mg: Math.round(totalSodiumMg),
    total_salt_g: Number(totalSaltG.toFixed(2)),
    meal_breakdown: mealBreakdown
  };
}

export async function getRecallEntries(db, participantId) {
  const rows = await db.prepare(`
    SELECT * FROM dietary_recalls WHERE participant_id = ? ORDER BY recorded_at ASC
  `).bind(participantId).all();

  const summary = await getParticipantRecallTotals(db, participantId);

  return {
    ok: true,
    data: {
      entries: rows.results || [],
      summary
    }
  };
}

export async function deleteRecallEntry(db, id) {
  const item = await db.prepare(`SELECT participant_id FROM dietary_recalls WHERE id = ?`).bind(id).first();
  if (!item) {
    return { ok: false, error: 'Dietary recall item not found.', code: 'NOT_FOUND' };
  }

  await db.prepare(`DELETE FROM dietary_recalls WHERE id = ?`).bind(id).run();
  await logAuditEvent(db, 'RECALL_ITEM_DELETED', item.participant_id, { recallId: id });

  const summary = await getParticipantRecallTotals(db, item.participant_id);

  return {
    ok: true,
    data: {
      deleted_id: id,
      summary
    }
  };
}

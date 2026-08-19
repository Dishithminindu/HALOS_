/**
 * HALOS v2.0 - Monthly Food-Frequency Questionnaire Controller
 * Captures food group consumption frequencies and habitual salt behaviors.
 */

import { validateQuestionnaire } from './validation.js';
import { logAuditEvent } from './audit.js';

export function computeMonthlyFrequencyScore(answers) {
  const keys = [
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

  let score = 0;
  for (const k of keys) {
    score += Number(answers[k]) || 0;
  }
  return score;
}

export async function saveMonthlyQuestionnaire(db, participantId, answers) {
  const val = validateQuestionnaire(answers);
  if (!val.valid) {
    return { ok: false, error: val.errors.join(' '), code: 'VALIDATION_FAILED' };
  }

  // Check participant exists
  const p = await db.prepare(`SELECT id FROM participants WHERE id = ?`).bind(participantId).first();
  if (!p) {
    return { ok: false, error: 'Participant not found.', code: 'PARTICIPANT_NOT_FOUND' };
  }

  const id = `que_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  const now = new Date().toISOString();
  const frequencyScore = computeMonthlyFrequencyScore(answers);

  const featureVector = {
    processed_food_frequency: Number(answers.processed_food_frequency) || 0,
    dried_fish_frequency: Number(answers.dried_fish_frequency) || 0,
    salted_fish_frequency: Number(answers.salted_fish_frequency) || 0,
    pickle_frequency: Number(answers.pickle_frequency) || 0,
    fast_food_frequency: Number(answers.fast_food_frequency) || 0,
    restaurant_food_frequency: Number(answers.restaurant_food_frequency) || 0,
    instant_noodle_frequency: Number(answers.instant_noodle_frequency) || 0,
    added_salt_frequency: Number(answers.added_salt_frequency) || 0,
    snack_frequency: Number(answers.snack_frequency) || 0,
    condiment_frequency: Number(answers.condiment_frequency) || 0,
    monthly_frequency_score: frequencyScore
  };

  const answersJson = JSON.stringify(answers);
  const featureVectorJson = JSON.stringify(featureVector);

  await db.prepare(`
    INSERT INTO monthly_questionnaires (id, participant_id, answers_json, feature_vector_json, recorded_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(id, participantId, answersJson, featureVectorJson, now).run();

  await logAuditEvent(db, 'QUESTIONNAIRE_SUBMITTED', participantId, { questionnaireId: id, frequencyScore });

  return {
    ok: true,
    data: {
      id,
      participant_id: participantId,
      answers,
      feature_vector: featureVector,
      recorded_at: now
    }
  };
}

export async function getMonthlyQuestionnaire(db, participantId) {
  const row = await db.prepare(`
    SELECT * FROM monthly_questionnaires WHERE participant_id = ? ORDER BY recorded_at DESC LIMIT 1
  `).bind(participantId).first();

  if (!row) {
    return { ok: true, data: null };
  }

  return {
    ok: true,
    data: {
      id: row.id,
      participant_id: row.participant_id,
      answers: JSON.parse(row.answers_json || '{}'),
      feature_vector: JSON.parse(row.feature_vector_json || '{}'),
      recorded_at: row.recorded_at
    }
  };
}

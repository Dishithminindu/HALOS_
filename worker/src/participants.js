/**
 * HALOS v2.0 - Participants Controller
 * Cryptographically random study IDs, participant registration and record management.
 */

import { validateParticipant } from './validation.js';
import { logAuditEvent } from './audit.js';

export function generateSecureStudyId() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  return `HALOS-${hex}`;
}

export function computeBmi(weightKg, heightCm) {
  if (!heightCm || heightCm <= 0) return null;
  const heightM = heightCm / 100.0;
  return Number((weightKg / (heightM * heightM)).toFixed(2));
}

export async function createParticipant(db, data) {
  const val = validateParticipant(data);
  if (!val.valid) {
    return { ok: false, error: val.errors.join(' '), code: 'VALIDATION_FAILED' };
  }

  const id = `pt_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  const studyId = data.study_id || generateSecureStudyId();
  const now = new Date().toISOString();
  const consentVersion = data.consent_version || 'v2.0-2026';
  const studyGroup = data.study_group || 'GENERAL_POPULATION';
  const screeningJson = data.screening ? JSON.stringify(data.screening) : null;
  const sociodemographicsJson = data.sociodemographics ? JSON.stringify(data.sociodemographics) : null;

  await db.prepare(`
    INSERT INTO participants (
      id, study_id, age, sex, height_cm, weight_kg,
      consent_version, study_group, screening_json, sociodemographics_json,
      created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    studyId,
    Number(data.age),
    String(data.sex).toUpperCase(),
    Number(data.height_cm),
    Number(data.weight_kg),
    consentVersion,
    studyGroup,
    screeningJson,
    sociodemographicsJson,
    now,
    now
  ).run();

  await logAuditEvent(db, 'PARTICIPANT_REGISTERED', id, { studyId, consentVersion });

  const bmi = computeBmi(data.weight_kg, data.height_cm);

  return {
    ok: true,
    data: {
      id,
      study_id: studyId,
      age: Number(data.age),
      sex: String(data.sex).toUpperCase(),
      height_cm: Number(data.height_cm),
      weight_kg: Number(data.weight_kg),
      bmi,
      consent_version: consentVersion,
      study_group: studyGroup,
      screening: data.screening || null,
      sociodemographics: data.sociodemographics || null,
      created_at: now
    }
  };
}

export async function listParticipants(db, limit = 50, offset = 0) {
  const rows = await db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM dietary_recalls WHERE participant_id = p.id) AS recall_count,
      (SELECT COUNT(*) FROM monthly_questionnaires WHERE participant_id = p.id) AS questionnaire_count,
      (SELECT predicted_salt_g_day FROM predictions WHERE participant_id = p.id ORDER BY created_at DESC LIMIT 1) AS latest_predicted_salt,
      (SELECT risk_category FROM predictions WHERE participant_id = p.id ORDER BY created_at DESC LIMIT 1) AS latest_risk_category
    FROM participants p
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(limit, offset).all();

  const results = (rows.results || []).map(p => ({
    ...p,
    bmi: computeBmi(p.weight_kg, p.height_cm),
    screening: p.screening_json ? JSON.parse(p.screening_json) : null,
    sociodemographics: p.sociodemographics_json ? JSON.parse(p.sociodemographics_json) : null
  }));

  return { ok: true, data: results };
}

export async function getParticipantById(db, id) {
  const p = await db.prepare(`
    SELECT * FROM participants WHERE id = ? OR study_id = ?
  `).bind(id, id).first();

  if (!p) {
    return { ok: false, error: 'Participant not found in research database.', code: 'NOT_FOUND' };
  }

  // Get recall summaries
  const recalls = await db.prepare(`
    SELECT * FROM dietary_recalls WHERE participant_id = ? ORDER BY recorded_at ASC
  `).bind(p.id).all();

  // Get monthly questionnaire
  const monthly = await db.prepare(`
    SELECT * FROM monthly_questionnaires WHERE participant_id = ? ORDER BY recorded_at DESC LIMIT 1
  `).bind(p.id).first();

  // Get latest prediction
  const latestPrediction = await db.prepare(`
    SELECT * FROM predictions WHERE participant_id = ? ORDER BY created_at DESC LIMIT 1
  `).bind(p.id).first();

  return {
    ok: true,
    data: {
      ...p,
      bmi: computeBmi(p.weight_kg, p.height_cm),
      screening: p.screening_json ? JSON.parse(p.screening_json) : null,
      sociodemographics: p.sociodemographics_json ? JSON.parse(p.sociodemographics_json) : null,
      recalls: recalls.results || [],
      monthly_questionnaire: monthly ? {
        ...monthly,
        answers: JSON.parse(monthly.answers_json || '{}'),
        feature_vector: JSON.parse(monthly.feature_vector_json || '{}')
      } : null,
      latest_prediction: latestPrediction ? {
        ...latestPrediction,
        features: JSON.parse(latestPrediction.features_json || '{}')
      } : null
    }
  };
}

export async function updateParticipant(db, id, data) {
  const val = validateParticipant(data);
  if (!val.valid) {
    return { ok: false, error: val.errors.join(' '), code: 'VALIDATION_FAILED' };
  }

  const now = new Date().toISOString();
  const screeningJson = data.screening ? JSON.stringify(data.screening) : null;
  const sociodemographicsJson = data.sociodemographics ? JSON.stringify(data.sociodemographics) : null;

  const res = await db.prepare(`
    UPDATE participants
    SET age = ?, sex = ?, height_cm = ?, weight_kg = ?, study_group = ?,
        screening_json = COALESCE(?, screening_json),
        sociodemographics_json = COALESCE(?, sociodemographics_json),
        updated_at = ?
    WHERE id = ?
  `).bind(
    Number(data.age),
    String(data.sex).toUpperCase(),
    Number(data.height_cm),
    Number(data.weight_kg),
    data.study_group || 'GENERAL_POPULATION',
    screeningJson,
    sociodemographicsJson,
    now,
    id
  ).run();

  if (res.meta && res.meta.changes === 0) {
    return { ok: false, error: 'Participant not found to update.', code: 'NOT_FOUND' };
  }

  await logAuditEvent(db, 'PARTICIPANT_UPDATED', id, { updated_at: now });

  return {
    ok: true,
    data: {
      id,
      age: Number(data.age),
      sex: String(data.sex).toUpperCase(),
      height_cm: Number(data.height_cm),
      weight_kg: Number(data.weight_kg),
      bmi: computeBmi(data.weight_kg, data.height_cm),
      updated_at: now
    }
  };
}

export async function deleteParticipant(db, id) {
  // 1. Cascading deletes in D1
  await db.prepare(`DELETE FROM dietary_recalls WHERE participant_id = ?`).bind(id).run();
  await db.prepare(`DELETE FROM monthly_questionnaires WHERE participant_id = ?`).bind(id).run();
  await db.prepare(`DELETE FROM predictions WHERE participant_id = ?`).bind(id).run();

  // 2. Delete participant
  const res = await db.prepare(`
    DELETE FROM participants WHERE id = ?
  `).bind(id).run();

  if (res.meta && res.meta.changes === 0) {
    return { ok: false, error: 'Participant not found to delete.', code: 'NOT_FOUND' };
  }

  await logAuditEvent(db, 'PARTICIPANT_DELETED', id, {});

  return { ok: true, data: { deleted_id: id } };
}

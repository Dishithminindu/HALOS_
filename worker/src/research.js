/**
 * HALOS v2.0 - Research Analytics and CSV Export Engine
 * Anonymized cohort aggregation, summary metrics, and de-identified data export.
 */

import { computeBmi } from './participants.js';
import { logAuditEvent } from './audit.js';

export async function getResearchSummary(db) {
  // 1. Participant count
  const partCountRow = await db.prepare(`SELECT COUNT(*) AS total FROM participants`).first();
  const totalParticipants = partCountRow ? Number(partCountRow.total) : 0;

  // 2. Total recalls and questionnaires
  const recallCountRow = await db.prepare(`SELECT COUNT(*) AS total FROM dietary_recalls`).first();
  const questCountRow = await db.prepare(`SELECT COUNT(*) AS total FROM monthly_questionnaires`).first();
  const predCountRow = await db.prepare(`SELECT COUNT(*) AS total FROM predictions`).first();

  const totalRecalls = recallCountRow ? Number(recallCountRow.total) : 0;
  const totalQuestionnaires = questCountRow ? Number(questCountRow.total) : 0;
  const totalPredictions = predCountRow ? Number(predCountRow.total) : 0;

  // 3. Predictions aggregation
  const predRows = await db.prepare(`
    SELECT predicted_salt_g_day, risk_category, is_demo, model_name, created_at
    FROM predictions
    ORDER BY created_at DESC
  `).all();

  const predictions = predRows.results || [];
  let meanSalt = 0;
  let medianSalt = 0;
  let countHigher = 0;
  let countModerate = 0;
  let countLower = 0;
  const distributionBins = {
    '< 4.0 g': 0,
    '4.0 - 5.9 g': 0,
    '6.0 - 7.9 g': 0,
    '8.0 - 9.9 g': 0,
    '10.0+ g': 0
  };

  if (predictions.length > 0) {
    const saltValues = predictions.map(p => Number(p.predicted_salt_g_day)).sort((a, b) => a - b);
    const sumSalt = saltValues.reduce((acc, v) => acc + v, 0);
    meanSalt = Number((sumSalt / saltValues.length).toFixed(2));

    const mid = Math.floor(saltValues.length / 2);
    medianSalt = saltValues.length % 2 !== 0 ? saltValues[mid] : Number(((saltValues[mid - 1] + saltValues[mid]) / 2).toFixed(2));

    for (const p of predictions) {
      const s = Number(p.predicted_salt_g_day);
      if (s < 4.0) distributionBins['< 4.0 g'] += 1;
      else if (s < 6.0) distributionBins['4.0 - 5.9 g'] += 1;
      else if (s < 8.0) distributionBins['6.0 - 7.9 g'] += 1;
      else if (s < 10.0) distributionBins['8.0 - 9.9 g'] += 1;
      else distributionBins['10.0+ g'] += 1;

      if (p.risk_category === 'HIGHER') countHigher += 1;
      else if (p.risk_category === 'MODERATE') countModerate += 1;
      else countLower += 1;
    }
  }

  const pctHigher = predictions.length > 0 ? Number(((countHigher / predictions.length) * 100).toFixed(1)) : 0;
  const pctModerate = predictions.length > 0 ? Number(((countModerate / predictions.length) * 100).toFixed(1)) : 0;
  const pctLower = predictions.length > 0 ? Number(((countLower / predictions.length) * 100).toFixed(1)) : 0;

  return {
    ok: true,
    data: {
      total_participants: totalParticipants,
      total_dietary_recalls: totalRecalls,
      total_questionnaires: totalQuestionnaires,
      total_predictions: totalPredictions,
      mean_predicted_salt_g_day: meanSalt,
      median_predicted_salt_g_day: medianSalt,
      risk_distribution: {
        higher_count: countHigher,
        higher_percentage: pctHigher,
        moderate_count: countModerate,
        moderate_percentage: pctModerate,
        lower_count: countLower,
        lower_percentage: pctLower
      },
      intake_distribution_bins: distributionBins,
      recent_activity: predictions.slice(0, 10)
    }
  };
}

export async function exportResearchCsv(db) {
  const rows = await db.prepare(`
    SELECT
      p.study_id,
      p.age,
      p.sex,
      p.height_cm,
      p.weight_kg,
      p.study_group,
      pr.model_name,
      pr.model_version,
      pr.predicted_salt_g_day,
      pr.predicted_sodium_mg_day,
      pr.reference_percentage,
      pr.risk_category,
      pr.classification_probability,
      pr.prediction_interval_low,
      pr.prediction_interval_high,
      pr.is_demo,
      pr.created_at
    FROM predictions pr
    JOIN participants p ON pr.participant_id = p.id
    ORDER BY pr.created_at DESC
  `).all();

  const records = rows.results || [];

  const headers = [
    'study_id',
    'age',
    'sex',
    'height_cm',
    'weight_kg',
    'bmi',
    'study_group',
    'model_name',
    'model_version',
    'predicted_salt_g_day',
    'predicted_sodium_mg_day',
    'reference_percentage',
    'risk_category',
    'classification_probability',
    'prediction_interval_low',
    'prediction_interval_high',
    'is_demo',
    'created_at'
  ];

  const csvLines = [headers.join(',')];

  for (const r of records) {
    const bmi = computeBmi(r.weight_kg, r.height_cm) || '';
    const line = [
      `"${r.study_id}"`,
      r.age,
      `"${r.sex}"`,
      r.height_cm,
      r.weight_kg,
      bmi,
      `"${r.study_group || 'GENERAL'}"`,
      `"${r.model_name}"`,
      `"${r.model_version}"`,
      r.predicted_salt_g_day,
      r.predicted_sodium_mg_day,
      r.reference_percentage,
      `"${r.risk_category}"`,
      r.classification_probability !== null ? r.classification_probability : '',
      r.prediction_interval_low !== null ? r.prediction_interval_low : '',
      r.prediction_interval_high !== null ? r.prediction_interval_high : '',
      r.is_demo ? 1 : 0,
      `"${r.created_at}"`
    ];
    csvLines.push(line.join(','));
  }

  await logAuditEvent(db, 'RESEARCH_EXPORT_GENERATED', null, { rowCount: records.length });

  return csvLines.join('\n');
}

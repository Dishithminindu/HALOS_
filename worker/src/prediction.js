/**
 * HALOS v2.0 - Prediction & Machine Learning Integration Gateway
 * Compiles feature vectors, communicates with Python ML inference service, and stores predictions in D1.
 */

import { computeBmi } from './participants.js';
import { getParticipantRecallTotals } from './recall.js';
import { getMonthlyQuestionnaire } from './questionnaire.js';
import { logAuditEvent } from './audit.js';

export const FEATURE_SCHEMA_VERSION = 'FEATURES-2.0';
export const DEFAULT_REFERENCE_SALT_G_DAY = 5.0;

/**
 * Builds the canonical feature vector by aggregating demographic, 24-hr recall,
 * and monthly questionnaire data stored in D1.
 */
export async function buildFeatureVector(db, participantId) {
  const p = await db.prepare(`SELECT * FROM participants WHERE id = ?`).bind(participantId).first();
  if (!p) {
    return { ok: false, error: 'Participant not found.', code: 'NOT_FOUND' };
  }

  // 1. Demographics & Anthropometrics
  const age = Number(p.age);
  const sexStr = String(p.sex).toUpperCase();
  const sexMale = sexStr === 'MALE' ? 1.0 : 0.0;
  const heightCm = Number(p.height_cm);
  const weightKg = Number(p.weight_kg);
  const bmi = computeBmi(weightKg, heightCm) || 24.0;

  // 2. 24-Hour Dietary Recall aggregates
  const recallTotals = await getParticipantRecallTotals(db, participantId);
  const recallEntries = await db.prepare(`
    SELECT food_id, sodium_mg FROM dietary_recalls WHERE participant_id = ?
  `).bind(participantId).all();

  let highSodiumFoodsCount = 0;
  for (const item of (recallEntries.results || [])) {
    // Flag foods with >= 600mg sodium per serving as high-sodium
    if (Number(item.sodium_mg) >= 600) {
      highSodiumFoodsCount += 1;
    }
  }

  // 3. Monthly Questionnaire frequencies
  const monthlyRes = await getMonthlyQuestionnaire(db, participantId);
  const qFeatures = (monthlyRes.ok && monthlyRes.data) ? monthlyRes.data.feature_vector : {};

  const vector = {
    age,
    sex_male: sexMale,
    height_cm: heightCm,
    weight_kg: weightKg,
    bmi,
    recall_food_count: recallTotals.total_food_count,
    recall_sodium_mg: recallTotals.total_sodium_mg,
    recall_salt_g_day: recallTotals.total_salt_g,
    number_of_meals: recallTotals.number_of_meals,
    number_of_high_sodium_foods: highSodiumFoodsCount,
    processed_food_frequency: Number(qFeatures.processed_food_frequency || 0),
    dried_fish_frequency: Number(qFeatures.dried_fish_frequency || 0),
    salted_fish_frequency: Number(qFeatures.salted_fish_frequency || 0),
    pickle_frequency: Number(qFeatures.pickle_frequency || 0),
    fast_food_frequency: Number(qFeatures.fast_food_frequency || 0),
    restaurant_food_frequency: Number(qFeatures.restaurant_food_frequency || 0),
    instant_noodle_frequency: Number(qFeatures.instant_noodle_frequency || 0),
    added_salt_frequency: Number(qFeatures.added_salt_frequency || 0),
    snack_frequency: Number(qFeatures.snack_frequency || 0),
    condiment_frequency: Number(qFeatures.condiment_frequency || 0),
    monthly_frequency_score: Number(qFeatures.monthly_frequency_score || 0)
  };

  return {
    ok: true,
    data: {
      participant_id: participantId,
      study_id: p.study_id,
      feature_schema_version: FEATURE_SCHEMA_VERSION,
      vector
    }
  };
}

/**
 * Executes ML prediction by contacting the external Python FastAPI service.
 * If ML service is offline, honors the DEMO MODE rule without faking ML models.
 */
export async function executePrediction(db, env, participantId, options = {}) {
  const featRes = await buildFeatureVector(db, participantId);
  if (!featRes.ok) {
    return featRes;
  }

  const featureVector = featRes.data.vector;
  const mlServiceUrl = (env && env.ML_SERVICE_URL) ? env.ML_SERVICE_URL : 'http://localhost:8000';
  const referenceSaltG = Number(options.reference_salt_g_day || DEFAULT_REFERENCE_SALT_G_DAY);
  const allowDemoFallback = options.allow_demo_fallback !== false;

  let mlResponse = null;
  let serviceConnected = false;

  // 1. Attempt connection to the real Python ML Inference API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${mlServiceUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(featureVector),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.ok && data.data) {
        mlResponse = data.data;
        serviceConnected = true;
      }
    }
  } catch (err) {
    serviceConnected = false;
  }

  let finalPrediction = null;

  if (serviceConnected && mlResponse) {
    // Use actual ML inference output
    const predSalt = Number(mlResponse.predicted_salt_g_day);
    const predSodium = Number(mlResponse.predicted_sodium_mg_day || (predSalt * 1000.0 / 2.5).toFixed(1));
    const refPercent = Number(((predSalt / referenceSaltG) * 100.0).toFixed(1));
    const riskCat = mlResponse.risk_category || (predSalt < 5.0 ? 'LOWER' : predSalt <= 7.0 ? 'MODERATE' : 'HIGHER');

    finalPrediction = {
      predicted_salt_g_day: predSalt,
      predicted_sodium_mg_day: predSodium,
      reference_percentage: refPercent,
      risk_category: riskCat,
      classification_probability: mlResponse.classification_probability || null,
      prediction_interval_low: mlResponse.prediction_interval_low || null,
      prediction_interval_high: mlResponse.prediction_interval_high || null,
      model_name: mlResponse.model_name || 'RandomForestRegressor',
      model_version: mlResponse.model_version || 'RF-2.0.0',
      feature_schema_version: FEATURE_SCHEMA_VERSION,
      top_contributions: mlResponse.top_contributions || [],
      is_demo: 0,
      notes: 'Real-time inference generated by Python Random Forest ML service.'
    };
  } else {
    // Real ML model is not available
    if (!allowDemoFallback) {
      return {
        ok: false,
        error: 'AI prediction service is currently unavailable.',
        code: 'MODEL_NOT_AVAILABLE'
      };
    }

    // Explicitly labeled DEMO MODE — NOT A REAL ML PREDICTION
    // Calculation clearly documented as a prototype UI placeholder
    const recallSalt = featureVector.recall_salt_g_day || 0;
    const freqScore = featureVector.monthly_frequency_score || 0;
    const demoEstimateSalt = Number(Math.max(1.5, Math.min(16.0, recallSalt > 0 ? (recallSalt * 0.7 + freqScore * 0.12) : 5.8)).toFixed(2));
    const demoSodium = Math.round(demoEstimateSalt * 1000.0 / 2.5);
    const demoRefPercent = Number(((demoEstimateSalt / referenceSaltG) * 100.0).toFixed(1));
    const demoRiskCat = demoEstimateSalt < 5.0 ? 'LOWER' : demoEstimateSalt <= 7.0 ? 'MODERATE' : 'HIGHER';

    finalPrediction = {
      predicted_salt_g_day: demoEstimateSalt,
      predicted_sodium_mg_day: demoSodium,
      reference_percentage: demoRefPercent,
      risk_category: demoRiskCat,
      classification_probability: null, // Never fake classification probability
      prediction_interval_low: null,    // Never fake intervals
      prediction_interval_high: null,
      model_name: 'DEMO_MODE_FALLBACK',
      model_version: 'DEMO-2.0',
      feature_schema_version: FEATURE_SCHEMA_VERSION,
      top_contributions: [
        { feature: 'recall_salt_g_day', value: featureVector.recall_salt_g_day, importance: 0.35 },
        { feature: 'monthly_frequency_score', value: featureVector.monthly_frequency_score, importance: 0.25 },
        { feature: 'dried_fish_frequency', value: featureVector.dried_fish_frequency, importance: 0.15 },
        { feature: 'added_salt_frequency', value: featureVector.added_salt_frequency, importance: 0.12 }
      ],
      is_demo: 1,
      notes: 'DEMO MODE — NOT A REAL ML PREDICTION. Python ML inference service is not connected.'
    };
  }

  // 4. Save prediction record to D1
  const id = `pred_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  const now = new Date().toISOString();
  const featuresJson = JSON.stringify(featureVector);

  await db.prepare(`
    INSERT INTO predictions (
      id, participant_id, model_name, model_version,
      predicted_salt_g_day, predicted_sodium_mg_day, reference_percentage,
      risk_category, classification_probability, prediction_interval_low, prediction_interval_high,
      features_json, is_demo, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    participantId,
    finalPrediction.model_name,
    finalPrediction.model_version,
    finalPrediction.predicted_salt_g_day,
    finalPrediction.predicted_sodium_mg_day,
    finalPrediction.reference_percentage,
    finalPrediction.risk_category,
    finalPrediction.classification_probability,
    finalPrediction.prediction_interval_low,
    finalPrediction.prediction_interval_high,
    featuresJson,
    finalPrediction.is_demo,
    now
  ).run();

  await logAuditEvent(db, 'PREDICTION_EXECUTED', participantId, {
    predictionId: id,
    modelName: finalPrediction.model_name,
    isDemo: finalPrediction.is_demo === 1
  });

  return {
    ok: true,
    data: {
      id,
      participant_id: participantId,
      ...finalPrediction,
      created_at: now
    }
  };
}

export async function getPredictionsForParticipant(db, participantId) {
  const rows = await db.prepare(`
    SELECT * FROM predictions WHERE participant_id = ? ORDER BY created_at DESC
  `).bind(participantId).all();

  const results = (rows.results || []).map(p => ({
    ...p,
    features: JSON.parse(p.features_json || '{}')
  }));

  return { ok: true, data: results };
}

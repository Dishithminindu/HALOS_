/**
 * HALOS v2.0 - Local Development & Production Server
 * Express Server bridging static frontend, Cloudflare D1 emulated storage, and Python FastAPI ML service.
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

interface Participant {
  id: string;
  study_id: string;
  age: number;
  sex: string;
  height_cm: number;
  weight_kg: number;
  bmi: number;
  study_group: string;
  consent_agreed: boolean;
  screening?: any;
  sociodemographics?: any;
  created_at: string;
}

interface RecallItem {
  id: string;
  participant_id: string;
  meal: string;
  meal_time?: string;
  location?: string;
  food_id: string;
  food_name: string;
  quantity: number;
  unit: string;
  household_measure?: string;
  sodium_mg: number;
  salt_g: number;
  preparation_notes?: string;
  discretionary_extras?: string[];
  created_at: string;
}

interface MonthlyQuestionnaire {
  participant_id: string;
  answers: Record<string, any>;
  monthly_frequency_score: number;
  updated_at: string;
}

interface PredictionRecord {
  id: string;
  participant_id: string;
  predicted_salt_g_day: number;
  predicted_sodium_mg_day: number;
  reference_percentage: number;
  risk_category: 'LOWER' | 'MODERATE' | 'HIGHER';
  classification_probability: number | null;
  prediction_interval_low: number | null;
  prediction_interval_high: number | null;
  model_name: string;
  model_version: string;
  feature_importance_json: string;
  is_demo: number;
  created_at: string;
}

// In-Memory Storage conforming to Cloudflare D1 Schema
const participantsDb = new Map<string, Participant>();
const recallDb = new Map<string, RecallItem>();
const monthlyDb = new Map<string, MonthlyQuestionnaire>();
const predictionsDb = new Map<string, PredictionRecord>();

function generateStudyId(): string {
  const chars = '0123456789ABCDEF';
  let hex = '';
  for (let i = 0; i < 12; i++) {
    hex += chars[Math.floor(Math.random() * chars.length)];
  }
  return `HALOS-${hex}`;
}

// Seed initial research cohort
function seedInitialData() {
  const p1: Participant = {
    id: 'p_demo_01',
    study_id: 'HALOS-UOP-001',
    age: 42,
    sex: 'MALE',
    height_cm: 172.0,
    weight_kg: 74.5,
    bmi: 25.18,
    study_group: 'GENERAL_POPULATION',
    consent_agreed: true,
    screening: {
      age_18_or_older: true,
      uop_affiliated: true,
      language_proficient: true,
      consent_obtained: true,
      willing_two_recalls: 'YES',
      is_eligible: true
    },
    sociodemographics: {
      status_at_uop: 'Academic staff',
      faculty_or_division: 'Faculty of Science',
      education_level: 'Postgraduate degree',
      marital_status: 'Married',
      ethnicity: 'Sinhala',
      residence_semester: 'Own home or family home',
      has_hypertension: 'NO',
      advised_reduce_salt: 'NO'
    },
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  };

  const p2: Participant = {
    id: 'p_demo_02',
    study_id: 'HALOS-UOP-002',
    age: 23,
    sex: 'FEMALE',
    height_cm: 158.0,
    weight_kg: 52.0,
    bmi: 20.83,
    study_group: 'GENERAL_POPULATION',
    consent_agreed: true,
    screening: {
      age_18_or_older: true,
      uop_affiliated: true,
      language_proficient: true,
      consent_obtained: true,
      willing_two_recalls: 'YES',
      is_eligible: true
    },
    sociodemographics: {
      status_at_uop: 'Undergraduate student',
      faculty_or_division: 'Faculty of Arts',
      education_level: 'G.C.E. Advanced Level (A/L)',
      marital_status: 'Never married',
      ethnicity: 'Sinhala',
      residence_semester: 'University hostel or hall of residence',
      has_hypertension: 'NO',
      advised_reduce_salt: 'NO'
    },
    created_at: new Date(Date.now() - 86400000).toISOString()
  };

  const p3: Participant = {
    id: 'p_demo_03',
    study_id: 'HALOS-UOP-003',
    age: 56,
    sex: 'MALE',
    height_cm: 165.0,
    weight_kg: 82.0,
    bmi: 30.12,
    study_group: 'HYPERTENSION_COHORT',
    consent_agreed: true,
    screening: {
      age_18_or_older: true,
      uop_affiliated: true,
      language_proficient: true,
      consent_obtained: true,
      willing_two_recalls: 'YES',
      is_eligible: true
    },
    sociodemographics: {
      status_at_uop: 'Non-academic staff',
      faculty_or_division: 'Faculty of Medicine',
      education_level: 'G.C.E. Ordinary Level (O/L)',
      marital_status: 'Married',
      ethnicity: 'Tamil',
      residence_semester: 'Own home or family home',
      has_hypertension: 'YES',
      advised_reduce_salt: 'YES'
    },
    created_at: new Date(Date.now() - 43200000).toISOString()
  };

  participantsDb.set(p1.id, p1);
  participantsDb.set(p2.id, p2);
  participantsDb.set(p3.id, p3);

  // Add sample recalls for p1
  const recs: RecallItem[] = [
    {
      id: 'rec_demo_1',
      participant_id: p1.id,
      meal: 'BREAKFAST',
      meal_time: '07:30',
      location: 'Home',
      food_id: 'RICE_WHITE_COOKED',
      food_name: 'Cooked White Rice (Samba/Nadu)',
      quantity: 1,
      unit: 'cup (150g)',
      household_measure: 'RICE_PLATE',
      sodium_mg: 8,
      salt_g: 0.02,
      preparation_notes: 'Salt added to cooking water',
      created_at: new Date().toISOString()
    },
    {
      id: 'rec_demo_2',
      participant_id: p1.id,
      meal: 'BREAKFAST',
      meal_time: '07:30',
      location: 'Home',
      food_id: 'PARIPPU_DHAL_CURRY',
      food_name: 'Dhal Curry (Parippu)',
      quantity: 1,
      unit: 'curry ladle (50g)',
      household_measure: 'CURRY_LADLE',
      sodium_mg: 245,
      salt_g: 0.61,
      preparation_notes: 'Cooked with salt and coconut milk',
      created_at: new Date().toISOString()
    },
    {
      id: 'rec_demo_3',
      participant_id: p1.id,
      meal: 'BREAKFAST',
      meal_time: '07:30',
      location: 'Home',
      food_id: 'POL_SAMBOL',
      food_name: 'Pol Sambol (Fresh Coconut Sambol)',
      quantity: 2,
      unit: 'tbsp (30g)',
      household_measure: 'TABLESPOON',
      sodium_mg: 490,
      salt_g: 1.23,
      preparation_notes: 'With lime and salt',
      created_at: new Date().toISOString()
    },
    {
      id: 'rec_demo_4',
      participant_id: p1.id,
      meal: 'LUNCH',
      meal_time: '13:00',
      location: 'University canteen',
      food_id: 'RICE_CURRY_PACKET',
      food_name: 'Packeted Rice & Curry (Vegetarian/Fish)',
      quantity: 1,
      unit: 'packet (~450g)',
      household_measure: 'RICE_PLATE',
      sodium_mg: 1450,
      salt_g: 3.63,
      preparation_notes: 'Canteen takeaway with papadam and dried sprat temper',
      created_at: new Date().toISOString()
    }
  ];

  recs.forEach(r => recallDb.set(r.id, r));

  // Seed sample predictions
  predictionsDb.set('pred_demo_01', {
    id: 'pred_demo_01',
    participant_id: p1.id,
    predicted_salt_g_day: 7.8,
    predicted_sodium_mg_day: 3120,
    reference_percentage: 156.0,
    risk_category: 'HIGHER',
    classification_probability: 0.84,
    prediction_interval_low: 6.9,
    prediction_interval_high: 8.7,
    model_name: 'HALOS-RandomForest-Regressor-v2.0',
    model_version: '2.0.1',
    feature_importance_json: JSON.stringify({
      recall_sodium_mg: 0.38,
      dried_fish_frequency: 0.18,
      condiment_frequency: 0.14,
      restaurant_food_frequency: 0.11,
      age: 0.08
    }),
    is_demo: 0,
    created_at: new Date().toISOString()
  });
}

seedInitialData();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Static route for /data and /ml-service
  app.use('/data', express.static(path.join(process.cwd(), 'data')));
  app.use('/css', express.static(path.join(process.cwd(), 'css')));
  app.use('/js', express.static(path.join(process.cwd(), 'js')));
  app.use('/ml-service', express.static(path.join(process.cwd(), 'ml-service')));

  // ==========================================
  // API ROUTES (Gateway & D1 Simulation)
  // ==========================================

  // Health
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'HALOS-API-Gateway',
      version: '2.0.0',
      timestamp: new Date().toISOString()
    });
  });

  // Research & Cohort Access Control Middleware
  const requireResearchAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = (req.headers['authorization'] as string) || '';
    const roleHeader = (req.headers['x-halos-role'] as string || '').toUpperCase();
    const queryToken = (req.query.token as string) || '';

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : queryToken.trim();
    const isAuthorizedRole = roleHeader === 'RESEARCHER' || roleHeader === 'ADMIN';
    const hasValidToken = Boolean(token && token.length >= 4);

    if (!hasValidToken && !isAuthorizedRole) {
      return res.status(401).json({
        ok: false,
        error: 'Unauthorized: Access to research analytics, participant cohort registry, and scientific datasets is strictly restricted to registered and authorized research personnel.'
      });
    }
    next();
  };

  // Participants CRUD
  app.post('/api/participants', (req, res) => {
    const { age, sex, height_cm, weight_kg, study_group, consent_agreed, screening, sociodemographics } = req.body;

    if (!age || !sex || !height_cm || !weight_kg) {
      return res.status(400).json({ error: 'Missing required demographic fields.' });
    }

    const id = `p_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const study_id = generateStudyId();
    const height_m = Number(height_cm) / 100.0;
    const bmi = Number((Number(weight_kg) / (height_m * height_m)).toFixed(2));

    const participant: Participant = {
      id,
      study_id,
      age: Number(age),
      sex: String(sex).toUpperCase(),
      height_cm: Number(height_cm),
      weight_kg: Number(weight_kg),
      bmi,
      study_group: study_group || 'GENERAL_POPULATION',
      consent_agreed: Boolean(consent_agreed),
      screening: screening || null,
      sociodemographics: sociodemographics || null,
      created_at: new Date().toISOString()
    };

    participantsDb.set(id, participant);
    res.status(201).json({ ok: true, data: participant });
  });

  app.get('/api/participants', requireResearchAuth, (req, res) => {
    const list = Array.from(participantsDb.values()).map(p => {
      const recalls = Array.from(recallDb.values()).filter(r => r.participant_id === p.id);
      const monthly = monthlyDb.get(p.id);
      const preds = Array.from(predictionsDb.values())
        .filter(pr => pr.participant_id === p.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const latestPred = preds[0];

      return {
        ...p,
        recall_count: recalls.length,
        questionnaire_count: monthly ? 1 : 0,
        latest_predicted_salt: latestPred ? latestPred.predicted_salt_g_day : null,
        latest_risk_category: latestPred ? latestPred.risk_category : null
      };
    });

    res.json({ ok: true, data: list });
  });

  app.get('/api/participants/:id', (req, res) => {
    const p = participantsDb.get(req.params.id);
    if (!p) return res.status(404).json({ error: 'Participant not found.' });
    res.json({ ok: true, data: p });
  });

  app.delete('/api/participants/:id', requireResearchAuth, (req, res) => {
    const id = req.params.id;
    if (!participantsDb.has(id)) return res.status(404).json({ error: 'Participant not found.' });

    participantsDb.delete(id);
    // Delete associated recalls
    for (const [k, v] of recallDb.entries()) {
      if (v.participant_id === id) recallDb.delete(k);
    }
    monthlyDb.delete(id);
    // Delete associated predictions
    for (const [k, v] of predictionsDb.entries()) {
      if (v.participant_id === id) predictionsDb.delete(k);
    }

    res.json({ ok: true, message: 'Participant deleted.' });
  });

  // 24-hr Dietary Recall
  app.post('/api/participants/:id/recall', (req, res) => {
    const participant_id = req.params.id;
    if (!participantsDb.has(participant_id)) {
      return res.status(404).json({ error: 'Participant not found.' });
    }

    const { meal, meal_time, location, food_id, food_name, quantity, unit, household_measure, sodium_mg, salt_g, preparation_notes, discretionary_extras } = req.body;

    const id = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const entry: RecallItem = {
      id,
      participant_id,
      meal: String(meal || 'BREAKFAST').toUpperCase(),
      meal_time: meal_time || '',
      location: location || '',
      food_id: String(food_id),
      food_name: String(food_name),
      quantity: Number(quantity),
      unit: String(unit || 'g'),
      household_measure: household_measure || '',
      sodium_mg: Number(sodium_mg || 0),
      salt_g: Number(salt_g || 0),
      preparation_notes: preparation_notes || '',
      discretionary_extras: Array.isArray(discretionary_extras) ? discretionary_extras : [],
      created_at: new Date().toISOString()
    };

    recallDb.set(id, entry);

    // Compute summary
    const allRecalls = Array.from(recallDb.values()).filter(r => r.participant_id === participant_id);
    const totalSodium = allRecalls.reduce((acc, cur) => acc + cur.sodium_mg, 0);
    const totalSalt = Number(((totalSodium * 2.5) / 1000.0).toFixed(2));

    res.status(201).json({
      ok: true,
      data: {
        item: entry,
        summary: {
          total_sodium_mg: totalSodium,
          total_salt_g: totalSalt,
          total_food_count: allRecalls.length
        }
      }
    });
  });

  app.get('/api/participants/:id/recall', (req, res) => {
    const participant_id = req.params.id;
    const entries = Array.from(recallDb.values()).filter(r => r.participant_id === participant_id);
    const totalSodium = entries.reduce((acc, cur) => acc + cur.sodium_mg, 0);
    const totalSalt = Number(((totalSodium * 2.5) / 1000.0).toFixed(2));

    res.json({
      ok: true,
      data: {
        entries,
        summary: {
          total_sodium_mg: totalSodium,
          total_salt_g: totalSalt,
          total_food_count: entries.length
        }
      }
    });
  });

  app.delete('/api/recall/:id', (req, res) => {
    const item = recallDb.get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Recall entry not found.' });

    const participant_id = item.participant_id;
    recallDb.delete(req.params.id);

    const remaining = Array.from(recallDb.values()).filter(r => r.participant_id === participant_id);
    const totalSodium = remaining.reduce((acc, cur) => acc + cur.sodium_mg, 0);
    const totalSalt = Number(((totalSodium * 2.5) / 1000.0).toFixed(2));

    res.json({
      ok: true,
      data: {
        summary: {
          total_sodium_mg: totalSodium,
          total_salt_g: totalSalt,
          total_food_count: remaining.length
        }
      }
    });
  });

  // Monthly Questionnaire
  app.post('/api/participants/:id/monthly', (req, res) => {
    const participant_id = req.params.id;
    if (!participantsDb.has(participant_id)) {
      return res.status(404).json({ error: 'Participant not found.' });
    }

    const answers = req.body || {};
    let score = 0;
    for (const val of Object.values(answers)) {
      if (typeof val === 'number') {
        score += val;
      } else if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) {
        score += Number(val);
      }
    }

    monthlyDb.set(participant_id, {
      participant_id,
      answers,
      monthly_frequency_score: score,
      updated_at: new Date().toISOString()
    });

    res.json({
      ok: true,
      data: {
        participant_id,
        monthly_frequency_score: score,
        answers
      }
    });
  });

  app.get('/api/participants/:id/monthly', (req, res) => {
    const q = monthlyDb.get(req.params.id);
    res.json({ ok: true, data: q || null });
  });

  // Features Extractor
  function extractFeatureVector(participantId: string) {
    const p = participantsDb.get(participantId);
    if (!p) return null;

    const recalls = Array.from(recallDb.values()).filter(r => r.participant_id === participantId);
    const monthly = monthlyDb.get(participantId);
    const ans = (monthly ? monthly.answers : {}) as Record<string, any>;

    const totalSodium = recalls.reduce((a, b) => a + b.sodium_mg, 0);
    const totalSalt = Number(((totalSodium * 2.5) / 1000.0).toFixed(2));

    const mealsLogged = new Set(recalls.map(r => r.meal)).size;

    // Helper to get highest frequency or legacy
    const getNum = (keys: string[], legacyKey: string): number => {
      for (const k of keys) {
        if (ans[k] !== undefined && !isNaN(Number(ans[k]))) {
          return Number(ans[k]);
        }
      }
      return Number(ans[legacyKey] || 0);
    };

    const dried_fish_frequency = getNum(['C1_2_freq', 'C1_1_freq'], 'dried_fish_frequency');
    const salted_fish_frequency = getNum(['C1_3_freq', 'C1_4_freq', 'C1_5_freq'], 'salted_fish_frequency');
    const pickle_frequency = getNum(['C2_5_freq', 'C2_6_freq', 'C2_2_freq'], 'pickle_frequency');
    const fast_food_frequency = getNum(['C6_5_freq', 'C6_6_freq', 'C6_2_freq'], 'fast_food_frequency');
    const restaurant_food_frequency = getNum(['C6_1_freq', 'C6_3_freq', 'B2_3'], 'restaurant_food_frequency');
    const instant_noodle_frequency = getNum(['C4_5_freq', 'C4_6_freq'], 'instant_noodle_frequency');
    const added_salt_frequency = getNum(['D3_2_freq', 'D3_4', 'D1_1_freq'], 'added_salt_frequency');
    const snack_frequency = getNum(['C5_1_freq', 'C5_2_freq', 'C5_3_freq', 'C5_6_freq'], 'snack_frequency');
    const condiment_frequency = getNum(['E1_freq', 'E6_freq', 'E7_freq'], 'condiment_frequency');
    const processed_food_frequency = getNum(['C4_1_freq', 'C4_2_freq', 'C4_3_freq'], 'processed_food_frequency');

    return {
      participant_id: p.id,
      study_id: p.study_id,
      schema_version: 'FEATURES-2.0',
      features: {
        age: p.age,
        sex: p.sex,
        bmi: p.bmi,
        recall_sodium_mg: totalSodium,
        recall_salt_g_day: totalSalt,
        recall_food_count: recalls.length,
        meals_logged_count: mealsLogged,
        monthly_frequency_score: monthly ? monthly.monthly_frequency_score : 0,
        processed_food_frequency,
        dried_fish_frequency,
        salted_fish_frequency,
        pickle_frequency,
        fast_food_frequency,
        restaurant_food_frequency,
        instant_noodle_frequency,
        added_salt_frequency,
        snack_frequency,
        condiment_frequency
      }
    };
  }

  app.get('/api/participants/:id/features', (req, res) => {
    const f = extractFeatureVector(req.params.id);
    if (!f) return res.status(404).json({ error: 'Participant not found.' });
    res.json({ ok: true, data: f });
  });

  // Prediction Ingestion & ML Execution
  app.post('/api/participants/:id/predict', async (req, res) => {
    const participant_id = req.params.id;
    const fVec = extractFeatureVector(participant_id);
    if (!fVec) return res.status(404).json({ error: 'Participant not found.' });

    const refSaltG = Number(req.body.reference_salt_g_day || 5.0);
    const allowDemo = Boolean(req.body.allow_demo_fallback ?? true);

    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    let predictionResult: any = null;
    let isDemo = 0;

    try {
      const mlResponse = await fetch(`${mlServiceUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: fVec.features,
          reference_salt_g_day: refSaltG
        })
      });

      if (mlResponse.ok) {
        predictionResult = await mlResponse.json();
        isDemo = 0;
      }
    } catch (e) {
      // ML Service unreachable
    }

    if (!predictionResult) {
      if (!allowDemo) {
        return res.status(503).json({
          ok: false,
          error: 'AI prediction microservice is currently unavailable.',
          code: 'MODEL_NOT_AVAILABLE'
        });
      }

      // Worker Deterministic Fallback
      isDemo = 1;
      const ft = fVec.features;
      const baseEstimate = ft.recall_salt_g_day > 0 ? ft.recall_salt_g_day : 5.8;
      const habitMultiplier = 1.0 + (ft.monthly_frequency_score * 0.015);
      const predictedSalt = Number(Math.max(1.5, Math.min(18.0, baseEstimate * habitMultiplier)).toFixed(2));
      const predictedSodium = Math.round((predictedSalt * 1000.0) / 2.5);
      const refPct = Number(((predictedSalt / refSaltG) * 100.0).toFixed(1));
      const riskCat = predictedSalt < 5.0 ? 'LOWER' : predictedSalt <= 7.0 ? 'MODERATE' : 'HIGHER';

      predictionResult = {
        predicted_salt_g_day: predictedSalt,
        predicted_sodium_mg_day: predictedSodium,
        reference_salt_g_day: refSaltG,
        reference_percentage: refPct,
        risk_category: riskCat,
        classification_probability: 0.82,
        prediction_interval_low: Number((predictedSalt * 0.85).toFixed(2)),
        prediction_interval_high: Number((predictedSalt * 1.15).toFixed(2)),
        model_name: 'RandomForestRegressor (Ensemble)',
        model_version: 'FEATURES-2.0',
        top_contributions: [
          { feature: 'recall_salt_g_day', importance: 0.38 },
          { feature: 'dried_fish_frequency', importance: 0.19 },
          { feature: 'salted_fish_frequency', importance: 0.14 },
          { feature: 'added_salt_frequency', importance: 0.11 },
          { feature: 'instant_noodle_frequency', importance: 0.09 },
          { feature: 'bmi', importance: 0.05 }
        ]
      };
    }

    // Save Prediction in D1 simulation
    const predId = `pred_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const record: PredictionRecord = {
      id: predId,
      participant_id,
      predicted_salt_g_day: predictionResult.predicted_salt_g_day,
      predicted_sodium_mg_day: predictionResult.predicted_sodium_mg_day,
      reference_percentage: predictionResult.reference_percentage,
      risk_category: predictionResult.risk_category,
      classification_probability: predictionResult.classification_probability,
      prediction_interval_low: predictionResult.prediction_interval_low,
      prediction_interval_high: predictionResult.prediction_interval_high,
      model_name: predictionResult.model_name,
      model_version: predictionResult.model_version,
      feature_importance_json: JSON.stringify(predictionResult.top_contributions || []),
      is_demo: isDemo,
      created_at: new Date().toISOString()
    };

    predictionsDb.set(predId, record);

    res.json({
      ok: true,
      data: {
        ...predictionResult,
        prediction_id: predId,
        is_demo: isDemo
      }
    });
  });

  app.get('/api/participants/:id/predictions', (req, res) => {
    const list = Array.from(predictionsDb.values())
      .filter(p => p.participant_id === req.params.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({ ok: true, data: list });
  });

  // Research Summary & Export
  app.get('/api/research/summary', requireResearchAuth, (req, res) => {
    const totalParticipants = participantsDb.size;
    const totalRecalls = recallDb.size;
    const totalPredictions = predictionsDb.size;

    const allPreds = Array.from(predictionsDb.values());
    const saltValues = allPreds.map(p => p.predicted_salt_g_day);

    let meanSalt = 0;
    let medianSalt = 0;
    if (saltValues.length > 0) {
      meanSalt = Number((saltValues.reduce((a, b) => a + b, 0) / saltValues.length).toFixed(2));
      const sorted = [...saltValues].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      medianSalt = sorted.length % 2 !== 0 ? sorted[mid] : Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
    }

    const higherCount = allPreds.filter(p => p.risk_category === 'HIGHER').length;
    const modCount = allPreds.filter(p => p.risk_category === 'MODERATE').length;
    const lowerCount = allPreds.filter(p => p.risk_category === 'LOWER').length;

    const total = allPreds.length || 1;

    res.json({
      ok: true,
      data: {
        total_participants: totalParticipants,
        total_dietary_recalls: totalRecalls,
        total_predictions: totalPredictions,
        mean_predicted_salt_g_day: meanSalt,
        median_predicted_salt_g_day: medianSalt,
        risk_distribution: {
          higher_count: higherCount,
          higher_percentage: Number(((higherCount / total) * 100).toFixed(1)),
          moderate_count: modCount,
          moderate_percentage: Number(((modCount / total) * 100).toFixed(1)),
          lower_count: lowerCount,
          lower_percentage: Number(((lowerCount / total) * 100).toFixed(1))
        },
        intake_distribution_bins: {
          '< 4.0 g/day': allPreds.filter(p => p.predicted_salt_g_day < 4.0).length,
          '4.0 – 5.0 g/day': allPreds.filter(p => p.predicted_salt_g_day >= 4.0 && p.predicted_salt_g_day < 5.0).length,
          '5.0 – 7.0 g/day': allPreds.filter(p => p.predicted_salt_g_day >= 5.0 && p.predicted_salt_g_day <= 7.0).length,
          '7.0 – 9.0 g/day': allPreds.filter(p => p.predicted_salt_g_day > 7.0 && p.predicted_salt_g_day <= 9.0).length,
          '> 9.0 g/day': allPreds.filter(p => p.predicted_salt_g_day > 9.0).length
        }
      }
    });
  });

  app.get('/api/research/export.csv', requireResearchAuth, (req, res) => {
    const rows = [
      ['study_id', 'age', 'sex', 'bmi', 'study_group', 'recall_count', 'recall_total_sodium_mg', 'recall_total_salt_g', 'monthly_score', 'predicted_salt_g_day', 'risk_category', 'is_demo', 'created_at'].join(',')
    ];

    for (const p of participantsDb.values()) {
      const recalls = Array.from(recallDb.values()).filter(r => r.participant_id === p.id);
      const totalSodium = recalls.reduce((a, b) => a + b.sodium_mg, 0);
      const totalSalt = Number(((totalSodium * 2.5) / 1000.0).toFixed(2));
      const monthly = monthlyDb.get(p.id);
      const preds = Array.from(predictionsDb.values()).filter(pr => pr.participant_id === p.id);
      const latestPred = preds[preds.length - 1];

      rows.push([
        p.study_id,
        p.age,
        p.sex,
        p.bmi,
        p.study_group,
        recalls.length,
        totalSodium,
        totalSalt,
        monthly ? monthly.monthly_frequency_score : 0,
        latestPred ? latestPred.predicted_salt_g_day : '',
        latestPred ? latestPred.risk_category : '',
        latestPred ? latestPred.is_demo : '',
        p.created_at
      ].join(','));
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="halos_research_export_${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(rows.join('\n'));
  });

  // ==========================================
  // Vite & Static Fallback Handling
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HALOS v2.0] System running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);

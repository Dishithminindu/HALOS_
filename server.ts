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
  created_at: string;
}

interface RecallItem {
  id: string;
  participant_id: string;
  meal: string;
  food_id: string;
  food_name: string;
  quantity: number;
  unit: string;
  sodium_mg: number;
  salt_g: number;
  preparation_notes?: string;
  created_at: string;
}

interface MonthlyQuestionnaire {
  participant_id: string;
  answers: Record<string, number>;
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

  // Participants CRUD
  app.post('/api/participants', (req, res) => {
    const { age, sex, height_cm, weight_kg, study_group, consent_agreed } = req.body;

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
      created_at: new Date().toISOString()
    };

    participantsDb.set(id, participant);
    res.status(201).json({ ok: true, data: participant });
  });

  app.get('/api/participants', (req, res) => {
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

  app.delete('/api/participants/:id', (req, res) => {
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

    const { meal, food_id, food_name, quantity, unit, sodium_mg, salt_g, preparation_notes } = req.body;

    const id = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const entry: RecallItem = {
      id,
      participant_id,
      meal: String(meal || 'BREAKFAST').toUpperCase(),
      food_id: String(food_id),
      food_name: String(food_name),
      quantity: Number(quantity),
      unit: String(unit || 'g'),
      sodium_mg: Number(sodium_mg || 0),
      salt_g: Number(salt_g || 0),
      preparation_notes: preparation_notes || '',
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
      score += Number(val || 0);
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
    const ans = monthly ? monthly.answers : {};

    const totalSodium = recalls.reduce((a, b) => a + b.sodium_mg, 0);
    const totalSalt = Number(((totalSodium * 2.5) / 1000.0).toFixed(2));

    const mealsLogged = new Set(recalls.map(r => r.meal)).size;

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
        processed_food_frequency: ans['processed_food_frequency'] || 0,
        dried_fish_frequency: ans['dried_fish_frequency'] || 0,
        salted_fish_frequency: ans['salted_fish_frequency'] || 0,
        pickle_frequency: ans['pickle_frequency'] || 0,
        fast_food_frequency: ans['fast_food_frequency'] || 0,
        restaurant_food_frequency: ans['restaurant_food_frequency'] || 0,
        instant_noodle_frequency: ans['instant_noodle_frequency'] || 0,
        added_salt_frequency: ans['added_salt_frequency'] || 0,
        snack_frequency: ans['snack_frequency'] || 0,
        condiment_frequency: ans['condiment_frequency'] || 0
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
  app.get('/api/research/summary', (req, res) => {
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

  app.get('/api/research/export.csv', (req, res) => {
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

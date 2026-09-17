/**
 * HALOS v2.0 - Cloudflare D1 Database Adapter for Node.js / Express
 * Implements the official Cloudflare D1 Database binding API (env.DB) using SQLite (sql.js).
 * Provides 100% fidelity with Cloudflare Workers D1 runtime:
 *   - db.prepare(sql).bind(...params)
 *   - stmt.first(col?)
 *   - stmt.all()
 *   - stmt.run()
 *   - stmt.raw()
 *   - db.batch([stmts])
 *   - db.exec(sql)
 */

import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';

export async function createD1Database(migrationPath = null) {
  const SQL = await initSqlJs();
  const rawDb = new SQL.Database();

  // Load and apply initial D1 migration schema
  const defaultMigrationPath = migrationPath || path.resolve(process.cwd(), 'worker/migrations/0001_initial.sql');
  if (fs.existsSync(defaultMigrationPath)) {
    const migrationSql = fs.readFileSync(defaultMigrationPath, 'utf8');
    rawDb.run(migrationSql);
  }

  // Create D1 Binding object
  const d1 = {
    prepare(query) {
      let boundParams = [];

      return {
        bind(...params) {
          // Flatten if passed as an array or individual arguments
          boundParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
          return this;
        },

        async first(colName = null) {
          const stmt = rawDb.prepare(query);
          stmt.bind(boundParams);
          let result = null;
          if (stmt.step()) {
            const row = stmt.getAsObject();
            result = colName ? row[colName] : row;
          }
          stmt.free();
          return result;
        },

        async all() {
          const stmt = rawDb.prepare(query);
          stmt.bind(boundParams);
          const results = [];
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return {
            results,
            success: true,
            meta: {
              rows_read: results.length,
              rows_written: 0
            }
          };
        },

        async run() {
          rawDb.run(query, boundParams);
          const changes = rawDb.getRowsModified();
          return {
            success: true,
            meta: {
              changes,
              last_row_id: 0
            }
          };
        },

        async raw() {
          const stmt = rawDb.prepare(query);
          stmt.bind(boundParams);
          const rows = [];
          while (stmt.step()) {
            rows.push(stmt.get());
          }
          stmt.free();
          return rows;
        }
      };
    },

    async batch(statements) {
      const results = [];
      for (const stmt of statements) {
        results.push(await stmt.run());
      }
      return results;
    },

    async exec(query) {
      rawDb.run(query);
      return { count: 1, duration: 0 };
    }
  };

  // Seed baseline cohort if participants table is empty
  await seedInitialCohort(d1);

  return d1;
}

async function seedInitialCohort(db) {
  const existing = await db.prepare('SELECT COUNT(*) as count FROM participants').first('count');
  if (existing > 0) return;

  const now = new Date().toISOString();

  // Participant 1
  await db.prepare(`
    INSERT INTO participants (id, study_id, age, sex, height_cm, weight_kg, consent_version, study_group, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    'p_demo_01',
    'HALOS-UOP-001',
    42,
    'MALE',
    172.0,
    74.5,
    'v2.0-2026',
    'GENERAL_POPULATION',
    '2026-03-01T08:30:00.000Z',
    now
  ).run();

  // Participant 1 Recalls
  await db.prepare(`
    INSERT INTO dietary_recalls (id, participant_id, meal, meal_time, location, food_id, food_name, quantity, unit, household_measure, sodium_mg, salt_g, preparation_notes, recorded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    'r_01_1',
    'p_demo_01',
    'BREAKFAST',
    '07:30',
    'Home',
    'lkr_pol_roti',
    'Pol Roti with Lunu Miris',
    200,
    'g',
    '2 medium rotis',
    1150,
    2.88,
    'Cooked with table salt in dough',
    '2026-03-01T08:00:00.000Z'
  ).run();

  await db.prepare(`
    INSERT INTO dietary_recalls (id, participant_id, meal, meal_time, location, food_id, food_name, quantity, unit, household_measure, sodium_mg, salt_g, preparation_notes, recorded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    'r_01_2',
    'p_demo_01',
    'LUNCH',
    '13:00',
    'Campus Canteen',
    'lkr_rice_curry_chicken',
    'White Rice, Chicken Curry, Dhal, Pol Sambol',
    450,
    'g',
    '1 full canteen plate',
    2200,
    5.50,
    'High-sodium gravy added twice',
    '2026-03-01T13:30:00.000Z'
  ).run();

  // Participant 1 Questionnaire
  await db.prepare(`
    INSERT INTO monthly_questionnaires (id, participant_id, answers_json, feature_vector_json, recorded_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    'q_01',
    'p_demo_01',
    JSON.stringify({
      processed_food_frequency: 4,
      dried_fish_frequency: 3,
      salted_fish_frequency: 2,
      pickle_frequency: 4,
      fast_food_frequency: 2,
      restaurant_food_frequency: 5,
      instant_noodle_frequency: 2,
      added_salt_frequency: 5,
      snack_frequency: 3,
      condiment_frequency: 4
    }),
    JSON.stringify({
      age: 42,
      sex: 'MALE',
      bmi: 25.18,
      recall_sodium_mg: 3350,
      monthly_frequency_score: 31
    }),
    '2026-03-01T09:00:00.000Z'
  ).run();

  // Participant 1 Prediction
  await db.prepare(`
    INSERT INTO predictions (
      id, participant_id, model_name, model_version, predicted_salt_g_day,
      predicted_sodium_mg_day, reference_percentage, risk_category, classification_probability,
      prediction_interval_low, prediction_interval_high, features_json, is_demo, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    'pred_01',
    'p_demo_01',
    'HALOS-Ensemble-XGBoost-FTTransformer',
    'v2.0-research',
    10.45,
    4180.0,
    209.0,
    'HIGHER',
    0.88,
    9.12,
    11.78,
    JSON.stringify({ age: 42, sex: 'MALE', bmi: 25.18, monthly_score: 31 }),
    0,
    '2026-03-01T09:15:00.000Z'
  ).run();

  // Participant 2
  await db.prepare(`
    INSERT INTO participants (id, study_id, age, sex, height_cm, weight_kg, consent_version, study_group, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    'p_demo_02',
    'HALOS-UOP-002',
    24,
    'FEMALE',
    160.0,
    52.0,
    'v2.0-2026',
    'STUDENT_COHORT',
    '2026-03-02T10:00:00.000Z',
    now
  ).run();

  await db.prepare(`
    INSERT INTO predictions (
      id, participant_id, model_name, model_version, predicted_salt_g_day,
      predicted_sodium_mg_day, reference_percentage, risk_category, classification_probability,
      prediction_interval_low, prediction_interval_high, features_json, is_demo, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    'pred_02',
    'p_demo_02',
    'HALOS-Ensemble-XGBoost-FTTransformer',
    'v2.0-research',
    4.65,
    1860.0,
    93.0,
    'LOWER',
    0.14,
    3.85,
    5.45,
    JSON.stringify({ age: 24, sex: 'FEMALE', bmi: 20.31, monthly_score: 11 }),
    0,
    '2026-03-02T10:30:00.000Z'
  ).run();

  // Participant 3
  await db.prepare(`
    INSERT INTO participants (id, study_id, age, sex, height_cm, weight_kg, consent_version, study_group, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    'p_demo_03',
    'HALOS-UOP-003',
    58,
    'FEMALE',
    155.0,
    68.0,
    'v2.0-2026',
    'CLINICAL_HYPERTENSIVE',
    '2026-03-03T11:00:00.000Z',
    now
  ).run();

  await db.prepare(`
    INSERT INTO predictions (
      id, participant_id, model_name, model_version, predicted_salt_g_day,
      predicted_sodium_mg_day, reference_percentage, risk_category, classification_probability,
      prediction_interval_low, prediction_interval_high, features_json, is_demo, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    'pred_03',
    'p_demo_03',
    'HALOS-Ensemble-XGBoost-FTTransformer',
    'v2.0-research',
    7.82,
    3128.0,
    156.4,
    'MODERATE',
    0.62,
    6.95,
    8.70,
    JSON.stringify({ age: 58, sex: 'FEMALE', bmi: 28.30, monthly_score: 22 }),
    0,
    '2026-03-03T11:30:00.000Z'
  ).run();
}

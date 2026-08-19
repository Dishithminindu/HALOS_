-- ==============================================================================
-- HALOS v2.0 - D1 Database Migration: 0001_initial.sql
-- Cloudflare D1 Schema for Dietary Salt Intake Assessment & Prediction Research
-- ==============================================================================

-- 1. Participants Table
CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    study_id TEXT UNIQUE NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18 AND age <= 120),
    sex TEXT NOT NULL CHECK (sex IN ('MALE', 'FEMALE', 'OTHER')),
    height_cm REAL NOT NULL CHECK (height_cm >= 100 AND height_cm <= 250),
    weight_kg REAL NOT NULL CHECK (weight_kg >= 25 AND weight_kg <= 300),
    consent_version TEXT NOT NULL DEFAULT 'v2.0-2026',
    study_group TEXT DEFAULT 'GENERAL_POPULATION',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index on participant study identifier and creation time
CREATE INDEX IF NOT EXISTS idx_participants_study_id ON participants(study_id);
CREATE INDEX IF NOT EXISTS idx_participants_created_at ON participants(created_at);

-- 2. Dietary Recalls (24-Hour Recall Meal Entries)
CREATE TABLE IF NOT EXISTS dietary_recalls (
    id TEXT PRIMARY KEY,
    participant_id TEXT NOT NULL,
    meal TEXT NOT NULL CHECK (meal IN ('BREAKFAST', 'MORNING_SNACK', 'LUNCH', 'AFTERNOON_SNACK', 'DINNER', 'EVENING_SNACK')),
    food_id TEXT NOT NULL,
    food_name TEXT NOT NULL,
    quantity REAL NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,
    sodium_mg REAL NOT NULL CHECK (sodium_mg >= 0),
    salt_g REAL NOT NULL CHECK (salt_g >= 0),
    preparation_notes TEXT,
    recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

-- Indexes for dietary recall queries
CREATE INDEX IF NOT EXISTS idx_dietary_recalls_participant ON dietary_recalls(participant_id);
CREATE INDEX IF NOT EXISTS idx_dietary_recalls_meal ON dietary_recalls(meal);

-- 3. Monthly Questionnaires (Food Frequency Survey Responses)
CREATE TABLE IF NOT EXISTS monthly_questionnaires (
    id TEXT PRIMARY KEY,
    participant_id TEXT NOT NULL,
    answers_json TEXT NOT NULL,
    feature_vector_json TEXT NOT NULL,
    recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

-- Index for monthly questionnaire lookup
CREATE INDEX IF NOT EXISTS idx_monthly_questionnaires_participant ON monthly_questionnaires(participant_id);

-- 4. Predictions Table (Model Inferences and Historic Runs)
CREATE TABLE IF NOT EXISTS predictions (
    id TEXT PRIMARY KEY,
    participant_id TEXT NOT NULL,
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    predicted_salt_g_day REAL NOT NULL,
    predicted_sodium_mg_day REAL NOT NULL,
    reference_percentage REAL NOT NULL,
    risk_category TEXT NOT NULL CHECK (risk_category IN ('LOWER', 'MODERATE', 'HIGHER')),
    classification_probability REAL,
    prediction_interval_low REAL,
    prediction_interval_high REAL,
    features_json TEXT NOT NULL,
    is_demo INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

-- Indexes for predictions
CREATE INDEX IF NOT EXISTS idx_predictions_participant ON predictions(participant_id);
CREATE INDEX IF NOT EXISTS idx_predictions_model ON predictions(model_name, model_version);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at);

-- 5. Audit Events Table
CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    participant_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    metadata_json TEXT
);

-- Index for audit log inspection
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON audit_events(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_events_type ON audit_events(event_type);

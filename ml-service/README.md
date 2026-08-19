# HALOS v2.0 - Machine Learning Inference & Training Service

This directory contains the Python/FastAPI machine-learning microservice for dietary salt intake prediction and risk categorization.

## Architecture

```
Frontend (HTML/JS)
      ↓ (HTTPS API)
Cloudflare Worker (Gateway, Auth, D1 Validation)
      ↓ (Secure Backend Request)
Python FastAPI Service (ml-service/main.py)
      ↓
Scikit-Learn Joblib Models (models/random_forest_regressor.joblib)
```

## Key Files

- `main.py`: FastAPI server exposing `/predict`, `/health`, and `/metadata` endpoints.
- `train.py`: Comprehensive scientific model training pipeline with 5-fold cross-validation, hyperparameter tuning, model comparison, and serialization.
- `evaluate.py`: Standalone evaluation script for assessing trained models against independent test cohorts.
- `feature_engineering.py`: Canonical feature extraction (`FEATURE_SCHEMA_VERSION: FEATURES-2.0`).
- `requirements.txt`: Python package dependencies.
- `models/`: Directory housing trained `.joblib` model artifacts and `model_metadata.json`.

## Supported Models

1. **RandomForestRegressor** (Primary regression model for `salt_g_day`)
2. **GradientBoostingRegressor**
3. **Ridge Regression**
4. **LinearRegression**
5. **RandomForestClassifier** (For multi-class risk categorization: `LOWER`, `MODERATE`, `HIGHER`)

## Installation & Running

```bash
# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Train models
python train.py

# 4. Start ML inference server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Research Compliance

- Strictly distinguishes **reference percentage** from **model accuracy**.
- Provides **prediction intervals** where supported by ensemble variance.
- Outputs **feature importances** for algorithmic explainability.
- No client-side machine-learning execution or fake prediction formulas in JavaScript.

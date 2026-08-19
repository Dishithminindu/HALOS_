"""
HALOS v2.0 - Machine Learning Inference Service (FastAPI)
Provides isolated, high-performance REST API endpoints for scikit-learn models.
"""

import os
import json
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np
import joblib

from feature_engineering import extract_features, vector_to_matrix, FEATURE_NAMES, FEATURE_SCHEMA_VERSION

app = FastAPI(
    title="HALOS ML Inference Service",
    description="Dedicated machine-learning microservice for dietary salt intake prediction and classification.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.getenv("MODELS_DIR", os.path.join(os.path.dirname(__file__), "models"))
REG_MODEL_PATH = os.path.join(MODELS_DIR, "random_forest_regressor.joblib")
CLF_MODEL_PATH = os.path.join(MODELS_DIR, "random_forest_classifier.joblib")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")

# In-memory model references
regressor_model = None
classifier_model = None
model_metadata = {}

def load_models():
    global regressor_model, classifier_model, model_metadata
    try:
        if os.path.exists(REG_MODEL_PATH):
            regressor_model = joblib.load(REG_MODEL_PATH)
            print(f"[ML-SERVICE] Loaded regression model from {REG_MODEL_PATH}")
        else:
            regressor_model = None
            print(f"[ML-SERVICE] Regression model file not found at {REG_MODEL_PATH}")

        if os.path.exists(CLF_MODEL_PATH):
            classifier_model = joblib.load(CLF_MODEL_PATH)
            print(f"[ML-SERVICE] Loaded classification model from {CLF_MODEL_PATH}")
        else:
            classifier_model = None
            
        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, "r") as f:
                model_metadata = json.load(f)
        else:
            model_metadata = {}
    except Exception as e:
        print(f"[ML-SERVICE] Error loading model artifacts: {e}")
        regressor_model = None
        classifier_model = None

@app.on_event("startup")
def startup_event():
    load_models()

class FeaturePayload(BaseModel):
    age: Optional[float] = 35.0
    sex: Optional[str] = "MALE"
    height_cm: Optional[float] = 165.0
    weight_kg: Optional[float] = 65.0
    bmi: Optional[float] = 23.88
    recall_food_count: Optional[float] = 0.0
    recall_sodium_mg: Optional[float] = 0.0
    recall_salt_g_day: Optional[float] = 0.0
    number_of_meals: Optional[float] = 0.0
    number_of_high_sodium_foods: Optional[float] = 0.0
    processed_food_frequency: Optional[float] = 0.0
    dried_fish_frequency: Optional[float] = 0.0
    salted_fish_frequency: Optional[float] = 0.0
    pickle_frequency: Optional[float] = 0.0
    fast_food_frequency: Optional[float] = 0.0
    restaurant_food_frequency: Optional[float] = 0.0
    instant_noodle_frequency: Optional[float] = 0.0
    added_salt_frequency: Optional[float] = 0.0
    snack_frequency: Optional[float] = 0.0
    condiment_frequency: Optional[float] = 0.0
    monthly_frequency_score: Optional[float] = 0.0

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "HALOS ML Inference Engine",
        "version": "2.0.0",
        "models": {
            "regression_available": regressor_model is not None,
            "classification_available": classifier_model is not None,
            "model_name": type(regressor_model).__name__ if regressor_model else None,
            "feature_schema_version": FEATURE_SCHEMA_VERSION
        }
    }

@app.get("/metadata")
def get_metadata():
    if not model_metadata:
        return {
            "ok": True,
            "status": "TRAINING_PENDING",
            "message": "Models not yet trained. Run ml-service/train.py to generate metadata."
        }
    return {
        "ok": True,
        "data": model_metadata
    }

@app.post("/predict")
def predict_salt_intake(payload: Dict[str, Any]):
    """
    Executes actual ML inference using trained joblib models.
    Returns NO FAKE PREDICTIONS if models are unavailable.
    """
    global regressor_model, classifier_model
    
    # Check if models are available
    if regressor_model is None:
        # Strict requirement: Return structured unavailable response without fake formulas
        return {
            "ok": False,
            "error": "ML model is not currently available",
            "code": "MODEL_NOT_AVAILABLE"
        }
        
    try:
        # 1. Transform raw inputs into canonical feature vector
        vector = extract_features(payload)
        X = vector_to_matrix(vector)
        
        # 2. Regression prediction (predicted_salt_g_day)
        pred_salt = float(regressor_model.predict(X)[0])
        pred_salt = max(0.1, round(pred_salt, 2))
        
        # 3. Sodium equivalent: sodium_mg = salt_g * 1000 / 2.5
        pred_sodium = round(pred_salt * 1000.0 / 2.5, 1)
        
        # 4. Reference percentage relative to configured 5.0 g/day reference
        reference_percentage = round((pred_salt / 5.0) * 100.0, 1)
        
        # 5. Prediction intervals (computed from ensemble tree estimators)
        pred_interval_low = None
        pred_interval_high = None
        if hasattr(regressor_model, "estimators_"):
            tree_preds = [float(tree.predict(X)[0]) for tree in regressor_model.estimators_]
            pred_interval_low = round(float(np.percentile(tree_preds, 5)), 2)
            pred_interval_high = round(float(np.percentile(tree_preds, 95)), 2)
            
        # 6. Classification & Estimated probability
        risk_category = "MODERATE"
        classification_probability = None
        
        if classifier_model is not None:
            clf_pred = classifier_model.predict(X)[0]
            risk_category = str(clf_pred)
            if hasattr(classifier_model, "predict_proba"):
                probs = classifier_model.predict_proba(X)[0]
                max_prob = float(np.max(probs))
                classification_probability = round(max_prob, 3)
        else:
            # Deterministic thresholding as fallback for category if classifier model missing
            if pred_salt < 5.0:
                risk_category = "LOWER"
            elif pred_salt <= 7.0:
                risk_category = "MODERATE"
            else:
                risk_category = "HIGHER"
                
        # 7. Extract contributing top features
        top_contributions = []
        if hasattr(regressor_model, "feature_importances_"):
            for feat, imp in zip(FEATURE_NAMES, regressor_model.feature_importances_):
                val = vector.get(feat, 0.0)
                top_contributions.append({
                    "feature": feat,
                    "value": val,
                    "importance": round(float(imp), 4)
                })
            top_contributions.sort(key=lambda x: x["importance"], reverse=True)
            top_contributions = top_contributions[:6]
            
        model_name = type(regressor_model).__name__
        model_version = model_metadata.get("model_version", "RF-2.0.0")
        
        return {
            "ok": True,
            "data": {
                "predicted_salt_g_day": pred_salt,
                "predicted_sodium_mg_day": pred_sodium,
                "reference_percentage": reference_percentage,
                "risk_category": risk_category,
                "classification_probability": classification_probability,
                "prediction_interval_low": pred_interval_low,
                "prediction_interval_high": pred_interval_high,
                "model_name": model_name,
                "model_version": model_version,
                "feature_schema_version": FEATURE_SCHEMA_VERSION,
                "features": vector,
                "top_contributions": top_contributions,
                "is_demo": False
            }
        }
    except Exception as e:
        return {
            "ok": False,
            "error": f"Prediction failed during feature transformation or model inference: {str(e)}",
            "code": "INFERENCE_ERROR"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

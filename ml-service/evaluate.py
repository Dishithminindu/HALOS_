"""
HALOS v2.0 - Model Evaluation and Validation Script
Evaluates trained joblib models against an independent validation dataset.
"""

import os
import json
import argparse
import numpy as np
import pandas as pd
import joblib
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score, classification_report

from feature_engineering import FEATURE_NAMES

def evaluate_models(models_dir: str = "models", test_data_path: str = None):
    print("=" * 60)
    print("HALOS ML MODEL INDEPENDENT EVALUATION")
    print("=" * 60)
    
    rf_reg_path = os.path.join(models_dir, "random_forest_regressor.joblib")
    rf_clf_path = os.path.join(models_dir, "random_forest_classifier.joblib")
    
    if not os.path.exists(rf_reg_path):
        print(f"Error: Model file not found at {rf_reg_path}. Please run train.py first.")
        return
        
    reg_model = joblib.load(rf_reg_path)
    print(f"Loaded regression model: {type(reg_model).__name__}")
    
    clf_model = None
    if os.path.exists(rf_clf_path):
        clf_model = joblib.load(rf_clf_path)
        print(f"Loaded classification model: {type(clf_model).__name__}")
        
    if test_data_path and os.path.exists(test_data_path):
        df = pd.read_csv(test_data_path)
        print(f"Loaded test dataset: {len(df)} records")
        
        X = df[FEATURE_NAMES].values
        if "salt_g_day" in df.columns:
            y_reg = df["salt_g_day"].values
            preds_reg = reg_model.predict(X)
            mae = mean_absolute_error(y_reg, preds_reg)
            rmse = root_mean_squared_error(y_reg, preds_reg)
            r2 = r2_score(y_reg, preds_reg)
            print("\n--- Regression Performance ---")
            print(f"MAE:  {mae:.3f} g/day")
            print(f"RMSE: {rmse:.3f} g/day")
            print(f"R²:   {r2:.3f}")
            
        if clf_model and "risk_category" in df.columns:
            y_clf = df["risk_category"].values
            preds_clf = clf_model.predict(X)
            print("\n--- Classification Report ---")
            print(classification_report(y_clf, preds_clf))
    else:
        print("No test dataset provided. Checking model parameters and feature names...")
        print(f"Model n_features_in_: {reg_model.n_features_in_}")
        print(f"Expected features: {len(FEATURE_NAMES)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate HALOS Models")
    parser.add_argument("--models", type=str, default="ml-service/models")
    parser.add_argument("--test-data", type=str, default=None)
    args = parser.parse_args()
    
    evaluate_models(args.models, args.test_data)

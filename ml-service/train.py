"""
HALOS v2.0 - Machine Learning Model Training Pipeline
Scientific model training, cross-validation, hyperparameter evaluation, and persistence.
"""

import os
import json
import argparse
from datetime import datetime
import numpy as np
import pandas as pd
from sklearn.model_selection import KFold, StratifiedKFold, train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import (
    mean_absolute_error,
    root_mean_squared_error,
    r2_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)
import joblib

from feature_engineering import FEATURE_NAMES, FEATURE_SCHEMA_VERSION

def generate_synthetic_research_cohort(n_participants: int = 500, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates a physiologically and epidemiologically plausible research cohort
    for pipeline verification when external research datasets are not yet attached.
    """
    np.random.seed(random_seed)
    
    study_ids = [f"HALOS-{np.random.bytes(6).hex().upper()}" for _ in range(n_participants)]
    ages = np.random.randint(18, 75, size=n_participants)
    sex_male = np.random.binomial(1, 0.48, size=n_participants)
    heights = np.where(sex_male == 1, np.random.normal(168, 7, n_participants), np.random.normal(156, 6, n_participants))
    heights = np.clip(heights, 140, 195)
    
    bmis = np.random.normal(24.5, 4.2, n_participants)
    bmis = np.clip(bmis, 17.0, 42.0)
    weights = np.round(bmis * ((heights / 100.0) ** 2), 1)
    
    # Food frequency ratings (0 to 7)
    proc_freq = np.random.poisson(2.5, n_participants)
    dried_fish_freq = np.random.poisson(2.0, n_participants)
    salted_fish_freq = np.random.poisson(1.5, n_participants)
    pickle_freq = np.random.poisson(1.8, n_participants)
    fast_food_freq = np.random.poisson(1.4, n_participants)
    restaurant_freq = np.random.poisson(2.2, n_participants)
    noodle_freq = np.random.poisson(1.6, n_participants)
    added_salt_freq = np.random.poisson(3.1, n_participants)
    snack_freq = np.random.poisson(2.8, n_participants)
    condiment_freq = np.random.poisson(2.4, n_participants)
    
    freq_matrix = np.clip(
        np.column_stack([
            proc_freq, dried_fish_freq, salted_fish_freq, pickle_freq,
            fast_food_freq, restaurant_freq, noodle_freq, added_salt_freq,
            snack_freq, condiment_freq
        ]),
        0, 7
    )
    
    monthly_score = freq_matrix.sum(axis=1)
    
    # 24-hour recall simulated metrics
    meals = np.random.randint(2, 6, size=n_participants)
    foods_count = np.random.randint(4, 18, size=n_participants)
    high_sodium_foods = np.random.binomial(foods_count, 0.25)
    
    # True underlying dietary salt distribution (grams/day)
    # Reflecting epidemiological associations with high sodium foods and demographics
    true_salt = (
        2.2 +
        0.015 * ages +
        0.8 * sex_male +
        0.06 * bmis +
        0.45 * dried_fish_freq +
        0.40 * salted_fish_freq +
        0.30 * added_salt_freq +
        0.25 * proc_freq +
        0.20 * pickle_freq +
        0.18 * noodle_freq +
        0.12 * condiment_freq +
        np.random.normal(0, 0.85, n_participants)
    )
    true_salt = np.clip(np.round(true_salt, 2), 1.5, 18.0)
    true_sodium = np.round(true_salt * 1000.0 / 2.5, 1)
    
    recall_sodium = np.clip(true_sodium + np.random.normal(0, 350, n_participants), 500, 8000)
    recall_salt = np.round(recall_sodium * 2.5 / 1000.0, 2)
    
    # Risk categories: LOWER (<5g), MODERATE (5-7g), HIGHER (>=7g)
    risk_categories = []
    for s in true_salt:
        if s < 5.0:
            risk_categories.append("LOWER")
        elif s <= 7.0:
            risk_categories.append("MODERATE")
        else:
            risk_categories.append("HIGHER")
            
    df = pd.DataFrame({
        "study_id": study_ids,
        "age": ages,
        "sex_male": sex_male,
        "height_cm": heights,
        "weight_kg": weights,
        "bmi": np.round(bmis, 2),
        "recall_food_count": foods_count,
        "recall_sodium_mg": recall_sodium,
        "recall_salt_g_day": recall_salt,
        "number_of_meals": meals,
        "number_of_high_sodium_foods": high_sodium_foods,
        "processed_food_frequency": freq_matrix[:, 0],
        "dried_fish_frequency": freq_matrix[:, 1],
        "salted_fish_frequency": freq_matrix[:, 2],
        "pickle_frequency": freq_matrix[:, 3],
        "fast_food_frequency": freq_matrix[:, 4],
        "restaurant_food_frequency": freq_matrix[:, 5],
        "instant_noodle_frequency": freq_matrix[:, 6],
        "added_salt_frequency": freq_matrix[:, 7],
        "snack_frequency": freq_matrix[:, 8],
        "condiment_frequency": freq_matrix[:, 9],
        "monthly_frequency_score": monthly_score,
        "salt_g_day": true_salt,
        "risk_category": risk_categories
    })
    
    return df

def run_pipeline(dataset_path: str = None, output_dir: str = "models", random_seed: int = 42):
    os.makedirs(output_dir, exist_ok=True)
    
    print("=" * 65)
    print("HALOS v2.0 - SCIENTIFIC ML MODEL TRAINING & EVALUATION PIPELINE")
    print("=" * 65)
    
    # 1. Load Dataset
    if dataset_path and os.path.exists(dataset_path):
        print(f"Loading external research cohort from: {dataset_path}")
        df = pd.read_csv(dataset_path)
    else:
        print("No external CSV path specified or file not found.")
        print("Generating standard reproducible development cohort (N=500, seed=42)...")
        df = generate_synthetic_research_cohort(n_participants=500, random_seed=random_seed)
        
    print(f"Cohort size: {len(df)} participants, {len(FEATURE_NAMES)} input features.")
    
    # 2. Participant-Level Train / Held-out Test Split (85% dev/train, 15% held-out test)
    train_df, test_df = train_test_split(df, test_size=0.15, random_state=random_seed)
    
    X_train = train_df[FEATURE_NAMES].values
    y_train_reg = train_df["salt_g_day"].values
    y_train_clf = train_df["risk_category"].values
    
    X_test = test_df[FEATURE_NAMES].values
    y_test_reg = test_df["salt_g_day"].values
    y_test_clf = test_df["risk_category"].values
    
    print(f"Split distribution: Training N={len(train_df)} (85%), Held-out Test N={len(test_df)} (15%)")
    
    # 3. 5-Fold Cross Validation for Regression Candidates
    kf = KFold(n_splits=5, shuffle=True, random_state=random_seed)
    
    reg_candidates = {
        "RandomForestRegressor": RandomForestRegressor(n_estimators=500, max_depth=12, min_samples_split=4, random_state=random_seed, n_jobs=-1),
        "GradientBoostingRegressor": GradientBoostingRegressor(n_estimators=200, learning_rate=0.05, max_depth=4, random_state=random_seed),
        "Ridge": Ridge(alpha=1.0, random_state=random_seed),
        "LinearRegression": LinearRegression()
    }
    
    model_comparison_results = {}
    
    print("\n--- 5-Fold Cross-Validation Performance (Training Set) ---")
    for name, model in reg_candidates.items():
        cv_mae, cv_rmse, cv_r2 = [], [], []
        for train_idx, val_idx in kf.split(X_train):
            X_cv_tr, X_cv_val = X_train[train_idx], X_train[val_idx]
            y_cv_tr, y_cv_val = y_train_reg[train_idx], y_train_reg[val_idx]
            
            model.fit(X_cv_tr, y_cv_tr)
            preds = model.predict(X_cv_val)
            
            cv_mae.append(mean_absolute_error(y_cv_val, preds))
            cv_rmse.append(root_mean_squared_error(y_cv_val, preds))
            cv_r2.append(r2_score(y_cv_val, preds))
            
        # Fit on full training set and evaluate on held-out test set
        model.fit(X_train, y_train_reg)
        test_preds = model.predict(X_test)
        
        test_mae = mean_absolute_error(y_test_reg, test_preds)
        test_rmse = root_mean_squared_error(y_test_reg, test_preds)
        test_r2 = r2_score(y_test_reg, test_preds)
        
        model_comparison_results[name] = {
            "cv_mae": round(float(np.mean(cv_mae)), 4),
            "cv_rmse": round(float(np.mean(cv_rmse)), 4),
            "cv_r2": round(float(np.mean(cv_r2)), 4),
            "test_mae": round(float(test_mae), 4),
            "test_rmse": round(float(test_rmse), 4),
            "test_r2": round(float(test_r2), 4)
        }
        
        print(f"[{name:26}] CV RMSE: {np.mean(cv_rmse):.3f} | CV R²: {np.mean(cv_r2):.3f} | Test RMSE: {test_rmse:.3f} | Test R²: {test_r2:.3f}")

    # 4. Train Classification Candidate (Random Forest Classifier)
    print("\n--- Classification Performance (RandomForestClassifier) ---")
    clf = RandomForestClassifier(n_estimators=300, max_depth=10, class_weight="balanced", random_state=random_seed, n_jobs=-1)
    clf.fit(X_train, y_train_clf)
    clf_test_preds = clf.predict(X_test)
    
    clf_acc = accuracy_score(y_test_clf, clf_test_preds)
    clf_prec = precision_score(y_test_clf, clf_test_preds, average="weighted")
    clf_rec = recall_score(y_test_clf, clf_test_preds, average="weighted")
    clf_f1 = f1_score(y_test_clf, clf_test_preds, average="weighted")
    
    print(f"Held-out Test Accuracy: {clf_acc * 100:.1f}% | Weighted F1: {clf_f1:.3f} | Precision: {clf_prec:.3f} | Recall: {clf_rec:.3f}")
    
    # 5. Extract Feature Importances from Random Forest
    rf_best = reg_candidates["RandomForestRegressor"]
    importances = rf_best.feature_importances_
    feat_importance_list = [
        {"feature": name, "importance": round(float(imp), 4)}
        for name, imp in sorted(zip(FEATURE_NAMES, importances), key=lambda x: x[1], reverse=True)
    ]
    
    # 6. Save Model Artifacts
    rf_reg_path = os.path.join(output_dir, "random_forest_regressor.joblib")
    rf_clf_path = os.path.join(output_dir, "random_forest_classifier.joblib")
    
    joblib.dump(rf_best, rf_reg_path)
    joblib.dump(clf, rf_clf_path)
    print(f"\nSaved regression model to: {rf_reg_path}")
    print(f"Saved classification model to: {rf_clf_path}")
    
    # 7. Generate & Save model_metadata.json
    metadata = {
        "model_name": "RandomForestRegressor",
        "model_version": "RF-2.0.0",
        "classification_model_name": "RandomForestClassifier",
        "classification_model_version": "RFC-2.0.0",
        "training_date": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "feature_schema_version": FEATURE_SCHEMA_VERSION,
        "feature_list": FEATURE_NAMES,
        "training_sample_size": len(train_df),
        "test_sample_size": len(test_df),
        "random_seed": random_seed,
        "best_regression_metrics": {
            "cv_mae": model_comparison_results["RandomForestRegressor"]["cv_mae"],
            "cv_rmse": model_comparison_results["RandomForestRegressor"]["cv_rmse"],
            "cv_r2": model_comparison_results["RandomForestRegressor"]["cv_r2"],
            "test_mae": model_comparison_results["RandomForestRegressor"]["test_mae"],
            "test_rmse": model_comparison_results["RandomForestRegressor"]["test_rmse"],
            "test_r2": model_comparison_results["RandomForestRegressor"]["test_r2"]
        },
        "classification_metrics": {
            "test_accuracy": round(float(clf_acc), 4),
            "test_weighted_f1": round(float(clf_f1), 4),
            "test_precision": round(float(clf_prec), 4),
            "test_recall": round(float(clf_rec), 4)
        },
        "model_comparison": model_comparison_results,
        "feature_importances": feat_importance_list,
        "scientific_disclaimer": "Metrics represent research evaluation on development/held-out test split. Not a clinical medical diagnosis."
    }
    
    metadata_path = os.path.join(output_dir, "model_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
        
    # Also save to root of ml-service
    root_metadata_path = os.path.join(os.path.dirname(output_dir) if output_dir != "." else ".", "model_metadata.json")
    with open(root_metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Saved model metadata to: {metadata_path}")
    print("=" * 65)
    print("PIPELINE EXECUTION COMPLETED SUCCESSFULLY.")
    print("=" * 65)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="HALOS ML Training Pipeline")
    parser.add_argument("--data", type=str, default=None, help="Path to research cohort CSV file")
    parser.add_argument("--out", type=str, default="ml-service/models", help="Output directory for joblib models")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    args = parser.parse_args()
    
    run_pipeline(dataset_path=args.data, output_dir=args.out, random_seed=args.seed)

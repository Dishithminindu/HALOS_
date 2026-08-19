"""
HALOS v2.0 - Machine Learning Feature Engineering Module
Standardized schema validation, normalization, and feature vector transformation.
"""

from typing import Dict, Any, List
import numpy as np
import pandas as pd

# Canonical feature list for model reproducibility
FEATURE_SCHEMA_VERSION = "FEATURES-2.0"

FEATURE_NAMES: List[str] = [
    "age",
    "sex_male",
    "height_cm",
    "weight_kg",
    "bmi",
    "recall_food_count",
    "recall_sodium_mg",
    "recall_salt_g_day",
    "number_of_meals",
    "number_of_high_sodium_foods",
    "processed_food_frequency",
    "dried_fish_frequency",
    "salted_fish_frequency",
    "pickle_frequency",
    "fast_food_frequency",
    "restaurant_food_frequency",
    "instant_noodle_frequency",
    "added_salt_frequency",
    "snack_frequency",
    "condiment_frequency",
    "monthly_frequency_score"
]

def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    """Calculate Body Mass Index (kg/m^2)."""
    if height_cm <= 0:
        return 0.0
    height_m = height_cm / 100.0
    return round(weight_kg / (height_m * height_m), 2)

def extract_features(data: Dict[str, Any]) -> Dict[str, float]:
    """
    Transforms raw input dictionary (demographics, recall summary, and questionnaire)
    into a standardized, validated numerical feature vector.
    """
    age = float(data.get("age", 35))
    sex = str(data.get("sex", "MALE")).upper()
    sex_male = 1.0 if sex == "MALE" else 0.0
    height_cm = float(data.get("height_cm", 165.0))
    weight_kg = float(data.get("weight_kg", 65.0))
    
    bmi = float(data.get("bmi", calculate_bmi(weight_kg, height_cm)))
    
    # 24-hour recall aggregated features
    recall_food_count = float(data.get("recall_food_count", 0))
    recall_sodium_mg = float(data.get("recall_sodium_mg", 0.0))
    recall_salt_g_day = float(data.get("recall_salt_g_day", recall_sodium_mg * 2.5 / 1000.0))
    number_of_meals = float(data.get("number_of_meals", 0))
    number_of_high_sodium_foods = float(data.get("number_of_high_sodium_foods", 0))
    
    # Monthly food frequency scores (0 to 7 scale)
    processed_food_freq = float(data.get("processed_food_frequency", 0))
    dried_fish_freq = float(data.get("dried_fish_frequency", 0))
    salted_fish_freq = float(data.get("salted_fish_frequency", 0))
    pickle_freq = float(data.get("pickle_frequency", 0))
    fast_food_freq = float(data.get("fast_food_frequency", 0))
    restaurant_food_freq = float(data.get("restaurant_food_frequency", 0))
    instant_noodle_freq = float(data.get("instant_noodle_frequency", 0))
    added_salt_freq = float(data.get("added_salt_frequency", 0))
    snack_freq = float(data.get("snack_frequency", 0))
    condiment_freq = float(data.get("condiment_frequency", 0))
    
    # Composite monthly score
    freq_items = [
        processed_food_freq, dried_fish_freq, salted_fish_freq,
        pickle_freq, fast_food_freq, restaurant_food_freq,
        instant_noodle_freq, added_salt_freq, snack_freq, condiment_freq
    ]
    monthly_frequency_score = float(data.get("monthly_frequency_score", sum(freq_items)))
    
    vector = {
        "age": age,
        "sex_male": sex_male,
        "height_cm": height_cm,
        "weight_kg": weight_kg,
        "bmi": bmi,
        "recall_food_count": recall_food_count,
        "recall_sodium_mg": recall_sodium_mg,
        "recall_salt_g_day": recall_salt_g_day,
        "number_of_meals": number_of_meals,
        "number_of_high_sodium_foods": number_of_high_sodium_foods,
        "processed_food_frequency": processed_food_freq,
        "dried_fish_frequency": dried_fish_freq,
        "salted_fish_frequency": salted_fish_freq,
        "pickle_frequency": pickle_freq,
        "fast_food_frequency": fast_food_freq,
        "restaurant_food_frequency": restaurant_food_freq,
        "instant_noodle_frequency": instant_noodle_freq,
        "added_salt_frequency": added_salt_freq,
        "snack_frequency": snack_freq,
        "condiment_frequency": condiment_freq,
        "monthly_frequency_score": monthly_frequency_score
    }
    
    return vector

def vector_to_matrix(vector: Dict[str, float]) -> np.ndarray:
    """Converts a feature dict into a 2D numpy array ordered by FEATURE_NAMES."""
    return np.array([[vector[k] for k in FEATURE_NAMES]], dtype=np.float64)

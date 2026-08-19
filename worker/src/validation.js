/**
 * HALOS v2.0 - Input Validation Engine
 * Enforces strict scientific data ranges, schema integrity, and anti-injection hygiene.
 */

export function validateParticipant(data) {
  const errors = [];

  if (data.age === undefined || data.age === null) {
    errors.push('Age is required.');
  } else {
    const age = Number(data.age);
    if (!Number.isInteger(age) || age < 18 || age > 120) {
      errors.push('Age must be an integer between 18 and 120.');
    }
  }

  if (!data.sex || !['MALE', 'FEMALE', 'OTHER'].includes(String(data.sex).toUpperCase())) {
    errors.push('Sex must be one of MALE, FEMALE, or OTHER.');
  }

  if (data.height_cm === undefined || data.height_cm === null) {
    errors.push('Height in cm is required.');
  } else {
    const height = Number(data.height_cm);
    if (isNaN(height) || height < 100 || height > 250) {
      errors.push('Height must be between 100 and 250 cm.');
    }
  }

  if (data.weight_kg === undefined || data.weight_kg === null) {
    errors.push('Weight in kg is required.');
  } else {
    const weight = Number(data.weight_kg);
    if (isNaN(weight) || weight < 25 || weight > 300) {
      errors.push('Weight must be between 25 and 300 kg.');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateRecallEntry(data) {
  const errors = [];
  const validMeals = ['BREAKFAST', 'MORNING_SNACK', 'LUNCH', 'AFTERNOON_SNACK', 'DINNER', 'EVENING_SNACK'];

  if (!data.meal || !validMeals.includes(String(data.meal).toUpperCase())) {
    errors.push(`Meal must be one of: ${validMeals.join(', ')}`);
  }

  if (!data.food_id || typeof data.food_id !== 'string') {
    errors.push('Valid food_id is required.');
  }

  if (!data.food_name || typeof data.food_name !== 'string') {
    errors.push('Food name is required.');
  }

  const quantity = Number(data.quantity);
  if (isNaN(quantity) || quantity <= 0 || quantity > 5000) {
    errors.push('Quantity must be a positive number up to 5000.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateQuestionnaire(answers) {
  const errors = [];
  if (!answers || typeof answers !== 'object') {
    errors.push('Survey answers must be provided as a structured object.');
    return { valid: false, errors };
  }

  const frequencyKeys = [
    'processed_food_frequency',
    'dried_fish_frequency',
    'salted_fish_frequency',
    'pickle_frequency',
    'fast_food_frequency',
    'restaurant_food_frequency',
    'instant_noodle_frequency',
    'added_salt_frequency',
    'snack_frequency',
    'condiment_frequency'
  ];

  for (const key of frequencyKeys) {
    if (answers[key] !== undefined) {
      const val = Number(answers[key]);
      if (isNaN(val) || val < 0 || val > 7) {
        errors.push(`${key} must be an integer between 0 and 7.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

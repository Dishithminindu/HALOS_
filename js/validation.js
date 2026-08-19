/**
 * HALOS v2.0 - Client-Side Validation Engine
 * Validates scientific constraints before transmitting payloads to the Cloudflare Worker API.
 */

const HALOS_VALIDATION = (function() {
  return {
    validateParticipantForm(formData) {
      const errors = {};

      const age = Number(formData.age);
      if (!formData.age || isNaN(age) || age < 18 || age > 120) {
        errors.age = 'Age must be an integer between 18 and 120 years.';
      }

      if (!formData.sex || !['MALE', 'FEMALE', 'OTHER'].includes(formData.sex)) {
        errors.sex = 'Please select a valid biological sex category.';
      }

      const height = Number(formData.height_cm);
      if (!formData.height_cm || isNaN(height) || height < 100 || height > 250) {
        errors.height_cm = 'Height must be between 100 and 250 cm.';
      }

      const weight = Number(formData.weight_kg);
      if (!formData.weight_kg || isNaN(weight) || weight < 25 || weight > 300) {
        errors.weight_kg = 'Weight must be between 25 and 300 kg.';
      }

      if (!formData.consent_agreed) {
        errors.consent = 'Informed participant research consent is required.';
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors
      };
    },

    validateRecallItem(item) {
      const errors = {};

      if (!item.food_id || !item.food_name) {
        errors.food = 'Please select a food item from the database.';
      }

      const qty = Number(item.quantity);
      if (!item.quantity || isNaN(qty) || qty <= 0 || qty > 5000) {
        errors.quantity = 'Portion quantity must be greater than 0g and up to 5000g.';
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors
      };
    },

    applyFormErrors(formElement, errors) {
      // Clear previous error states
      formElement.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
      formElement.querySelectorAll('.form-error').forEach(el => el.remove());

      for (const [fieldName, message] of Object.entries(errors)) {
        const input = formElement.querySelector(`[name="${fieldName}"]`);
        if (input) {
          input.classList.add('is-invalid');
          const errorEl = document.createElement('div');
          errorEl.className = 'form-error';
          errorEl.textContent = message;
          input.parentNode.appendChild(errorEl);
        }
      }
    }
  };
})();

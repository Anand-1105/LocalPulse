// Business validation schema
const businessSchema = {
  name: { type: 'string', required: true, maxLength: 255 },
  category: { type: 'string', required: true, maxLength: 100 },
  type: { type: 'string', required: true, enum: ['retail', 'commercial', 'service'] },
  city: { type: 'string', required: true, maxLength: 100 },
  rating: { type: 'number', required: true, min: 0, max: 5 },
  latitude: { type: 'number', required: true, min: -90, max: 90 },
  longitude: { type: 'number', required: true, min: -180, max: 180 }
};

function validateBusinessData(businesses) {
  if (!Array.isArray(businesses)) {
    throw new Error('AI must return array of businesses');
  }

  const validBusinesses = [];
  const errors = [];

  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];
    const businessErrors = [];

    // Validate each field
    for (const [field, rules] of Object.entries(businessSchema)) {
      const value = business[field];

      // Required check
      if (rules.required && (value === undefined || value === null || value === '')) {
        businessErrors.push(`${field} is required`);
        continue;
      }

      if (value !== undefined && value !== null) {
        // Type check
        if (rules.type === 'string' && typeof value !== 'string') {
          businessErrors.push(`${field} must be string`);
        }
        if (rules.type === 'number' && typeof value !== 'number') {
          businessErrors.push(`${field} must be number`);
        }

        // String validations
        if (rules.type === 'string' && typeof value === 'string') {
          if (rules.maxLength && value.length > rules.maxLength) {
            businessErrors.push(`${field} too long (max ${rules.maxLength})`);
          }
          if (rules.enum && !rules.enum.includes(value)) {
            businessErrors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
          }
        }

        // Number validations
        if (rules.type === 'number' && typeof value === 'number') {
          if (rules.min !== undefined && value < rules.min) {
            businessErrors.push(`${field} must be >= ${rules.min}`);
          }
          if (rules.max !== undefined && value > rules.max) {
            businessErrors.push(`${field} must be <= ${rules.max}`);
          }
        }
      }
    }

    if (businessErrors.length === 0) {
      validBusinesses.push(business);
    } else {
      errors.push(`Business ${i + 1}: ${businessErrors.join(', ')}`);
    }
  }

  return { validBusinesses, errors };
}

module.exports = { validateBusinessData, businessSchema };
// Form validation functions

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    minLength: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers
  };
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[+]?[1-9]?[0-9]{7,15}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

export const validateForm = (data, schema) => {
  const errors = {};
  let isValid = true;

  Object.keys(schema).forEach(field => {
    const rules = schema[field];
    const value = data[field];

    if (rules.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      isValid = false;
      return;
    }

    if (rules.email && value && !validateEmail(value)) {
      errors[field] = 'Please enter a valid email address';
      isValid = false;
    }

    if (rules.phone && value && !validatePhone(value)) {
      errors[field] = 'Please enter a valid phone number';
      isValid = false;
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rules.minLength} characters`;
      isValid = false;
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be less than ${rules.maxLength} characters`;
      isValid = false;
    }

    if (rules.min && value && parseFloat(value) < rules.min) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rules.min}`;
      isValid = false;
    }

    if (rules.max && value && parseFloat(value) > rules.max) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be less than ${rules.max}`;
      isValid = false;
    }
  });

  return { isValid, errors };
};

// Validation schemas
export const buyerRegistrationSchema = {
  name: { required: true, minLength: 2, maxLength: 50 },
  email: { required: true, email: true },
  phone: { required: true, phone: true },
  password: { required: true, minLength: 8 }
};

export const sellerRegistrationSchema = {
  name: { required: true, minLength: 2, maxLength: 50 },
  email: { required: true, email: true },
  phone: { required: true, phone: true },
  businessName: { required: true, minLength: 2, maxLength: 100 },
  businessAddress: { required: true, minLength: 10, maxLength: 200 },
  password: { required: true, minLength: 8 }
};

export const productSchema = {
  name: { required: true, minLength: 3, maxLength: 100 },
  description: { required: true, minLength: 10, maxLength: 1000 },
  price: { required: true, min: 0.01, max: 10000 },
  tags: { required: true }
};

export const addressSchema = {
  label: { required: true, minLength: 2, maxLength: 50 },
  name: { required: true, minLength: 2, maxLength: 100 },
  street: { required: true, minLength: 5, maxLength: 200 },
  city: { required: true, minLength: 2, maxLength: 100 },
  state: { required: true, minLength: 2, maxLength: 50 },
  zipCode: { required: true, minLength: 3, maxLength: 20 },
  country: { required: true }
};

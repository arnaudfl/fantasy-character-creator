export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  // Basic email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  }

  // Common email providers validation (optional)
  const commonProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const [, domain] = email.split('@');
  if (domain && !commonProviders.includes(domain.toLowerCase())) {
    errors.push('Please use a common email provider (Gmail, Yahoo, Hotmail, or Outlook)');
  }

  // Length validation
  if (email.length > 254) { // Maximum email length according to RFC 5321
    errors.push('Email address is too long');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}; 
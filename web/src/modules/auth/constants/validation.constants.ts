export const PASSWORD_VALIDATION = {
  MIN_LENGTH: 8,
  REGEX: /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
  RULES: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumberOrSpecial: true,
  },
  ERROR_MESSAGES: {
    required: 'Password is required',
    minLength: 'Password must be at least 8 characters',
    complexity: 'Password must contain uppercase, lowercase, and a number or special character',
  },
} as const;

export const EMAIL_VALIDATION = {
  REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ERROR_MESSAGES: {
    required: 'Email is required',
    invalid: 'Please enter a valid email address',
  },
} as const;

export const NAME_VALIDATION = {
  MIN_LENGTH: 2,
  ERROR_MESSAGES: {
    required: 'Full name is required',
    minLength: 'Name must be at least 2 characters',
  },
} as const;

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  error: string | null;
} {
  if (!password) {
    return { isValid: false, error: PASSWORD_VALIDATION.ERROR_MESSAGES.required };
  }
  if (password.length < PASSWORD_VALIDATION.MIN_LENGTH) {
    return { isValid: false, error: PASSWORD_VALIDATION.ERROR_MESSAGES.minLength };
  }
  if (!PASSWORD_VALIDATION.REGEX.test(password)) {
    return { isValid: false, error: PASSWORD_VALIDATION.ERROR_MESSAGES.complexity };
  }
  return { isValid: true, error: null };
}

export function validateEmailFormat(email: string): { isValid: boolean; error: string | null } {
  if (!email) {
    return { isValid: false, error: EMAIL_VALIDATION.ERROR_MESSAGES.required };
  }
  if (!EMAIL_VALIDATION.REGEX.test(email)) {
    return { isValid: false, error: EMAIL_VALIDATION.ERROR_MESSAGES.invalid };
  }
  return { isValid: true, error: null };
}

export function validateName(name: string): { isValid: boolean; error: string | null } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: NAME_VALIDATION.ERROR_MESSAGES.required };
  }
  if (trimmed.length < NAME_VALIDATION.MIN_LENGTH) {
    return { isValid: false, error: NAME_VALIDATION.ERROR_MESSAGES.minLength };
  }
  return { isValid: true, error: null };
}

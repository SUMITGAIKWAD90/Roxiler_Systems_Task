export const NAME_MIN = 20;
export const NAME_MAX = 60;
export const ADDRESS_MAX = 400;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 16;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_UPPER = /[A-Z]/;
const PASSWORD_SPECIAL = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;'`~]/;

export function validateName(name, fieldLabel = 'Name') {
  const trimmed = (name || '').trim();
  if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX) {
    return `${fieldLabel} must be between ${NAME_MIN} and ${NAME_MAX} characters`;
  }
  return null;
}

export function validateEmail(email) {
  const trimmed = (email || '').trim();
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Invalid email format';
  }
  return null;
}

export function validateAddress(address) {
  const trimmed = (address || '').trim();
  if (!trimmed) return 'Address is required';
  if (trimmed.length > ADDRESS_MAX) {
    return `Address must not exceed ${ADDRESS_MAX} characters`;
  }
  return null;
}

export function validatePassword(password) {
  if (!password || password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return `Password must be between ${PASSWORD_MIN} and ${PASSWORD_MAX} characters`;
  }
  if (!PASSWORD_UPPER.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!PASSWORD_SPECIAL.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
}

export function validateRating(value) {
  const num = parseInt(value, 10);
  if (isNaN(num) || num < 1 || num > 5) {
    return 'Rating must be between 1 and 5';
  }
  return null;
}

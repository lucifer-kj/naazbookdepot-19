import DOMPurify from 'dompurify';

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim(), {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
  });
};

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'span'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
};

export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
};

export const validateAndSanitizeEmail = (email: string): string => {
  const sanitized = sanitizeInput(email).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email address');
  }
  
  return sanitized;
};

export const validateAndSanitizePhone = (phone: string): string => {
  const sanitized = sanitizeInput(phone).replace(/\D/g, '');
  const phoneRegex = /^\d{10}$/;
  
  if (!phoneRegex.test(sanitized)) {
    throw new Error('Invalid phone number. Must be 10 digits');
  }
  
  return sanitized;
};

export const validateAndSanitizeURL = (url: string): string => {
  const sanitized = sanitizeInput(url);
  try {
    new URL(sanitized);
    return sanitized;
  } catch {
    throw new Error('Invalid URL');
  }
};
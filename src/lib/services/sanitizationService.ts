import DOMPurify from 'dompurify';
import sentryService from './sentryService';

export interface SanitizationOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  stripTags?: boolean;
  maxLength?: number;
  preserveWhitespace?: boolean;
}

class SanitizationService {
  private defaultHtmlConfig = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['class'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false
  };

  private strictConfig = {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false
  };

  /**
   * Sanitizes HTML content for safe display
   */
  sanitizeHtml(
    input: string,
    options: SanitizationOptions = {}
  ): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    try {
      const config: Record<string, unknown> = {
        ...this.defaultHtmlConfig,
        ...(options.allowedTags && { ALLOWED_TAGS: options.allowedTags }),
        ...(options.allowedAttributes && { ALLOWED_ATTR: options.allowedAttributes })
      };

      let sanitized = DOMPurify.sanitize(input, config) as unknown as string;

      // Apply additional processing
      if (options.maxLength && sanitized.length > options.maxLength) {
        sanitized = sanitized.substring(0, options.maxLength) + '...';
      }

      if (!options.preserveWhitespace) {
        sanitized = sanitized.replace(/\s+/g, ' ').trim();
      }

      return sanitized;
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('HTML sanitization failed'),
        {
          action: 'sanitize_html',
          additionalData: {
            inputLength: input.length,
            options
          }
        }
      );
      
      // Return empty string on error for security
      return '';
    }
  }

  /**
   * Strips all HTML tags and returns plain text
   */
  stripHtml(input: string, maxLength?: number): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    try {
      let sanitized = DOMPurify.sanitize(input, this.strictConfig) as string;
      
      // Remove unknown remaining HTML entities
      sanitized = sanitized
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/\s+/g, ' ')
        .trim();

      if (maxLength && sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength) + '...';
      }

      return sanitized;
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('HTML stripping failed'),
        {
          action: 'strip_html',
          additionalData: {
            inputLength: input.length,
            maxLength
          }
        }
      );
      
      return '';
    }
  }

  /**
   * Sanitizes user input for database storage
   */
  sanitizeInput(input: string, maxLength?: number): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    try {
      // Remove HTML tags
      let sanitized = this.stripHtml(input);

      // Remove potentially dangerous characters
      sanitized = sanitized
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .replace(/data:/gi, '') // Remove data: protocol
        .trim();

      if (maxLength && sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
      }

      return sanitized;
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Input sanitization failed'),
        {
          action: 'sanitize_input',
          additionalData: {
            inputLength: input.length,
            maxLength
          }
        }
      );
      
      return '';
    }
  }

  /**
   * Sanitizes email addresses
   */
  sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      return '';
    }

    return email
      .toLowerCase()
      .trim()
      .replace(/[^\w@.-]/g, '') // Only allow word characters, @, ., and -
      .substring(0, 254); // RFC 5321 limit
  }

  /**
   * Sanitizes phone numbers
   */
  sanitizePhone(phone: string): string {
    if (!phone || typeof phone !== 'string') {
      return '';
    }

    return phone
      .replace(/[^\d+()-\s]/g, '') // Only allow digits, +, (), -, and spaces
      .trim()
      .substring(0, 20);
  }

  /**
   * Sanitizes URLs
   */
  sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') {
      return '';
    }

    try {
      // Remove dangerous protocols
      const sanitized = url
        .trim()
        .replace(/^javascript:/gi, '')
        .replace(/^data:/gi, '')
        .replace(/^vbscript:/gi, '');

      // Validate URL format
      if (sanitized && !sanitized.match(/^https?:\/\//i)) {
        return `https://${sanitized}`;
      }

      return sanitized.substring(0, 2048); // Reasonable URL length limit
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('URL sanitization failed'),
        {
          action: 'sanitize_url',
          additionalData: { url }
        }
      );
      
      return '';
    }
  }

  /**
   * Sanitizes file names
   */
  sanitizeFileName(fileName: string): string {
    if (!fileName || typeof fileName !== 'string') {
      return '';
    }

    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .substring(0, 255); // File system limit
  }

  /**
   * Sanitizes search queries
   */
  sanitizeSearchQuery(query: string): string {
    if (!query || typeof query !== 'string') {
      return '';
    }

    return query
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/['"]/g, '') // Remove quotes to prevent injection
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 100); // Reasonable search query length
  }

  /**
   * Sanitizes form data object
   */
  sanitizeFormData<T extends Record<string, unknown>>(
    data: T,
    fieldConfig: Partial<Record<keyof T, SanitizationOptions>> = {}
  ): T {
    const sanitized = { ...data };

    try {
      Object.keys(sanitized).forEach(key => {
        const value = sanitized[key];
        const config = fieldConfig[key as keyof T] || {};

        if (typeof value === 'string') {
          if (config.stripTags) {
            (sanitized as unknown)[key] = this.stripHtml(value, config.maxLength);
          } else {
            (sanitized as unknown)[key] = this.sanitizeInput(value, config.maxLength);
          }
        } else if (Array.isArray(value)) {
          (sanitized as unknown)[key] = value.map(item => 
            typeof item === 'string' 
              ? this.sanitizeInput(item, config.maxLength)
              : item
          );
        }
      });

      return sanitized;
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Form data sanitization failed'),
        {
          action: 'sanitize_form_data',
          additionalData: {
            fieldCount: Object.keys(data).length,
            fieldConfig
          }
        }
      );
      
      return data; // Return original data if sanitization fails
    }
  }

  /**
   * Validates and sanitizes rich text content (for blog posts, descriptions, etc.)
   */
  sanitizeRichText(content: string, maxLength: number = 10000): string {
    if (!content || typeof content !== 'string') {
      return '';
    }

    const allowedTags = [
      'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
      'a', 'img'
    ];

    const allowedAttributes = {
      'a': ['href', 'title'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      '*': ['class']
    };

    return this.sanitizeHtml(content, {
      allowedTags,
      allowedAttributes,
      maxLength,
      preserveWhitespace: true
    });
  }

  /**
   * Advanced input validation with multiple security checks
   */
  validateAndSanitizeInput(
    input: string,
    options: {
      maxLength?: number;
      minLength?: number;
      allowedPatterns?: RegExp[];
      blockedPatterns?: RegExp[];
      requireAlphanumeric?: boolean;
      allowSpecialChars?: string[];
      customValidator?: (input: string) => boolean | { isValid: boolean; error?: string };
    } = {}
  ): { isValid: boolean; sanitized: string; errors: string[] } {
    const errors: string[] = [];
    let sanitized = input;

    try {
      // Basic sanitization
      sanitized = this.sanitizeInput(input);

      // Length validation
      if (options.minLength && sanitized.length < options.minLength) {
        errors.push(`Input must be at least ${options.minLength} characters long`);
      }

      if (options.maxLength && sanitized.length > options.maxLength) {
        errors.push(`Input must be no more than ${options.maxLength} characters long`);
        sanitized = sanitized.substring(0, options.maxLength);
      }

      // Pattern validation
      if (options.allowedPatterns) {
        const matchesAllowed = options.allowedPatterns.some(pattern => pattern.test(sanitized));
        if (!matchesAllowed) {
          errors.push('Input contains invalid characters');
        }
      }

      if (options.blockedPatterns) {
        const matchesBlocked = options.blockedPatterns.some(pattern => pattern.test(sanitized));
        if (matchesBlocked) {
          errors.push('Input contains prohibited content');
        }
      }

      // Alphanumeric validation
      if (options.requireAlphanumeric) {
        const allowedChars = options.allowSpecialChars?.join('') || '';
        const alphanumericPattern = new RegExp(`^[a-zA-Z0-9${allowedChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]+$`);
        if (!alphanumericPattern.test(sanitized)) {
          errors.push('Input must contain only alphanumeric characters and allowed special characters');
        }
      }

      // Custom validation
      if (options.customValidator) {
        const customResult = options.customValidator(sanitized);
        if (typeof customResult === 'object') {
          if (!customResult.isValid) {
            errors.push(customResult.error || 'Input failed custom validation');
          }
        } else if (!customResult) {
          errors.push('Input failed custom validation');
        }
      }

      return {
        isValid: errors.length === 0,
        sanitized,
        errors
      };
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Input validation failed'),
        {
          action: 'validate_and_sanitize_input',
          additionalData: { input: input?.substring(0, 100), options }
        }
      );

      return {
        isValid: false,
        sanitized: '',
        errors: ['Input validation failed']
      };
    }
  }

  /**
   * Sanitize and validate SQL-like inputs to prevent injection
   */
  sanitizeSQLInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/['"`;\\]/g, '') // Remove dangerous SQL characters
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi, '') // Remove SQL keywords
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove SQL block comments start
      .replace(/\*\//g, '') // Remove SQL block comments end
      .trim()
      .substring(0, 1000); // Reasonable length limit
  }

  /**
   * Sanitize NoSQL injection attempts
   */
  sanitizeNoSQLInput(input: unknown): unknown {
    if (typeof input === 'string') {
      return this.sanitizeInput(input);
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeNoSQLInput(item));
    }

    if (typeof input === 'object' && input !== null) {
      // Remove dangerous MongoDB operators
      const dangerousKeys = ['$where', '$regex', '$ne', '$gt', '$lt', '$gte', '$lte', '$in', '$nin', '$exists'];
      const sanitized: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(input)) {
        if (!dangerousKeys.includes(key)) {
          sanitized[this.sanitizeInput(key)] = this.sanitizeNoSQLInput(value);
        }
      }

      return sanitized;
    }

    return input;
  }

  /**
   * Validate and sanitize JSON input
   */
  sanitizeJSONInput(input: string, maxDepth: number = 5): { isValid: boolean; sanitized: unknown; error?: string } {
    try {
      if (!input || typeof input !== 'string') {
        return { isValid: false, sanitized: null, error: 'Invalid JSON input' };
      }

      // Basic sanitization
      const sanitizedInput = this.sanitizeInput(input);

      // Parse JSON
      const parsed = JSON.parse(sanitizedInput);

      // Check depth to prevent deeply nested objects
      const checkDepth = (obj: unknown, depth: number = 0): boolean => {
        if (depth > maxDepth) return false;
        
        if (typeof obj === 'object' && obj !== null) {
          if (Array.isArray(obj)) {
            return obj.every(item => checkDepth(item, depth + 1));
          } else {
            return Object.values(obj).every(value => checkDepth(value, depth + 1));
          }
        }
        
        return true;
      };

      if (!checkDepth(parsed)) {
        return { isValid: false, sanitized: null, error: 'JSON structure too deeply nested' };
      }

      // Recursively sanitize the parsed object
      const sanitizeObject = (obj: unknown): unknown => {
        if (typeof obj === 'string') {
          return this.sanitizeInput(obj);
        }
        
        if (Array.isArray(obj)) {
          return obj.map(sanitizeObject);
        }
        
        if (typeof obj === 'object' && obj !== null) {
          const sanitized: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(obj)) {
            sanitized[this.sanitizeInput(key)] = sanitizeObject(value);
          }
          return sanitized;
        }
        
        return obj;
      };

      return {
        isValid: true,
        sanitized: sanitizeObject(parsed)
      };
    } catch (error) {
      return {
        isValid: false,
        sanitized: null,
        error: 'Invalid JSON format'
      };
    }
  }

  /**
   * Comprehensive XSS protection
   */
  preventXSS(input: string, context: 'html' | 'attribute' | 'javascript' | 'css' = 'html'): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    switch (context) {
      case 'html':
        sanitized = this.sanitizeHtml(input, { stripTags: true });
        break;
      
      case 'attribute':
        sanitized = input
          .replace(/[<>"'&]/g, (match) => {
            const entities: Record<string, string> = {
              '<': '&lt;',
              '>': '&gt;',
              '"': '&quot;',
              "'": '&#x27;',
              '&': '&amp;'
            };
            return entities[match] || match;
          });
        break;
      
      case 'javascript':
        sanitized = input
          .replace(/[<>"'&\\]/g, (match) => {
            const escapes: Record<string, string> = {
              '<': '\\u003c',
              '>': '\\u003e',
              '"': '\\u0022',
              "'": '\\u0027',
              '&': '\\u0026',
              '\\': '\\\\'
            };
            return escapes[match] || match;
          });
        break;
      
      case 'css':
        sanitized = input.replace(/[<>"'&\\]/g, '');
        break;
    }

    return sanitized;
  }
}

// Create singleton instance
export const sanitizationService = new SanitizationService();

export default sanitizationService;

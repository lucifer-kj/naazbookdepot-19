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
      const config = {
        ...this.defaultHtmlConfig,
        ...(options.allowedTags && { ALLOWED_TAGS: options.allowedTags }),
        ...(options.allowedAttributes && { ALLOWED_ATTR: options.allowedAttributes })
      };

      let sanitized = DOMPurify.sanitize(input, config);

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
      let sanitized = DOMPurify.sanitize(input, this.strictConfig);
      
      // Remove any remaining HTML entities
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
    fieldConfig: Record<keyof T, SanitizationOptions> = {}
  ): T {
    const sanitized = { ...data };

    try {
      Object.keys(sanitized).forEach(key => {
        const value = sanitized[key];
        const config = fieldConfig[key] || {};

        if (typeof value === 'string') {
          if (config.stripTags) {
            sanitized[key] = this.stripHtml(value, config.maxLength);
          } else {
            sanitized[key] = this.sanitizeInput(value, config.maxLength);
          }
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map(item => 
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
}

// Create singleton instance
export const sanitizationService = new SanitizationService();

export default sanitizationService;
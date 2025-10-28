import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanitizationService } from '../sanitizationService';

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((input, config) => {
      // Simple mock implementation
      if (config?.ALLOWED_TAGS?.length === 0) {
        return input.replace(/<[^>]*>/g, ''); // Strip all tags
      }
      return input; // Return as-is for other cases
    })
  }
}));

// Mock Sentry service
vi.mock('../sentryService', () => ({
  default: {
    captureError: vi.fn()
  }
}));

describe('SanitizationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sanitizeHtml', () => {
    it('should return empty string for null or undefined input', () => {
      expect(sanitizationService.sanitizeHtml('')).toBe('');
      expect(sanitizationService.sanitizeHtml(null as any)).toBe('');
      expect(sanitizationService.sanitizeHtml(undefined as any)).toBe('');
    });

    it('should sanitize HTML content', () => {
      const input = '<p>Hello <script>alert("xss")</script> World</p>';
      const result = sanitizationService.sanitizeHtml(input);
      expect(result).toBe(input); // Mocked to return as-is
    });

    it('should truncate content when maxLength is specified', () => {
      const input = 'This is a very long text that should be truncated';
      const result = sanitizationService.sanitizeHtml(input, { maxLength: 10 });
      expect(result).toBe('This is a ...');
    });

    it('should normalize whitespace when preserveWhitespace is false', () => {
      const input = 'Hello    world   with   spaces';
      const result = sanitizationService.sanitizeHtml(input, { preserveWhitespace: false });
      expect(result).toBe('Hello world with spaces');
    });
  });

  describe('stripHtml', () => {
    it('should remove all HTML tags', () => {
      const input = '<p>Hello <strong>world</strong></p>';
      const result = sanitizationService.stripHtml(input);
      expect(result).toBe('Hello world');
    });

    it('should handle HTML entities', () => {
      const input = 'Hello&nbsp;&amp;&lt;&gt;&quot;&#x27;&#x2F;world';
      const result = sanitizationService.stripHtml(input);
      expect(result).toBe('Hello &<>"\'\/world');
    });

    it('should truncate when maxLength is specified', () => {
      const input = 'This is a long text';
      const result = sanitizationService.stripHtml(input, 10);
      expect(result).toBe('This is a ...');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      const input = 'Hello<script>alert("xss")</script>world';
      const result = sanitizationService.sanitizeInput(input);
      expect(result).toBe('Helloworldalert("xss")');
    });

    it('should remove javascript: protocol', () => {
      const input = 'javascript:alert("xss")';
      const result = sanitizationService.sanitizeInput(input);
      expect(result).toBe('alert("xss")');
    });

    it('should remove event handlers', () => {
      const input = 'onclick=alert("xss")';
      const result = sanitizationService.sanitizeInput(input);
      expect(result).toBe('');
    });

    it('should truncate when maxLength is specified', () => {
      const input = 'This is a long input';
      const result = sanitizationService.sanitizeInput(input, 10);
      expect(result).toBe('This is a ');
    });
  });

  describe('sanitizeEmail', () => {
    it('should normalize email addresses', () => {
      const input = 'TEST@EXAMPLE.COM  ';
      const result = sanitizationService.sanitizeEmail(input);
      expect(result).toBe('test@example.com');
    });

    it('should remove invalid characters', () => {
      const input = 'test@exam<>ple.com';
      const result = sanitizationService.sanitizeEmail(input);
      expect(result).toBe('test@example.com');
    });

    it('should enforce length limit', () => {
      const input = 'a'.repeat(300) + '@example.com';
      const result = sanitizationService.sanitizeEmail(input);
      expect(result.length).toBe(254);
    });
  });

  describe('sanitizePhone', () => {
    it('should keep only valid phone characters', () => {
      const input = '+91-9876543210 ext 123';
      const result = sanitizationService.sanitizePhone(input);
      expect(result).toBe('+91-9876543210  123');
    });

    it('should remove invalid characters', () => {
      const input = '+91abc9876def543210';
      const result = sanitizationService.sanitizePhone(input);
      expect(result).toBe('+919876543210');
    });

    it('should enforce length limit', () => {
      const input = '1'.repeat(30);
      const result = sanitizationService.sanitizePhone(input);
      expect(result.length).toBe(20);
    });
  });

  describe('sanitizeUrl', () => {
    it('should remove dangerous protocols', () => {
      const input = 'javascript:alert("xss")';
      const result = sanitizationService.sanitizeUrl(input);
      expect(result).toBe('');
    });

    it('should add https:// to URLs without protocol', () => {
      const input = 'example.com';
      const result = sanitizationService.sanitizeUrl(input);
      expect(result).toBe('https://example.com');
    });

    it('should preserve valid URLs', () => {
      const input = 'https://example.com/path';
      const result = sanitizationService.sanitizeUrl(input);
      expect(result).toBe('https://example.com/path');
    });

    it('should enforce length limit', () => {
      const input = 'https://example.com/' + 'a'.repeat(3000);
      const result = sanitizationService.sanitizeUrl(input);
      expect(result.length).toBe(2048);
    });
  });

  describe('sanitizeFileName', () => {
    it('should replace special characters with underscores', () => {
      const input = 'my file name!@#$.txt';
      const result = sanitizationService.sanitizeFileName(input);
      expect(result).toBe('my_file_name_.txt');
    });

    it('should remove multiple consecutive underscores', () => {
      const input = 'file___name.txt';
      const result = sanitizationService.sanitizeFileName(input);
      expect(result).toBe('file_name.txt');
    });

    it('should remove leading and trailing underscores', () => {
      const input = '___filename___.txt';
      const result = sanitizationService.sanitizeFileName(input);
      expect(result).toBe('filename.txt');
    });

    it('should enforce length limit', () => {
      const input = 'a'.repeat(300) + '.txt';
      const result = sanitizationService.sanitizeFileName(input);
      expect(result.length).toBe(255);
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('should remove dangerous characters', () => {
      const input = 'search<script>alert("xss")</script>';
      const result = sanitizationService.sanitizeSearchQuery(input);
      expect(result).toBe('searchscriptalert("xss")/script');
    });

    it('should normalize whitespace', () => {
      const input = 'search   query   with   spaces';
      const result = sanitizationService.sanitizeSearchQuery(input);
      expect(result).toBe('search query with spaces');
    });

    it('should enforce length limit', () => {
      const input = 'a'.repeat(150);
      const result = sanitizationService.sanitizeSearchQuery(input);
      expect(result.length).toBe(100);
    });
  });

  describe('sanitizeFormData', () => {
    it('should sanitize string fields', () => {
      const input = {
        name: 'John<script>alert("xss")</script>',
        email: 'john@example.com',
        age: 25
      };
      
      const result = sanitizationService.sanitizeFormData(input);
      expect(result.name).toBe('Johnscriptalert("xss")/script');
      expect(result.email).toBe('john@example.com');
      expect(result.age).toBe(25);
    });

    it('should handle array fields', () => {
      const input = {
        tags: ['tag1<script>', 'tag2', 'tag3>alert']
      };
      
      const result = sanitizationService.sanitizeFormData(input);
      expect(result.tags).toEqual(['tag1script', 'tag2', 'tag3alert']);
    });

    it('should apply field-specific configuration', () => {
      const input = {
        content: 'This is a very long content that should be truncated'
      };
      
      const config = {
        content: { maxLength: 10 }
      };
      
      const result = sanitizationService.sanitizeFormData(input, config);
      expect(result.content).toBe('This is a ');
    });
  });

  describe('sanitizeRichText', () => {
    it('should preserve allowed HTML tags', () => {
      const input = '<p>Hello <strong>world</strong></p>';
      const result = sanitizationService.sanitizeRichText(input);
      expect(result).toBe(input); // Mocked to return as-is
    });

    it('should enforce length limit', () => {
      const input = 'a'.repeat(15000);
      const result = sanitizationService.sanitizeRichText(input, 1000);
      expect(result).toBe('a'.repeat(1000) + '...');
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully and return safe defaults', () => {
      // Mock DOMPurify to throw an error
      const DOMPurify = require('dompurify').default;
      DOMPurify.sanitize.mockImplementationOnce(() => {
        throw new Error('DOMPurify error');
      });

      const result = sanitizationService.sanitizeHtml('<p>test</p>');
      expect(result).toBe('');
    });
  });
});
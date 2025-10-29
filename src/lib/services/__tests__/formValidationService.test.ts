import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formValidationService } from '../formValidationService';
import { z } from 'zod';

// Mock Supabase
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

// Mock Sentry service
vi.mock('../sentryService', () => ({
  default: {
    captureError: vi.fn()
  }
}));

// Mock sanitization service
vi.mock('../sanitizationService', () => ({
  sanitizationService: {
    sanitizeFormData: vi.fn((data) => data),
    sanitizeFileName: vi.fn((name) => name.replace(/[^a-zA-Z0-9.-]/g, '_')),
    sanitizeSearchQuery: vi.fn((query) => query.trim())
  }
}));

describe('FormValidationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateFormData', () => {
    const testSchema = z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email'),
      age: z.number().min(18, 'Must be at least 18')
    });

    it('should validate correct data', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      };

      const result = await formValidationService.validateFormData(validData, testSchema);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
      expect(result.sanitizedData).toEqual(validData);
    });

    it('should return validation errors for invalid data', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        age: 16
      };

      const result = await formValidationService.validateFormData(invalidData, testSchema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('name');
      expect(result.errors).toHaveProperty('email');
      expect(result.errors).toHaveProperty('age');
    });

    it('should handle server validation errors', async () => {
      const validData = {
        name: 'John Doe',
        email: 'existing@example.com',
        age: 25
      };

      // Mock Supabase to return existing user
      const { supabase } = await import('../../supabase');
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: '123' } })
        }))
      }));
      const mockFrom = vi.fn(() => ({ select: mockSelect }));
      (supabase.from as unknown).mockImplementation(mockFrom);

      const result = await formValidationService.validateFormData(
        validData,
        testSchema,
        { checkUniqueEmail: true }
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('email');
      expect(result.errors.email).toBe('This email address is already registered');
    });
  });

  describe('validateFileUpload', () => {
    it('should validate correct file', async () => {
      const mockFile = new File(['test content'], 'test.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      const result = await formValidationService.validateFileUpload(mockFile, {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png']
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject file that is too large', async () => {
      const mockFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg'
      });

      const result = await formValidationService.validateFileUpload(mockFile, {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg']
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('file');
      expect(result.errors.file).toContain('File size must be less than');
    });

    it('should reject file with invalid type', async () => {
      const mockFile = new File(['test'], 'test.txt', {
        type: 'text/plain'
      });

      const result = await formValidationService.validateFileUpload(mockFile, {
        allowedTypes: ['image/jpeg', 'image/png']
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('file');
      expect(result.errors.file).toContain('File type must be one of');
    });

    it('should reject file with malicious name', async () => {
      const mockFile = new File(['test'], '../../../etc/passwd', {
        type: 'image/jpeg'
      });

      const result = await formValidationService.validateFileUpload(mockFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('file');
      expect(result.errors.file).toBe('Invalid file name characters');
    });
  });

  describe('validateMultipleFiles', () => {
    it('should validate multiple correct files', async () => {
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.png', { type: 'image/png' })
      ];

      const result = await formValidationService.validateMultipleFiles(files, {
        maxFiles: 5,
        allowedTypes: ['image/jpeg', 'image/png']
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject when too many files', async () => {
      const files = Array.from({ length: 6 }, (_, i) =>
        new File([`test${i}`], `test${i}.jpg`, { type: 'image/jpeg' })
      );

      const result = await formValidationService.validateMultipleFiles(files, {
        maxFiles: 5
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('files');
      expect(result.errors.files).toBe('Maximum 5 files allowed');
    });

    it('should return individual file errors', async () => {
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.txt', { type: 'text/plain' }) // Invalid type
      ];

      const result = await formValidationService.validateMultipleFiles(files, {
        allowedTypes: ['image/jpeg', 'image/png']
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('file_1_file');
    });
  });

  describe('validateSearchQuery', () => {
    it('should validate correct search query', () => {
      const result = formValidationService.validateSearchQuery('books fiction');

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
      expect(result.sanitizedData).toBe('books fiction');
    });

    it('should reject empty query', () => {
      const result = formValidationService.validateSearchQuery('');

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('query');
    });

    it('should reject very short query', () => {
      const result = formValidationService.validateSearchQuery('a');

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('query');
      expect(result.errors.query).toBe('Search query must be at least 2 characters long');
    });

    it('should reject overly long query', () => {
      const longQuery = 'a'.repeat(150);
      const result = formValidationService.validateSearchQuery(longQuery);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('query');
      expect(result.errors.query).toBe('Search query is too long');
    });

    it('should reject queries with SQL injection patterns', () => {
      const maliciousQueries = [
        'books; DROP TABLE users;',
        'books UNION SELECT * FROM users',
        'books -- comment',
        'books /* comment */'
      ];

      maliciousQueries.forEach(query => {
        const result = formValidationService.validateSearchQuery(query);
        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveProperty('query');
        expect(result.errors.query).toBe('Invalid search query');
      });
    });
  });
});

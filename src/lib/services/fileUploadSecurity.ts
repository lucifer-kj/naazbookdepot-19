import sentryService from './sentryService';
import { sanitizationService } from './sanitizationService';

export interface FileSecurityConfig {
  maxFileSize: number; // in bytes
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  maxFiles: number;
  scanForMalware: boolean;
  validateImageDimensions: boolean;
  maxImageWidth?: number;
  maxImageHeight?: number;
  requireImageOptimization: boolean;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedFile?: File;
  metadata?: FileMetadata;
}

export interface FileMetadata {
  originalName: string;
  sanitizedName: string;
  size: number;
  mimeType: string;
  extension: string;
  dimensions?: { width: number; height: number };
  hash?: string;
}

export interface MalwareCheckResult {
  isSafe: boolean;
  threats: string[];
  confidence: number;
}

class FileUploadSecurity {
  private readonly DANGEROUS_EXTENSIONS = [
    'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar', 'app', 'deb', 'pkg', 'dmg',
    'php', 'asp', 'aspx', 'jsp', 'pl', 'py', 'rb', 'sh', 'ps1', 'psm1'
  ];

  private readonly DANGEROUS_MIME_TYPES = [
    'application/x-executable',
    'application/x-msdownload',
    'application/x-msdos-program',
    'application/x-msi',
    'application/x-bat',
    'text/x-php',
    'application/x-php',
    'application/php'
  ];

  private readonly IMAGE_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff'
  ];

  private readonly DOCUMENT_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

  /**
   * Validate uploaded files against security policies
   */
  async validateFiles(
    files: FileList | File[],
    config: FileSecurityConfig
  ): Promise<FileValidationResult[]> {
    const results: FileValidationResult[] = [];
    const fileArray = Array.from(files);

    try {
      // Check file count
      if (fileArray.length > config.maxFiles) {
        return [{
          isValid: false,
          errors: [`Too many files. Maximum allowed: ${config.maxFiles}`],
          warnings: []
        }];
      }

      // Validate each file
      for (const file of fileArray) {
        const result = await this.validateSingleFile(file, config);
        results.push(result);
      }

      return results;
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('File validation failed'),
        {
          action: 'validate_files',
          additionalData: { fileCount: fileArray.length, config }
        }
      );

      return [{
        isValid: false,
        errors: ['File validation failed'],
        warnings: []
      }];
    }
  }

  /**
   * Validate a single file
   */
  async validateSingleFile(
    file: File,
    config: FileSecurityConfig
  ): Promise<FileValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Basic file validation
      if (!file || !(file instanceof File)) {
        return {
          isValid: false,
          errors: ['Invalid file object'],
          warnings: []
        };
      }

      // File size validation
      if (file.size > config.maxFileSize) {
        errors.push(`File size exceeds limit. Maximum: ${this.formatFileSize(config.maxFileSize)}`);
      }

      if (file.size === 0) {
        errors.push('File is empty');
      }

      // File name validation
      const sanitizedName = this.sanitizeFileName(file.name);
      if (!sanitizedName) {
        errors.push('Invalid file name');
      }

      // Extension validation
      const extension = this.getFileExtension(file.name).toLowerCase();
      if (!config.allowedExtensions.includes(extension)) {
        errors.push(`File type not allowed. Allowed types: ${config.allowedExtensions.join(', ')}`);
      }

      // Check for dangerous extensions
      if (this.DANGEROUS_EXTENSIONS.includes(extension)) {
        errors.push('File type is potentially dangerous');
      }

      // MIME type validation
      const detectedMimeType = await this.detectMimeType(file);
      if (!config.allowedMimeTypes.includes(detectedMimeType)) {
        errors.push(`File format not allowed. Detected: ${detectedMimeType}`);
      }

      // Check for dangerous MIME types
      if (this.DANGEROUS_MIME_TYPES.includes(detectedMimeType)) {
        errors.push('File format is potentially dangerous');
      }

      // MIME type and extension consistency check
      if (!this.isMimeTypeConsistent(extension, detectedMimeType)) {
        warnings.push('File extension and content type do not match');
      }

      // Image-specific validation
      let dimensions: { width: number; height: number } | undefined;
      if (this.IMAGE_MIME_TYPES.includes(detectedMimeType)) {
        dimensions = await this.getImageDimensions(file);
        
        if (config.validateImageDimensions && dimensions) {
          if (config.maxImageWidth && dimensions.width > config.maxImageWidth) {
            errors.push(`Image width exceeds limit. Maximum: ${config.maxImageWidth}px`);
          }
          
          if (config.maxImageHeight && dimensions.height > config.maxImageHeight) {
            errors.push(`Image height exceeds limit. Maximum: ${config.maxImageHeight}px`);
          }
        }
      }

      // Malware scanning
      if (config.scanForMalware) {
        const malwareResult = await this.scanForMalware(file);
        if (!malwareResult.isSafe) {
          errors.push(`Security threat detected: ${malwareResult.threats.join(', ')}`);
        }
      }

      // Content validation
      const contentValidation = await this.validateFileContent(file, detectedMimeType);
      if (!contentValidation.isValid) {
        errors.push(...contentValidation.errors);
      }

      // Generate file hash for integrity
      const hash = await this.generateFileHash(file);

      const metadata: FileMetadata = {
        originalName: file.name,
        sanitizedName,
        size: file.size,
        mimeType: detectedMimeType,
        extension,
        dimensions,
        hash
      };

      // Create sanitized file if needed
      let sanitizedFile: File | undefined;
      if (errors.length === 0) {
        sanitizedFile = new File([file], sanitizedName, {
          type: detectedMimeType,
          lastModified: file.lastModified
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        sanitizedFile,
        metadata
      };
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Single file validation failed'),
        {
          action: 'validate_single_file',
          additionalData: { fileName: file.name, fileSize: file.size }
        }
      );

      return {
        isValid: false,
        errors: ['File validation failed'],
        warnings: []
      };
    }
  }

  /**
   * Sanitize file name
   */
  private sanitizeFileName(fileName: string): string {
    if (!fileName) return '';

    return sanitizationService.sanitizeFileName(fileName)
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .substring(0, 255); // Limit length
  }

  /**
   * Get file extension
   */
  private getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot > 0 ? fileName.substring(lastDot + 1) : '';
  }

  /**
   * Detect actual MIME type by reading file content
   */
  private async detectMimeType(file: File): Promise<string> {
    try {
      // Read first few bytes to detect file signature
      const buffer = await this.readFileBytes(file, 0, 32);
      const signature = this.getMimeTypeFromSignature(buffer);
      
      if (signature) {
        return signature;
      }

      // Fallback to browser-detected MIME type
      return file.type || 'application/octet-stream';
    } catch (error) {
      return file.type || 'application/octet-stream';
    }
  }

  /**
   * Get MIME type from file signature (magic bytes)
   */
  private getMimeTypeFromSignature(buffer: ArrayBuffer): string | null {
    const bytes = new Uint8Array(buffer);
    
    // Common file signatures
    const signatures: { signature: number[]; mimeType: string }[] = [
      { signature: [0xFF, 0xD8, 0xFF], mimeType: 'image/jpeg' },
      { signature: [0x89, 0x50, 0x4E, 0x47], mimeType: 'image/png' },
      { signature: [0x47, 0x49, 0x46, 0x38], mimeType: 'image/gif' },
      { signature: [0x52, 0x49, 0x46, 0x46], mimeType: 'image/webp' },
      { signature: [0x25, 0x50, 0x44, 0x46], mimeType: 'application/pdf' },
      { signature: [0x50, 0x4B, 0x03, 0x04], mimeType: 'application/zip' },
      { signature: [0x50, 0x4B, 0x05, 0x06], mimeType: 'application/zip' },
      { signature: [0x50, 0x4B, 0x07, 0x08], mimeType: 'application/zip' }
    ];

    for (const { signature, mimeType } of signatures) {
      if (this.matchesSignature(bytes, signature)) {
        return mimeType;
      }
    }

    return null;
  }

  /**
   * Check if bytes match a signature
   */
  private matchesSignature(bytes: Uint8Array, signature: number[]): boolean {
    if (bytes.length < signature.length) return false;
    
    for (let i = 0; i < signature.length; i++) {
      if (bytes[i] !== signature[i]) return false;
    }
    
    return true;
  }

  /**
   * Check if MIME type is consistent with file extension
   */
  private isMimeTypeConsistent(extension: string, mimeType: string): boolean {
    const consistencyMap: Record<string, string[]> = {
      'jpg': ['image/jpeg'],
      'jpeg': ['image/jpeg'],
      'png': ['image/png'],
      'gif': ['image/gif'],
      'webp': ['image/webp'],
      'pdf': ['application/pdf'],
      'txt': ['text/plain'],
      'csv': ['text/csv', 'application/csv'],
      'doc': ['application/msword'],
      'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'xls': ['application/vnd.ms-excel'],
      'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    };

    const expectedMimeTypes = consistencyMap[extension.toLowerCase()];
    return expectedMimeTypes ? expectedMimeTypes.includes(mimeType) : true;
  }

  /**
   * Get image dimensions
   */
  private async getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
    try {
      return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve({ width: img.width, height: img.height });
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(null);
        };
        
        img.src = url;
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Basic malware scanning (client-side heuristics)
   */
  private async scanForMalware(file: File): Promise<MalwareCheckResult> {
    try {
      const threats: string[] = [];
      let confidence = 0;

      // Check file size (unusually large files might be suspicious)
      if (file.size > 100 * 1024 * 1024) { // 100MB
        threats.push('Unusually large file size');
        confidence += 0.3;
      }

      // Check for suspicious file names
      const suspiciousPatterns = [
        /virus/i, /malware/i, /trojan/i, /keylog/i, /backdoor/i,
        /exploit/i, /payload/i, /shell/i, /inject/i
      ];

      if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
        threats.push('Suspicious file name');
        confidence += 0.5;
      }

      // Read file content for basic pattern matching
      if (file.size < 10 * 1024 * 1024) { // Only scan files smaller than 10MB
        const content = await this.readFileAsText(file);
        const suspiciousContent = [
          /eval\s*\(/i, /document\.write/i, /innerHTML/i,
          /<script/i, /javascript:/i, /vbscript:/i,
          /cmd\.exe/i, /powershell/i, /system\(/i
        ];

        if (suspiciousContent.some(pattern => pattern.test(content))) {
          threats.push('Suspicious content detected');
          confidence += 0.7;
        }
      }

      return {
        isSafe: confidence < 0.5,
        threats,
        confidence
      };
    } catch (error) {
      // If scanning fails, err on the side of caution
      return {
        isSafe: false,
        threats: ['Malware scan failed'],
        confidence: 1.0
      };
    }
  }

  /**
   * Validate file content based on MIME type
   */
  private async validateFileContent(
    file: File,
    mimeType: string
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      if (mimeType.startsWith('text/')) {
        // Validate text files
        const content = await this.readFileAsText(file);
        
        // Check for null bytes (binary content in text file)
        if (content.includes('\0')) {
          errors.push('Text file contains binary data');
        }

        // Check for excessively long lines
        const lines = content.split('\n');
        if (lines.some(line => line.length > 10000)) {
          errors.push('Text file contains excessively long lines');
        }
      }

      if (mimeType === 'application/json') {
        // Validate JSON files
        const content = await this.readFileAsText(file);
        const jsonResult = sanitizationService.sanitizeJSONInput(content);
        
        if (!jsonResult.isValid) {
          errors.push(jsonResult.error || 'Invalid JSON format');
        }
      }

      if (mimeType.startsWith('image/')) {
        // Additional image validation
        const dimensions = await this.getImageDimensions(file);
        if (!dimensions) {
          errors.push('Invalid or corrupted image file');
        }
      }

      return { isValid: errors.length === 0, errors };
    } catch (error) {
      return { isValid: false, errors: ['Content validation failed'] };
    }
  }

  /**
   * Generate file hash for integrity checking
   */
  private async generateFileHash(file: File): Promise<string> {
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      // Fallback to simple hash
      return `fallback_${file.size}_${file.lastModified}_${file.name.length}`;
    }
  }

  /**
   * Read file bytes
   */
  private async readFileBytes(file: File, start: number, length: number): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const blob = file.slice(start, start + length);
      
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      
      reader.readAsArrayBuffer(blob);
    });
  }

  /**
   * Read file as text
   */
  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      
      reader.readAsText(file);
    });
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}

// Pre-configured security policies
export const fileSecurityPolicies = {
  images: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'
    ],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxFiles: 10,
    scanForMalware: true,
    validateImageDimensions: true,
    maxImageWidth: 4000,
    maxImageHeight: 4000,
    requireImageOptimization: true
  },

  documents: {
    maxFileSize: 25 * 1024 * 1024, // 25MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv'
    ],
    allowedExtensions: ['pdf', 'doc', 'docx', 'txt', 'csv'],
    maxFiles: 5,
    scanForMalware: true,
    validateImageDimensions: false,
    requireImageOptimization: false
  },

  avatars: {
    maxFileSize: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    allowedExtensions: ['jpg', 'jpeg', 'png'],
    maxFiles: 1,
    scanForMalware: true,
    validateImageDimensions: true,
    maxImageWidth: 1000,
    maxImageHeight: 1000,
    requireImageOptimization: true
  }
} as const;

// Create singleton instance
export const fileUploadSecurity = new FileUploadSecurity();

export default fileUploadSecurity;

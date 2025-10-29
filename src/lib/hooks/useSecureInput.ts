import { useState, useCallback, useEffect } from 'react';
import { sanitizationService } from '../services/sanitizationService';
import { fileUploadSecurity, FileSecurityConfig, FileValidationResult, fileSecurityPolicies } from '../services/fileUploadSecurity';
import { useAdvancedRateLimit } from './useRateLimit';
import { rateLimitConfigs } from '../services/rateLimitService';
import sentryService from '../services/sentryService';

export interface SecureInputOptions {
  maxLength?: number;
  minLength?: number;
  allowedPatterns?: RegExp[];
  blockedPatterns?: RegExp[];
  requireAlphanumeric?: boolean;
  allowSpecialChars?: string[];
  enableRealTimeValidation?: boolean;
  debounceMs?: number;
  sanitizationLevel?: 'basic' | 'strict' | 'html' | 'sql' | 'nosql';
  customValidator?: (input: string) => boolean | { isValid: boolean; error?: string };
}

export interface SecureInputResult {
  value: string;
  sanitizedValue: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isValidating: boolean;
  validate: () => void;
  reset: () => void;
}

export interface SecureFileUploadOptions {
  securityPolicy: keyof typeof import('../services/fileUploadSecurity').fileSecurityPolicies | FileSecurityConfig;
  enableRealTimeValidation?: boolean;
  onValidationComplete?: (results: FileValidationResult[]) => void;
  onSecurityThreat?: (threat: string) => void;
}

export interface SecureFileUploadResult {
  files: File[];
  validationResults: FileValidationResult[];
  isValidating: boolean;
  hasErrors: boolean;
  errors: string[];
  warnings: string[];
  uploadFiles: (files: FileList | File[]) => Promise<void>;
  removeFile: (index: number) => void;
  reset: () => void;
}

/**
 * Hook for secure text input validation and sanitization
 */
export function useSecureInput(
  initialValue: string = '',
  options: SecureInputOptions = {}
): SecureInputResult {
  const [value, setValue] = useState(initialValue);
  const [sanitizedValue, setSanitizedValue] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Rate limiting for validation
  const rateLimitHook = useAdvancedRateLimit({
    config: rateLimitConfigs.forms,
    action: 'input_validation'
  });

  const validateInput = useCallback(async (inputValue: string) => {
    if (!rateLimitHook.executeWithRateLimit) return;

    try {
      await rateLimitHook.executeWithRateLimit(async () => {
        setIsValidating(true);

        // Apply sanitization based on level
        let sanitized = inputValue;
        switch (options.sanitizationLevel) {
          case 'strict':
            sanitized = sanitizationService.sanitizeInput(inputValue, options.maxLength);
            break;
          case 'html':
            sanitized = sanitizationService.sanitizeHtml(inputValue);
            break;
          case 'sql':
            sanitized = sanitizationService.sanitizeSQLInput(inputValue);
            break;
          case 'nosql':
            sanitized = JSON.stringify(sanitizationService.sanitizeNoSQLInput(inputValue));
            break;
          default:
            sanitized = sanitizationService.sanitizeInput(inputValue, options.maxLength);
        }

        // Comprehensive validation
        const validationResult = sanitizationService.validateAndSanitizeInput(sanitized, {
          maxLength: options.maxLength,
          minLength: options.minLength,
          allowedPatterns: options.allowedPatterns,
          blockedPatterns: options.blockedPatterns,
          requireAlphanumeric: options.requireAlphanumeric,
          allowSpecialChars: options.allowSpecialChars,
          customValidator: options.customValidator
        });

        // Custom validation
        if (options.customValidator) {
          const customResult = options.customValidator(validationResult.sanitized);
          if (typeof customResult === 'object') {
            if (!customResult.isValid) {
              validationResult.errors.push(customResult.error || 'Custom validation failed');
              validationResult.isValid = false;
            }
          } else if (!customResult) {
            validationResult.errors.push('Custom validation failed');
            validationResult.isValid = false;
          }
        }

        setSanitizedValue(validationResult.sanitized);
        setIsValid(validationResult.isValid);
        setErrors(validationResult.errors);
        setWarnings([]);

        setIsValidating(false);
      });
    } catch (error) {
      setIsValidating(false);
      setIsValid(false);
      setErrors(['Validation rate limit exceeded']);
      
      sentryService.captureError(
        error instanceof Error ? error : new Error('Input validation failed'),
        {
          action: 'secure_input_validation',
          additionalData: { inputValue: inputValue.substring(0, 100), options }
        }
      );
    }
  }, [options, rateLimitHook]);

  // Debounced validation for real-time validation
  useEffect(() => {
    if (!options.enableRealTimeValidation) return;

    const debounceMs = options.debounceMs || 300;
    const timeoutId = setTimeout(() => {
      if (value !== initialValue) {
        validateInput(value);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [value, validateInput, options.enableRealTimeValidation, options.debounceMs, initialValue]);

  const validate = useCallback(() => {
    validateInput(value);
  }, [value, validateInput]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setSanitizedValue('');
    setIsValid(true);
    setErrors([]);
    setWarnings([]);
    setIsValidating(false);
  }, [initialValue]);

  // Update value and trigger validation if real-time is enabled
  const handleValueChange = useCallback((newValue: string) => {
    setValue(newValue);
    
    if (!options.enableRealTimeValidation) {
      // Immediate basic sanitization for display
      const basicSanitized = sanitizationService.sanitizeInput(newValue);
      setSanitizedValue(basicSanitized);
    }
  }, [options.enableRealTimeValidation]);

  // Return object with setValue method
  const result = {
    value,
    sanitizedValue,
    isValid,
    errors,
    warnings,
    isValidating,
    validate,
    reset,
    setValue: handleValueChange
  };

  return result;


}

/**
 * Hook for secure file upload validation
 */
export function useSecureFileUpload(
  options: SecureFileUploadOptions
): SecureFileUploadResult {
  const [files, setFiles] = useState<File[]>([]);
  const [validationResults, setValidationResults] = useState<FileValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Rate limiting for file uploads
  const rateLimitHook = useAdvancedRateLimit({
    config: rateLimitConfigs.uploads,
    action: 'file_upload_validation'
  });

  const getSecurityConfig = useCallback((): FileSecurityConfig => {
    if (typeof options.securityPolicy === 'string') {
      return fileSecurityPolicies[options.securityPolicy];
    }
    return options.securityPolicy;
  }, [options.securityPolicy]);

  const uploadFiles = useCallback(async (fileList: FileList | File[]) => {
    if (!rateLimitHook.executeWithRateLimit) return;

    try {
      await rateLimitHook.executeWithRateLimit(async () => {
        setIsValidating(true);
        setErrors([]);
        setWarnings([]);

        const config = getSecurityConfig();
        const results = await fileUploadSecurity.validateFiles(fileList, config);

        // Check for security threats
        const threats = results.flatMap(result => 
          result.errors.filter(error => 
            error.includes('dangerous') || 
            error.includes('threat') || 
            error.includes('malware')
          )
        );

        if (threats.length > 0 && options.onSecurityThreat) {
          threats.forEach(threat => options.onSecurityThreat!(threat));
        }

        // Collect all errors and warnings
        const allErrors = results.flatMap(result => result.errors);
        const allWarnings = results.flatMap(result => result.warnings);

        // Only keep valid files
        const validFiles = results
          .filter(result => result.isValid && result.sanitizedFile)
          .map(result => result.sanitizedFile!);

        setFiles(validFiles);
        setValidationResults(results);
        setErrors(allErrors);
        setWarnings(allWarnings);
        setIsValidating(false);

        if (options.onValidationComplete) {
          options.onValidationComplete(results);
        }

        // Log security events
        if (allErrors.length > 0) {
          sentryService.addBreadcrumb(
            'File upload validation failed',
            'security',
            'warning',
            { 
              fileCount: Array.from(fileList).length,
              errors: allErrors,
              threats: threats.length
            }
          );
        }
      });
    } catch (error) {
      setIsValidating(false);
      setErrors(['File upload rate limit exceeded']);
      
      sentryService.captureError(
        error instanceof Error ? error : new Error('File upload validation failed'),
        {
          action: 'secure_file_upload',
          additionalData: { fileCount: Array.from(fileList).length }
        }
      );
    }
  }, [rateLimitHook, getSecurityConfig, options]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setValidationResults(prev => prev.filter((_, i) => i !== index));
    
    // Recalculate errors and warnings
    const remainingResults = validationResults.filter((_, i) => i !== index);
    setErrors(remainingResults.flatMap(result => result.errors));
    setWarnings(remainingResults.flatMap(result => result.warnings));
  }, [validationResults]);

  const reset = useCallback(() => {
    setFiles([]);
    setValidationResults([]);
    setErrors([]);
    setWarnings([]);
    setIsValidating(false);
  }, []);

  const hasErrors = errors.length > 0;

  return {
    files,
    validationResults,
    isValidating,
    hasErrors,
    errors,
    warnings,
    uploadFiles,
    removeFile,
    reset
  };
}

/**
 * Hook for secure form validation (combines multiple inputs)
 */
export function useSecureForm<T extends Record<string, unknown>>(
  initialValues: T,
  validationRules: Record<keyof T, SecureInputOptions>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string[]>>>({});
  const [isValid, setIsValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback(async (fieldName: keyof T, value: unknown): Promise<unknown> => {
    const rules = validationRules[fieldName];
    if (!rules) return { isValid: true, sanitized: value, errors: [] };

    const result = sanitizationService.validateAndSanitizeInput(value, rules);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: result.errors
    }));

    return result;
  }, [validationRules]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    setIsValidating(true);
    const fieldErrors: Partial<Record<keyof T, string[]>> = {};
    let formIsValid = true;

    for (const [fieldName, value] of Object.entries(values)) {
      const result = await validateField(fieldName as keyof T, value);
      if (result && !result.isValid) {
        fieldErrors[fieldName as keyof T] = result.errors;
        formIsValid = false;
      }
    }

    setErrors(fieldErrors);
    setIsValid(formIsValid);
    setIsValidating(false);

    return formIsValid;
  }, [values, validateField]);

  const updateField = useCallback((fieldName: keyof T, value: unknown) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    // Real-time validation for the field
    validateField(fieldName, value);
  }, [validateField]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsValid(false);
    setIsValidating(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isValid,
    isValidating,
    updateField,
    validateForm,
    reset
  };
}

export default {
  useSecureInput,
  useSecureFileUpload,
  useSecureForm
};

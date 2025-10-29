import React from 'react';
import { useForm, UseFormProps, UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema, ZodError } from 'zod';
import { sanitizationService, SanitizationOptions } from '../services/sanitizationService';
import sentryService from '../services/sentryService';

export interface FormValidationConfig<T extends FieldValues> {
  schema: ZodSchema<T>;
  sanitizationConfig?: Partial<Record<keyof T, SanitizationOptions>>;
  onSubmit?: (data: T) => Promise<void> | void;
  onError?: (errors: Record<string, string>) => void;
  enableRealTimeValidation?: boolean;
  sanitizeOnChange?: boolean;
}

export interface UseFormValidationReturn<T extends FieldValues> extends UseFormReturn<T> {
  handleSubmitWithValidation: (onValid: (data: T) => Promise<void> | void) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  validateField: (fieldName: Path<T>, value: unknown) => Promise<string | null>;
  sanitizeFormData: (data: T) => T;
  isSubmitting: boolean;
  submitError: string | null;
  clearSubmitError: () => void;
}

export function useFormValidation<T extends FieldValues>(
  config: FormValidationConfig<T>,
  formOptions?: Omit<UseFormProps<T>, 'resolver'>
): UseFormValidationReturn<T> {
  const {
    schema,
    sanitizationConfig = {},
    onSubmit,
    onError,
    enableRealTimeValidation = true,
    sanitizeOnChange = true,
  } = config;

  const form = useForm<T>({
    ...formOptions,
    resolver: zodResolver(schema),
    mode: enableRealTimeValidation ? 'onChange' : 'onSubmit',
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const clearSubmitError = React.useCallback(() => {
    setSubmitError(null);
  }, []);

  const sanitizeFormData = React.useCallback((data: T): T => {
    try {
      return sanitizationService.sanitizeFormData(data as Record<string, unknown>, sanitizationConfig || {}) as T;
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Form data sanitization failed'),
        {
          action: 'sanitize_form_data',
          additionalData: { formData: data }
        }
      );
      return data;
    }
  }, [sanitizationConfig]);

  const validateField = React.useCallback(async (
    fieldName: Path<T>,
    value: unknown
  ): Promise<string | null> => {
    try {
      // Simple validation - just check if the value passes basic validation
      if (value === undefined || value === null || value === '') {
        return 'This field is required';
      }
      return null;
    } catch (error) {
      return 'Validation error';
    }
  }, []);

  const handleSubmitWithValidation = React.useCallback(
    (onValid: (data: T) => Promise<void> | void) => {
      return async (e?: React.BaseSyntheticEvent) => {
        if (e) {
          e.preventDefault();
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
          const formData = form.getValues();
          
          // Sanitize form data before validation
          const sanitizedData = sanitizeFormData(formData);
          
          // Validate sanitized data
          const validatedData = await schema.parseAsync(sanitizedData);
          
          // Call the onValid callback
          await onValid(validatedData);
          
          // Call the optional onSubmit callback
          if (onSubmit) {
            await onSubmit(validatedData);
          }
        } catch (error) {
          if (error instanceof ZodError) {
            // Handle validation errors
            const fieldErrors: Record<string, string> = {};
            error.errors.forEach((err) => {
              const fieldName = err.path.join('.');
              fieldErrors[fieldName] = err.message;
            });
            
            // Set form errors
            Object.entries(fieldErrors).forEach(([field, message]) => {
              form.setError(field as Path<T>, { message });
            });
            
            if (onError) {
              onError(fieldErrors);
            }
          } else {
            // Handle other errors
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            setSubmitError(errorMessage);
            
            sentryService.captureError(
              error instanceof Error ? error : new Error('Form submission failed'),
              {
                action: 'form_submit',
                additionalData: { formData: form.getValues() }
              }
            );
          }
        } finally {
          setIsSubmitting(false);
        }
      };
    },
    [form, schema, sanitizeFormData, onSubmit, onError]
  );

  // Enhanced setValue with sanitization
  const setValueWithSanitization = React.useCallback(
    (name: Path<T>, value: unknown, options?: Parameters<typeof form.setValue>[2]) => {
      if (sanitizeOnChange && typeof value === 'string') {
        const sanitizedValue = sanitizationService.sanitizeInput(value);
        form.setValue(name, sanitizedValue as unknown, options);
      } else {
        form.setValue(name, value, options);
      }
    },
    [form, sanitizeOnChange]
  );

  return {
    ...form,
    setValue: setValueWithSanitization,
    handleSubmitWithValidation,
    validateField,
    sanitizeFormData,
    isSubmitting,
    submitError,
    clearSubmitError,
  };
}

// Utility hook for common form patterns
export function useContactForm() {
  const [schema, setSchema] = React.useState<ZodSchema | null>(null);

  React.useEffect(() => {
    import('../validation/schemas').then(({ contactFormSchema }) => {
      setSchema(contactFormSchema);
    });
  }, []);

  return useFormValidation({
    schema: schema!,
    sanitizationConfig: {
      name: { maxLength: 50 },
      email: { maxLength: 254 },
      phone: { maxLength: 20 },
      subject: { maxLength: 100 },
      message: { maxLength: 1000, stripTags: true },
    },
    enableRealTimeValidation: true,
    sanitizeOnChange: true,
  });
}

export function useAuthForm(type: 'signin' | 'signup' | 'forgot' | 'reset') {
  const getSchema = async () => {
    const schemas = await import('../validation/schemas');
    switch (type) {
      case 'signin':
        return schemas.signInSchema;
      case 'signup':
        return schemas.signUpSchema;
      case 'forgot':
        return schemas.forgotPasswordSchema;
      case 'reset':
        return schemas.resetPasswordSchema;
      default:
        return schemas.signInSchema;
    }
  };

  const [schema, setSchema] = React.useState<ZodSchema | null>(null);

  React.useEffect(() => {
    getSchema().then(setSchema);
  }, [type, getSchema]);

  return useFormValidation({
    schema: schema!,
    sanitizationConfig: {
      email: { maxLength: 254 },
      fullName: { maxLength: 50 },
      password: { maxLength: 128 },
      confirmPassword: { maxLength: 128 },
    },
    enableRealTimeValidation: false, // Only validate on submit for auth forms
    sanitizeOnChange: true,
  });
}

export function useProductForm() {
  const [schema, setSchema] = React.useState<ZodSchema | null>(null);

  React.useEffect(() => {
    import('../validation/schemas').then(({ productSchema }) => {
      setSchema(productSchema);
    });
  }, []);

  return useFormValidation({
    schema: schema!,
    sanitizationConfig: {
      title: { maxLength: 200 },
      description: { maxLength: 2000, stripTags: true },
      author: { maxLength: 100 },
      publisher: { maxLength: 100 },
      isbn: { maxLength: 20 },
      dimensions: { maxLength: 50 },
    },
    enableRealTimeValidation: true,
    sanitizeOnChange: true,
  });
}

export function useAddressForm() {
  const [schema, setSchema] = React.useState<ZodSchema | null>(null);

  React.useEffect(() => {
    import('../validation/schemas').then(({ addressSchema }) => {
      setSchema(addressSchema);
    });
  }, []);

  return useFormValidation({
    schema: schema!,
    sanitizationConfig: {
      fullName: { maxLength: 50 },
      phone: { maxLength: 20 },
      addressLine1: { maxLength: 100 },
      addressLine2: { maxLength: 100 },
      city: { maxLength: 50 },
      state: { maxLength: 50 },
      pincode: { maxLength: 6 },
      country: { maxLength: 50 },
    },
    enableRealTimeValidation: true,
    sanitizeOnChange: true,
  });
}

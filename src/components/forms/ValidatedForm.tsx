import React from 'react';
import { FormProvider, FieldValues } from 'react-hook-form';
import { ZodSchema } from 'zod';
import { useFormValidation, FormValidationConfig } from '@/lib/hooks/useFormValidation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormField } from '@/components/forms/FormField';

export interface ValidatedFormProps<T extends FieldValues> {
  schema: ZodSchema<T>;
  onSubmit: (data: T) => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
  submitButtonText?: string;
  submitButtonClassName?: string;
  showSubmitButton?: boolean;
  disabled?: boolean;
  validationConfig?: Partial<FormValidationConfig<T>>;
  defaultValues?: Partial<T>;
}

export function ValidatedForm<T extends FieldValues>({
  schema,
  onSubmit,
  children,
  className,
  submitButtonText = 'Submit',
  submitButtonClassName,
  showSubmitButton = true,
  disabled = false,
  validationConfig = {},
  defaultValues,
}: ValidatedFormProps<T>) {
  const form = useFormValidation<T>({
    schema,
    onSubmit,
    ...validationConfig,
  }, {
    defaultValues: defaultValues as unknown,
  });

  const {
    handleSubmitWithValidation,
    isSubmitting,
    submitError,
    clearSubmitError,
    formState: { isValid, isDirty }
  } = form;

  const handleFormSubmit = handleSubmitWithValidation(onSubmit);

  React.useEffect(() => {
    if (submitError) {
      // Clear error after 5 seconds
      const timer = setTimeout(clearSubmitError, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitError, clearSubmitError]);

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleFormSubmit}
        className={cn('space-y-6', className)}
        noValidate
      >
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {submitError}
            </AlertDescription>
          </Alert>
        )}

        {children}

        {showSubmitButton && (
          <Button
            type="submit"
            disabled={disabled || isSubmitting || (!isDirty && !isValid)}
            className={cn('w-full', submitButtonClassName)}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Processing...' : submitButtonText}
          </Button>
        )}
      </form>
    </FormProvider>
  );
}

// Specialized form components for common use cases

export interface ContactFormProps {
  onSubmit: (data: unknown) => Promise<void>;
  className?: string;
}

export function ContactForm({ onSubmit, className }: ContactFormProps) {
  const [schema, setSchema] = React.useState<ZodSchema | null>(null);

  React.useEffect(() => {
    import('@/lib/validation/schemas').then(({ contactFormSchema }) => {
      setSchema(contactFormSchema);
    });
  }, []);

  if (!schema) {
    return <div>Loading...</div>;
  }

  return (
    <ValidatedForm
      schema={schema}
      onSubmit={onSubmit}
      className={className}
      submitButtonText="Send Message"
      validationConfig={{
        sanitizationConfig: {
          name: { maxLength: 50 },
          email: { maxLength: 254 },
          phone: { maxLength: 20 },
          subject: { maxLength: 100 },
          message: { maxLength: 1000, stripTags: true },
        },
      }}
    >
      <FormField
        name="name"
        label="Full Name"
        placeholder="Enter your full name"
        required
        maxLength={50}
      />
      
      <FormField
        name="email"
        label="Email Address"
        type="email"
        placeholder="Enter your email address"
        required
        maxLength={254}
      />
      
      <FormField
        name="phone"
        label="Phone Number"
        type="tel"
        placeholder="Enter your phone number"
        maxLength={20}
      />
      
      <FormField
        name="subject"
        label="Subject"
        placeholder="Enter message subject"
        required
        maxLength={100}
      />
      
      <FormField
        name="category"
        label="Category"
        type="select"
        options={[
          { value: 'general', label: 'General Inquiry' },
          { value: 'support', label: 'Support' },
          { value: 'order', label: 'Order Related' },
          { value: 'feedback', label: 'Feedback' },
          { value: 'complaint', label: 'Complaint' },
        ]}
        required
      />
      
      <FormField
        name="message"
        label="Message"
        type="textarea"
        placeholder="Enter your message"
        required
        maxLength={1000}
        rows={5}
      />
    </ValidatedForm>
  );
}

export interface NewsletterFormProps {
  onSubmit: (data: unknown) => Promise<void>;
  className?: string;
}

export function NewsletterForm({ onSubmit, className }: NewsletterFormProps) {
  const [schema, setSchema] = React.useState<ZodSchema | null>(null);

  React.useEffect(() => {
    import('@/lib/validation/schemas').then(({ newsletterSchema }) => {
      setSchema(newsletterSchema);
    });
  }, []);

  if (!schema) {
    return <div>Loading...</div>;
  }

  return (
    <ValidatedForm
      schema={schema}
      onSubmit={onSubmit}
      className={className}
      submitButtonText="Subscribe"
      validationConfig={{
        sanitizationConfig: {
          email: { maxLength: 254 },
        },
      }}
    >
      <div className="flex gap-2">
        <FormField
          name="email"
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          required
          maxLength={254}
          className="flex-1"
        />
      </div>
      
      <FormField
        name="preferences"
        label="Email Preferences"
        type="checkbox"
        description="Select the types of emails you'd like to receive"
      />
    </ValidatedForm>
  );
}

export interface AuthFormProps {
  type: 'signin' | 'signup' | 'forgot' | 'reset';
  onSubmit: (data: unknown) => Promise<void>;
  className?: string;
}

export function AuthForm({ type, onSubmit, className }: AuthFormProps) {
  const [schema, setSchema] = React.useState<ZodSchema | null>(null);

  React.useEffect(() => {
    import('@/lib/validation/schemas').then((schemas) => {
      switch (type) {
        case 'signin':
          setSchema(schemas.signInSchema);
          break;
        case 'signup':
          setSchema(schemas.signUpSchema);
          break;
        case 'forgot':
          setSchema(schemas.forgotPasswordSchema);
          break;
        case 'reset':
          setSchema(schemas.resetPasswordSchema);
          break;
      }
    });
  }, [type]);

  if (!schema) {
    return <div>Loading...</div>;
  }

  const getSubmitText = () => {
    switch (type) {
      case 'signin':
        return 'Sign In';
      case 'signup':
        return 'Create Account';
      case 'forgot':
        return 'Send Reset Link';
      case 'reset':
        return 'Reset Password';
      default:
        return 'Submit';
    }
  };

  return (
    <ValidatedForm
      schema={schema}
      onSubmit={onSubmit}
      className={className}
      submitButtonText={getSubmitText()}
      validationConfig={{
        sanitizationConfig: {
          email: { maxLength: 254 },
          fullName: { maxLength: 50 },
          password: { maxLength: 128 },
          confirmPassword: { maxLength: 128 },
        },
        enableRealTimeValidation: false, // Only validate on submit for auth
      }}
    >
      {type === 'signup' && (
        <FormField
          name="fullName"
          label="Full Name"
          placeholder="Enter your full name"
          required
          maxLength={50}
        />
      )}
      
      {type !== 'reset' && (
        <FormField
          name="email"
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          required
          maxLength={254}
        />
      )}
      
      {(type === 'signin' || type === 'signup' || type === 'reset') && (
        <FormField
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          required
          maxLength={128}
        />
      )}
      
      {(type === 'signup' || type === 'reset') && (
        <FormField
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          required
          maxLength={128}
        />
      )}
      
      {type === 'signup' && (
        <FormField
          name="acceptTerms"
          label="I accept the Terms and Conditions"
          type="checkbox"
          required
        />
      )}
      
      {type === 'signin' && (
        <FormField
          name="rememberMe"
          label="Remember me"
          type="checkbox"
        />
      )}
    </ValidatedForm>
  );
}

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormField } from '../FormField';

// Mock sanitization service
vi.mock('@/lib/services/sanitizationService', () => ({
  sanitizationService: {
    sanitizeInput: vi.fn((value) => value?.trim()),
    sanitizeEmail: vi.fn((value) => value?.toLowerCase().trim()),
    sanitizePhone: vi.fn((value) => value?.replace(/[^\d+()-\s]/g, '')),
    sanitizeUrl: vi.fn((value) => value?.trim())
  }
}));

const TestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept terms'),
  age: z.number().min(18, 'Must be at least 18')
});

type TestFormData = z.infer<typeof TestSchema>;

function TestFormWrapper({ children, defaultValues = {} }: { 
  children: React.ReactNode;
  defaultValues?: Partial<TestFormData>;
}) {
  const form = useForm<TestFormData>({
    resolver: zodResolver(TestSchema),
    defaultValues,
    mode: 'onChange'
  });

  return (
    <FormProvider {...form}>
      <form>{children}</form>
    </FormProvider>
  );
}

describe('FormField', () => {
  describe('Text Input', () => {
    it('should render text input with label', () => {
      render(
        <TestFormWrapper>
          <FormField
            name="name"
            label="Full Name"
            placeholder="Enter your name"
            required
          />
        </TestFormWrapper>
      );

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument(); // Required indicator
    });

    it('should sanitize input on change', async () => {
      const { sanitizationService } = await import('@/lib/services/sanitizationService');
      
      render(
        <TestFormWrapper>
          <FormField
            name="name"
            label="Full Name"
            sanitize={true}
          />
        </TestFormWrapper>
      );

      const input = screen.getByLabelText(/full name/i);
      fireEvent.change(input, { target: { value: '  John Doe  ' } });

      await waitFor(() => {
        expect(sanitizationService.sanitizeInput).toHaveBeenCalledWith('  John Doe  ', undefined);
      });
    });

    it('should respect maxLength prop', () => {
      render(
        <TestFormWrapper>
          <FormField
            name="name"
            label="Full Name"
            maxLength={50}
          />
        </TestFormWrapper>
      );

      const input = screen.getByLabelText(/full name/i) as HTMLInputElement;
      expect(input.maxLength).toBe(50);
    });
  });

  describe('Email Input', () => {
    it('should render email input with correct type', () => {
      render(
        <TestFormWrapper>
          <FormField
            name="email"
            label="Email"
            type="email"
          />
        </TestFormWrapper>
      );

      const input = screen.getByLabelText(/email/i) as HTMLInputElement;
      expect(input.type).toBe('email');
    });

    it('should sanitize email input', async () => {
      const { sanitizationService } = await import('@/lib/services/sanitizationService');
      
      render(
        <TestFormWrapper>
          <FormField
            name="email"
            label="Email"
            type="email"
          />
        </TestFormWrapper>
      );

      const input = screen.getByLabelText(/email/i);
      fireEvent.change(input, { target: { value: 'TEST@EXAMPLE.COM' } });

      await waitFor(() => {
        expect(sanitizationService.sanitizeEmail).toHaveBeenCalledWith('TEST@EXAMPLE.COM');
      });
    });
  });

  describe('Textarea', () => {
    it('should render textarea with specified rows', () => {
      render(
        <TestFormWrapper>
          <FormField
            name="message"
            label="Message"
            type="textarea"
            rows={5}
          />
        </TestFormWrapper>
      );

      const textarea = screen.getByLabelText(/message/i) as HTMLTextAreaElement;
      expect(textarea.rows).toBe(5);
    });

    it('should handle textarea input', async () => {
      render(
        <TestFormWrapper>
          <FormField
            name="message"
            label="Message"
            type="textarea"
          />
        </TestFormWrapper>
      );

      const textarea = screen.getByLabelText(/message/i);
      fireEvent.change(textarea, { target: { value: 'This is a test message' } });

      await waitFor(() => {
        expect(textarea).toHaveValue('This is a test message');
      });
    });
  });

  describe('Select Input', () => {
    const selectOptions = [
      { value: 'general', label: 'General' },
      { value: 'support', label: 'Support' },
      { value: 'feedback', label: 'Feedback' }
    ];

    it('should render select with options', () => {
      render(
        <TestFormWrapper>
          <FormField
            name="category"
            label="Category"
            type="select"
            options={selectOptions}
          />
        </TestFormWrapper>
      );

      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      // Note: Select options are rendered in a portal, so we can't easily test them here
    });
  });

  describe('Checkbox Input', () => {
    it('should render checkbox with label', () => {
      render(
        <TestFormWrapper>
          <FormField
            name="acceptTerms"
            label="I accept the terms and conditions"
            type="checkbox"
          />
        </TestFormWrapper>
      );

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText(/i accept the terms/i)).toBeInTheDocument();
    });

    it('should handle checkbox changes', async () => {
      render(
        <TestFormWrapper>
          <FormField
            name="acceptTerms"
            label="Accept Terms"
            type="checkbox"
          />
        </TestFormWrapper>
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(checkbox).toBeChecked();
      });
    });
  });

  describe('Number Input', () => {
    it('should render number input', () => {
      render(
        <TestFormWrapper>
          <FormField
            name="age"
            label="Age"
            type="number"
          />
        </TestFormWrapper>
      );

      const input = screen.getByLabelText(/age/i) as HTMLInputElement;
      expect(input.type).toBe('number');
    });

    it('should handle number input changes', async () => {
      render(
        <TestFormWrapper>
          <FormField
            name="age"
            label="Age"
            type="number"
          />
        </TestFormWrapper>
      );

      const input = screen.getByLabelText(/age/i);
      fireEvent.change(input, { target: { value: '25' } });

      await waitFor(() => {
        expect(input).toHaveValue(25);
      });
    });
  });

  describe('Error Display', () => {
    it('should display validation errors', async () => {
      render(
        <TestFormWrapper defaultValues={{ name: '' }}>
          <FormField
            name="name"
            label="Full Name"
            required
          />
        </TestFormWrapper>
      );

      const input = screen.getByLabelText(/full name/i);
      
      // Trigger validation by focusing and blurring
      fireEvent.focus(input);
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it('should apply error styling when field has error', async () => {
      render(
        <TestFormWrapper defaultValues={{ email: 'invalid-email' }}>
          <FormField
            name="email"
            label="Email"
            type="email"
          />
        </TestFormWrapper>
      );

      const input = screen.getByLabelText(/email/i);
      
      // Trigger validation
      fireEvent.focus(input);
      fireEvent.blur(input);

      await waitFor(() => {
        expect(input).toHaveClass('border-red-500');
      });
    });
  });

  describe('Description', () => {
    it('should display field description', () => {
      render(
        <TestFormWrapper>
          <FormField
            name="name"
            label="Full Name"
            description="Enter your first and last name"
          />
        </TestFormWrapper>
      );

      expect(screen.getByText(/enter your first and last name/i)).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      render(
        <TestFormWrapper>
          <FormField
            name="name"
            label="Full Name"
            disabled={true}
          />
        </TestFormWrapper>
      );

      const input = screen.getByLabelText(/full name/i);
      expect(input).toBeDisabled();
    });
  });

  describe('Sanitization Control', () => {
    it('should skip sanitization when sanitize is false', async () => {
      const { sanitizationService } = await import('@/lib/services/sanitizationService');
      
      render(
        <TestFormWrapper>
          <FormField
            name="name"
            label="Full Name"
            sanitize={false}
          />
        </TestFormWrapper>
      );

      const input = screen.getByLabelText(/full name/i);
      fireEvent.change(input, { target: { value: '  John Doe  ' } });

      await waitFor(() => {
        expect(sanitizationService.sanitizeInput).not.toHaveBeenCalled();
      });
    });
  });
});

import React from 'react';
import { useFormContext, FieldPath, FieldValues, Controller } from 'react-hook-form';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils';
import { sanitizationService } from '@/lib/services/sanitizationService';

export interface FormFieldProps<T extends FieldValues = FieldValues> {
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox';
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  sanitize?: boolean;
  maxLength?: number;
  rows?: number;
}

export function FormField<T extends FieldValues = FieldValues>({
  name,
  label,
  placeholder,
  description,
  type = 'text',
  options = [],
  required = false,
  disabled = false,
  className,
  sanitize = true,
  maxLength,
  rows = 3,
}: FormFieldProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];
  const fieldId = `field-${name}`;

  const sanitizeValue = (value: string): string => {
    if (!sanitize || !value || typeof value !== 'string') {
      return value;
    }

    switch (type) {
      case 'email':
        return sanitizationService.sanitizeEmail(value);
      case 'tel':
        return sanitizationService.sanitizePhone(value);
      case 'url':
        return sanitizationService.sanitizeUrl(value);
      case 'textarea':
        return sanitizationService.sanitizeInput(value, maxLength);
      default:
        return sanitizationService.sanitizeInput(value, maxLength);
    }
  };

  const renderInput = (field: any) => {
    const commonProps = {
      ...field,
      id: fieldId,
      placeholder,
      disabled,
      className: cn(
        error && 'border-red-500 focus:border-red-500',
        className
      ),
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        const sanitizedValue = sanitizeValue(value);
        field.onChange(sanitizedValue);
      },
    };

    switch (type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={rows}
            maxLength={maxLength}
          />
        );

      case 'select':
        return (
          <Select
            value={field.value || ''}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              id={fieldId}
              className={cn(
                error && 'border-red-500 focus:border-red-500',
                className
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={fieldId}
              checked={field.value || false}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className={cn(
                error && 'border-red-500',
                className
              )}
            />
            {label && (
              <Label
                htmlFor={fieldId}
                className={cn(
                  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                  error && 'text-red-500'
                )}
              >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            )}
          </div>
        );

      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            onChange={(e) => {
              const value = e.target.value;
              const numValue = value === '' ? '' : parseFloat(value);
              field.onChange(numValue);
            }}
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            type={type}
            maxLength={maxLength}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {label && type !== 'checkbox' && (
        <Label
          htmlFor={fieldId}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            error && 'text-red-500'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => renderInput(field)}
      />

      {description && (
        <p className="text-sm text-gray-600">
          {description}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500 font-medium">
          {error.message as string}
        </p>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { useSecureInput, useSecureFileUpload } from '../../lib/hooks/useSecureInput';
import { useAuthRateLimit } from '../../lib/hooks/useRateLimit';
import RateLimitNotification from './RateLimitNotification';
import { fileSecurityPolicies } from '../../lib/services/fileUploadSecurity';

/**
 * Example component demonstrating secure input handling
 * This shows how to use the new security features in forms
 */
export const SecureFormExample: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Secure input validation for name field
  const nameInput = useSecureInput(formData.name, {
    maxLength: 100,
    minLength: 2,
    requireAlphanumeric: true,
    allowSpecialChars: [' ', '-', "'"],
    enableRealTimeValidation: true,
    sanitizationLevel: 'strict'
  });

  // Secure input validation for email field
  const emailInput = useSecureInput(formData.email, {
    maxLength: 254,
    allowedPatterns: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/],
    enableRealTimeValidation: true,
    sanitizationLevel: 'strict'
  });

  // Secure input validation for message field
  const messageInput = useSecureInput(formData.message, {
    maxLength: 1000,
    minLength: 10,
    enableRealTimeValidation: true,
    sanitizationLevel: 'html',
    customValidator: (input: string) => {
      if (input.toLowerCase().includes('spam')) {
        return { isValid: false, error: 'Message appears to be spam' };
      }
      return true;
    }
  });

  // Secure file upload for attachments
  const fileUpload = useSecureFileUpload({
    securityPolicy: 'documents',
    enableRealTimeValidation: true,
    onSecurityThreat: (threat) => {
      console.warn('Security threat detected:', threat);
    }
  });

  // Rate limiting for form submissions
  const rateLimitHook = useAuthRateLimit('signUp');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all inputs
    nameInput.validate();
    emailInput.validate();
    messageInput.validate();

    // Check if all inputs are valid
    if (!nameInput.isValid || !emailInput.isValid || !messageInput.isValid) {
      return;
    }

    // Check rate limiting
    if (rateLimitHook.isRateLimited) {
      return;
    }

    try {
      await rateLimitHook.executeWithRateLimit(async () => {
        // Simulate form submission with sanitized data
        const sanitizedData = {
          name: nameInput.sanitizedValue,
          email: emailInput.sanitizedValue,
          message: messageInput.sanitizedValue,
          files: fileUpload.files
        };

        console.log('Submitting sanitized data:', sanitizedData);
        
        // Here you would make your API call with the sanitized data
        // The data is already validated and sanitized for security
        
        alert('Form submitted successfully with secure data!');
      });
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      fileUpload.uploadFiles(e.target.files);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Secure Form Example</h2>
        <p className="text-muted-foreground mb-6">
          This form demonstrates the new security features including input sanitization, 
          validation, rate limiting, and secure file uploads.
        </p>
      </div>

      {/* Rate Limit Notification */}
      <RateLimitNotification
        isRateLimited={rateLimitHook.isRateLimited}
        retryAfter={rateLimitHook.retryAfter}
        resetTime={rateLimitHook.resetTime}
        remaining={rateLimitHook.remaining}
        maxRequests={5}
        action="form submission"
        onRetry={() => rateLimitHook.resetRateLimit()}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            type="text"
            value={nameInput.value}
            onChange={(e) => {
              nameInput.setValue(e.target.value);
              setFormData(prev => ({ ...prev, name: e.target.value }));
            }}
            className={!nameInput.isValid ? 'border-red-500' : ''}
            placeholder="Enter your full name"
          />
          {nameInput.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                {nameInput.errors.join(', ')}
              </AlertDescription>
            </Alert>
          )}
          {nameInput.isValidating && (
            <p className="text-sm text-muted-foreground">Validating...</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={emailInput.value}
            onChange={(e) => {
              emailInput.setValue(e.target.value);
              setFormData(prev => ({ ...prev, email: e.target.value }));
            }}
            className={!emailInput.isValid ? 'border-red-500' : ''}
            placeholder="Enter your email address"
          />
          {emailInput.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                {emailInput.errors.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Message Field */}
        <div className="space-y-2">
          <Label htmlFor="message">Message *</Label>
          <Textarea
            id="message"
            value={messageInput.value}
            onChange={(e) => {
              messageInput.setValue(e.target.value);
              setFormData(prev => ({ ...prev, message: e.target.value }));
            }}
            className={!messageInput.isValid ? 'border-red-500' : ''}
            placeholder="Enter your message (HTML will be sanitized)"
            rows={4}
          />
          {messageInput.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                {messageInput.errors.join(', ')}
              </AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground">
            Sanitized preview: {messageInput.sanitizedValue}
          </p>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="files">Attachments (Optional)</Label>
          <Input
            id="files"
            type="file"
            multiple
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.txt,.csv"
          />
          {fileUpload.isValidating && (
            <p className="text-sm text-muted-foreground">Validating files...</p>
          )}
          {fileUpload.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                File validation errors: {fileUpload.errors.join(', ')}
              </AlertDescription>
            </Alert>
          )}
          {fileUpload.warnings.length > 0 && (
            <Alert>
              <AlertDescription>
                File warnings: {fileUpload.warnings.join(', ')}
              </AlertDescription>
            </Alert>
          )}
          {fileUpload.files.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Uploaded files:</p>
              {fileUpload.files.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileUpload.removeFile(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={
            !nameInput.isValid || 
            !emailInput.isValid || 
            !messageInput.isValid || 
            nameInput.isValidating || 
            emailInput.isValidating || 
            messageInput.isValidating ||
            fileUpload.isValidating ||
            rateLimitHook.isRateLimited
          }
          className="w-full"
        >
          {nameInput.isValidating || emailInput.isValidating || messageInput.isValidating || fileUpload.isValidating
            ? 'Validating...'
            : rateLimitHook.isRateLimited
            ? `Rate limited (${rateLimitHook.retryAfter}s)`
            : 'Submit Secure Form'
          }
        </Button>
      </form>

      {/* Security Information */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Security Features Demonstrated:</h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Real-time input validation and sanitization</li>
          <li>• Rate limiting for form submissions</li>
          <li>• Secure file upload with malware scanning</li>
          <li>• XSS prevention through HTML sanitization</li>
          <li>• SQL injection prevention</li>
          <li>• Custom validation rules</li>
          <li>• CSRF protection (automatically applied)</li>
          <li>• Session management and validation</li>
        </ul>
      </div>
    </div>
  );
};

export default SecureFormExample;

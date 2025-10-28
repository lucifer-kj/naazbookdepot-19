import React from 'react';
import { ContactForm, NewsletterForm, AuthForm } from './ValidatedForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function ExampleValidatedForms() {
  const handleContactSubmit = async (data: any) => {
    console.log('Contact form submitted:', data);
    toast.success('Message sent successfully!');
  };

  const handleNewsletterSubmit = async (data: any) => {
    console.log('Newsletter subscription:', data);
    toast.success('Successfully subscribed to newsletter!');
  };

  const handleAuthSubmit = async (data: any) => {
    console.log('Auth form submitted:', data);
    toast.success('Authentication successful!');
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Form Validation Examples</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Form Example */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Form</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm 
              onSubmit={handleContactSubmit}
              className="space-y-4"
            />
          </CardContent>
        </Card>

        {/* Newsletter Form Example */}
        <Card>
          <CardHeader>
            <CardTitle>Newsletter Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <NewsletterForm 
              onSubmit={handleNewsletterSubmit}
              className="space-y-4"
            />
          </CardContent>
        </Card>

        {/* Sign Up Form Example */}
        <Card>
          <CardHeader>
            <CardTitle>Sign Up Form</CardTitle>
          </CardHeader>
          <CardContent>
            <AuthForm 
              type="signup"
              onSubmit={handleAuthSubmit}
              className="space-y-4"
            />
          </CardContent>
        </Card>

        {/* Sign In Form Example */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In Form</CardTitle>
          </CardHeader>
          <CardContent>
            <AuthForm 
              type="signin"
              onSubmit={handleAuthSubmit}
              className="space-y-4"
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Features Demonstrated:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Client-side validation using Zod schemas</li>
          <li>Real-time input sanitization with DOMPurify</li>
          <li>Comprehensive error handling and display</li>
          <li>Form field validation with custom error messages</li>
          <li>Input sanitization for security</li>
          <li>Reusable form components</li>
          <li>Loading states and submission handling</li>
          <li>Responsive form layouts</li>
        </ul>
      </div>
    </div>
  );
}
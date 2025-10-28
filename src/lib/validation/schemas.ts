import { z } from 'zod';

// Common validation patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
const indianPhoneRegex = /^(\+91[-\s]?)?[0]?(91)?[6789]\d{9}$/;
const pincodeRegex = /^[1-9][0-9]{5}$/;

// Custom validation messages
const messages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  strongPassword: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character',
  minLength: (min: number) => `Must be at least ${min} characters long`,
  maxLength: (max: number) => `Must be no more than ${max} characters long`,
  min: (min: number) => `Must be at least ${min}`,
  max: (max: number) => `Must be no more than ${max}`,
  positive: 'Must be a positive number',
  url: 'Please enter a valid URL',
  pincode: 'Please enter a valid 6-digit pincode',
  indianPhone: 'Please enter a valid Indian phone number'
};

// Base schemas
export const emailSchema = z
  .string()
  .min(1, messages.required)
  .regex(emailRegex, messages.email);

export const passwordSchema = z
  .string()
  .min(8, messages.minLength(8))
  .regex(strongPasswordRegex, messages.strongPassword);

export const phoneSchema = z
  .string()
  .min(1, messages.required)
  .regex(phoneRegex, messages.phone);

export const indianPhoneSchema = z
  .string()
  .min(1, messages.required)
  .regex(indianPhoneRegex, messages.indianPhone);

export const pincodeSchema = z
  .string()
  .min(1, messages.required)
  .regex(pincodeRegex, messages.pincode);

export const urlSchema = z
  .string()
  .url(messages.url)
  .optional()
  .or(z.literal(''));

export const nameSchema = z
  .string()
  .min(1, messages.required)
  .min(2, messages.minLength(2))
  .max(50, messages.maxLength(50))
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

export const priceSchema = z
  .number()
  .min(0.01, messages.positive)
  .max(999999.99, messages.max(999999.99));

export const quantitySchema = z
  .number()
  .int('Must be a whole number')
  .min(0, messages.min(0))
  .max(9999, messages.max(9999));

// User authentication schemas
export const signUpSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, messages.required),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, messages.required),
  rememberMe: z.boolean().optional()
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, messages.required)
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// Profile schemas
export const profileUpdateSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: indianPhoneSchema.optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  bio: z.string().max(500, messages.maxLength(500)).optional().or(z.literal(''))
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, messages.required),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, messages.required)
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword']
});

// Address schemas
export const addressSchema = z.object({
  fullName: nameSchema,
  phone: indianPhoneSchema,
  addressLine1: z.string().min(1, messages.required).max(100, messages.maxLength(100)),
  addressLine2: z.string().max(100, messages.maxLength(100)).optional().or(z.literal('')),
  city: z.string().min(1, messages.required).max(50, messages.maxLength(50)),
  state: z.string().min(1, messages.required).max(50, messages.maxLength(50)),
  pincode: pincodeSchema,
  country: z.string().min(1, messages.required).default('India'),
  isDefault: z.boolean().optional().default(false),
  addressType: z.enum(['home', 'work', 'other']).default('home')
});

// Product schemas
export const productSchema = z.object({
  title: z.string().min(1, messages.required).max(200, messages.maxLength(200)),
  description: z.string().min(1, messages.required).max(2000, messages.maxLength(2000)),
  price: priceSchema,
  compareAtPrice: z.number().min(0).optional().or(z.literal('')),
  category: z.string().min(1, messages.required),
  subcategory: z.string().optional().or(z.literal('')),
  author: z.string().min(1, messages.required).max(100, messages.maxLength(100)),
  publisher: z.string().max(100, messages.maxLength(100)).optional().or(z.literal('')),
  isbn: z.string().max(20, messages.maxLength(20)).optional().or(z.literal('')),
  language: z.string().min(1, messages.required),
  pages: z.number().int().min(1).max(9999).optional(),
  weight: z.number().min(0).max(10).optional(),
  dimensions: z.string().max(50, messages.maxLength(50)).optional().or(z.literal('')),
  tags: z.array(z.string()).optional().default([]),
  inStock: z.boolean().default(true),
  stockQuantity: quantitySchema,
  lowStockThreshold: z.number().int().min(0).max(100).default(5),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'published', 'archived']).default('draft')
}).refine(data => {
  if (data.compareAtPrice && data.compareAtPrice <= data.price) {
    return false;
  }
  return true;
}, {
  message: 'Compare at price must be higher than the regular price',
  path: ['compareAtPrice']
});

// Order schemas
export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  useSameAddress: z.boolean().default(true),
  paymentMethod: z.enum(['paypal', 'payu', 'cod']),
  notes: z.string().max(500, messages.maxLength(500)).optional().or(z.literal(''))
});

// Contact form schema
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: indianPhoneSchema.optional().or(z.literal('')),
  subject: z.string().min(1, messages.required).max(100, messages.maxLength(100)),
  message: z.string().min(1, messages.required).max(1000, messages.maxLength(1000)),
  category: z.enum(['general', 'support', 'order', 'feedback', 'complaint']).default('general')
});

// Review schema
export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Please select a rating').max(5, 'Rating cannot exceed 5 stars'),
  title: z.string().min(1, messages.required).max(100, messages.maxLength(100)),
  comment: z.string().min(1, messages.required).max(1000, messages.maxLength(1000)),
  wouldRecommend: z.boolean().optional().default(false)
});

// Newsletter subscription schema
export const newsletterSchema = z.object({
  email: emailSchema,
  preferences: z.array(z.enum(['new_arrivals', 'promotions', 'author_news', 'events'])).optional().default([])
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Please enter a search term').max(100, messages.maxLength(100)),
  category: z.string().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  author: z.string().optional(),
  language: z.string().optional(),
  inStock: z.boolean().optional(),
  sortBy: z.enum(['relevance', 'price_low', 'price_high', 'newest', 'rating']).default('relevance')
}).refine(data => {
  if (data.priceMin && data.priceMax && data.priceMin > data.priceMax) {
    return false;
  }
  return true;
}, {
  message: 'Minimum price cannot be greater than maximum price',
  path: ['priceMin']
});

// Admin schemas
export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, messages.required)
});

export const promoCodeSchema = z.object({
  code: z.string().min(1, messages.required).max(20, messages.maxLength(20)).regex(/^[A-Z0-9]+$/, 'Code can only contain uppercase letters and numbers'),
  description: z.string().min(1, messages.required).max(200, messages.maxLength(200)),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().min(0.01, messages.positive),
  minimumOrderValue: z.number().min(0).optional(),
  maxUsage: z.number().int().min(1).optional(),
  validFrom: z.string().min(1, messages.required),
  validUntil: z.string().min(1, messages.required),
  isActive: z.boolean().default(true)
}).refine(data => {
  if (data.discountType === 'percentage' && data.discountValue > 100) {
    return false;
  }
  return true;
}, {
  message: 'Percentage discount cannot exceed 100%',
  path: ['discountValue']
}).refine(data => {
  const from = new Date(data.validFrom);
  const until = new Date(data.validUntil);
  return from < until;
}, {
  message: 'Valid until date must be after valid from date',
  path: ['validUntil']
});

// Export type definitions
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type AdminLoginFormData = z.infer<typeof adminLoginSchema>;
export type PromoCodeFormData = z.infer<typeof promoCodeSchema>;
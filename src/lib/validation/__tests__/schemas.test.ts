import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  phoneSchema,
  indianPhoneSchema,
  pincodeSchema,
  signUpSchema,
  signInSchema,
  profileUpdateSchema,
  addressSchema,
  productSchema,
  checkoutSchema,
  contactFormSchema,
  reviewSchema,
  searchSchema
} from '../schemas';

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      validEmails.forEach(email => {
        expect(emailSchema.safeParse(email).success).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        '',
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com'
      ];

      invalidEmails.forEach(email => {
        expect(emailSchema.safeParse(email).success).toBe(false);
      });
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong passwords', () => {
      const validPasswords = [
        'Password123!',
        'MyStr0ng@Pass',
        'C0mplex#Password'
      ];

      validPasswords.forEach(password => {
        expect(passwordSchema.safeParse(password).success).toBe(true);
      });
    });

    it('should reject weak passwords', () => {
      const invalidPasswords = [
        '',
        'short',
        'password', // no uppercase, number, special char
        'PASSWORD123', // no lowercase
        'Password', // no number, special char
        'Password123' // no special char
      ];

      invalidPasswords.forEach(password => {
        expect(passwordSchema.safeParse(password).success).toBe(false);
      });
    });
  });

  describe('indianPhoneSchema', () => {
    it('should validate Indian phone numbers', () => {
      const validPhones = [
        '9876543210',
        '+919876543210',
        '+91 9876543210',
        '919876543210'
      ];

      validPhones.forEach(phone => {
        expect(indianPhoneSchema.safeParse(phone).success).toBe(true);
      });
    });

    it('should reject invalid Indian phone numbers', () => {
      const invalidPhones = [
        '',
        '123456789', // too short
        '1234567890', // doesn't start with 6,7,8,9
        '+1234567890', // wrong country code
        'abcd567890'
      ];

      invalidPhones.forEach(phone => {
        expect(indianPhoneSchema.safeParse(phone).success).toBe(false);
      });
    });
  });

  describe('pincodeSchema', () => {
    it('should validate Indian pincodes', () => {
      const validPincodes = [
        '110001',
        '400001',
        '560001'
      ];

      validPincodes.forEach(pincode => {
        expect(pincodeSchema.safeParse(pincode).success).toBe(true);
      });
    });

    it('should reject invalid pincodes', () => {
      const invalidPincodes = [
        '',
        '12345', // too short
        '1234567', // too long
        '012345', // starts with 0
        'abcdef'
      ];

      invalidPincodes.forEach(pincode => {
        expect(pincodeSchema.safeParse(pincode).success).toBe(false);
      });
    });
  });

  describe('signUpSchema', () => {
    const validSignUpData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      acceptTerms: true
    };

    it('should validate correct sign up data', () => {
      expect(signUpSchema.safeParse(validSignUpData).success).toBe(true);
    });

    it('should reject when passwords do not match', () => {
      const invalidData = {
        ...validSignUpData,
        confirmPassword: 'DifferentPassword123!'
      };
      expect(signUpSchema.safeParse(invalidData).success).toBe(false);
    });

    it('should reject when terms are not accepted', () => {
      const invalidData = {
        ...validSignUpData,
        acceptTerms: false
      };
      expect(signUpSchema.safeParse(invalidData).success).toBe(false);
    });

    it('should reject invalid names', () => {
      const invalidData = {
        ...validSignUpData,
        fullName: 'J' // too short
      };
      expect(signUpSchema.safeParse(invalidData).success).toBe(false);
    });
  });

  describe('addressSchema', () => {
    const validAddress = {
      fullName: 'John Doe',
      phone: '9876543210',
      addressLine1: '123 Main Street',
      addressLine2: 'Apt 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      isDefault: true,
      addressType: 'home' as const
    };

    it('should validate correct address data', () => {
      expect(addressSchema.safeParse(validAddress).success).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      const invalidData = {
        ...validAddress,
        phone: '123456789' // invalid Indian phone
      };
      expect(addressSchema.safeParse(invalidData).success).toBe(false);
    });

    it('should reject invalid pincodes', () => {
      const invalidData = {
        ...validAddress,
        pincode: '12345' // invalid pincode
      };
      expect(addressSchema.safeParse(invalidData).success).toBe(false);
    });

    it('should allow optional fields to be empty', () => {
      const dataWithOptionals = {
        ...validAddress,
        addressLine2: ''
      };
      expect(addressSchema.safeParse(dataWithOptionals).success).toBe(true);
    });
  });

  describe('productSchema', () => {
    const validProduct = {
      title: 'Test Book',
      description: 'A great book for testing',
      price: 29.99,
      compareAtPrice: 39.99,
      category: 'fiction',
      author: 'Test Author',
      language: 'English',
      stockQuantity: 10,
      status: 'published' as const
    };

    it('should validate correct product data', () => {
      expect(productSchema.safeParse(validProduct).success).toBe(true);
    });

    it('should reject when compare price is not higher than regular price', () => {
      const invalidData = {
        ...validProduct,
        compareAtPrice: 25.99 // lower than price
      };
      expect(productSchema.safeParse(invalidData).success).toBe(false);
    });

    it('should reject negative prices', () => {
      const invalidData = {
        ...validProduct,
        price: -10
      };
      expect(productSchema.safeParse(invalidData).success).toBe(false);
    });

    it('should reject empty required fields', () => {
      const invalidData = {
        ...validProduct,
        title: ''
      };
      expect(productSchema.safeParse(invalidData).success).toBe(false);
    });
  });

  describe('reviewSchema', () => {
    const validReview = {
      rating: 5,
      title: 'Great book!',
      comment: 'I really enjoyed reading this book. Highly recommended.',
      wouldRecommend: true
    };

    it('should validate correct review data', () => {
      expect(reviewSchema.safeParse(validReview).success).toBe(true);
    });

    it('should reject invalid ratings', () => {
      const invalidRatings = [0, 6, -1];
      
      invalidRatings.forEach(rating => {
        const invalidData = { ...validReview, rating };
        expect(reviewSchema.safeParse(invalidData).success).toBe(false);
      });
    });

    it('should reject empty required fields', () => {
      const invalidData = {
        ...validReview,
        title: ''
      };
      expect(reviewSchema.safeParse(invalidData).success).toBe(false);
    });
  });

  describe('searchSchema', () => {
    const validSearch = {
      query: 'fiction books',
      category: 'fiction',
      priceMin: 10,
      priceMax: 50,
      sortBy: 'relevance' as const
    };

    it('should validate correct search data', () => {
      expect(searchSchema.safeParse(validSearch).success).toBe(true);
    });

    it('should reject when min price is greater than max price', () => {
      const invalidData = {
        ...validSearch,
        priceMin: 60,
        priceMax: 50
      };
      expect(searchSchema.safeParse(invalidData).success).toBe(false);
    });

    it('should reject empty search query', () => {
      const invalidData = {
        ...validSearch,
        query: ''
      };
      expect(searchSchema.safeParse(invalidData).success).toBe(false);
    });

    it('should reject overly long search queries', () => {
      const invalidData = {
        ...validSearch,
        query: 'a'.repeat(150)
      };
      expect(searchSchema.safeParse(invalidData).success).toBe(false);
    });
  });

  describe('contactFormSchema', () => {
    const validContact = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      subject: 'Question about order',
      message: 'I have a question about my recent order.',
      category: 'order' as const
    };

    it('should validate correct contact form data', () => {
      expect(contactFormSchema.safeParse(validContact).success).toBe(true);
    });

    it('should allow optional phone field', () => {
      const dataWithoutPhone = {
        ...validContact,
        phone: ''
      };
      expect(contactFormSchema.safeParse(dataWithoutPhone).success).toBe(true);
    });

    it('should reject overly long messages', () => {
      const invalidData = {
        ...validContact,
        message: 'a'.repeat(1500)
      };
      expect(contactFormSchema.safeParse(invalidData).success).toBe(false);
    });
  });
});

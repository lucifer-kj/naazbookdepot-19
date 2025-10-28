import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should allow user to sign up', async ({ page }) => {
    // Navigate to sign up page
    await page.click('text=Sign Up');
    await expect(page).toHaveURL('/signup');

    // Fill out sign up form
    await page.fill('[data-testid="fullName"]', 'Test User');
    await page.fill('[data-testid="email"]', `test${Date.now()}@example.com`);
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="confirmPassword"]', 'Password123!');
    await page.check('[data-testid="acceptTerms"]');

    // Submit form
    await page.click('[data-testid="signup-submit"]');

    // Should show success message or redirect to verification page
    await expect(page.locator('text=Check your email')).toBeVisible({ timeout: 10000 });
  });

  test('should allow user to sign in', async ({ page }) => {
    // Navigate to sign in page
    await page.click('text=Sign In');
    await expect(page).toHaveURL('/signin');

    // Fill out sign in form with test credentials
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');

    // Submit form
    await page.click('[data-testid="signin-submit"]');

    // Should redirect to dashboard or show user menu
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible({ timeout: 10000 });
  });

  test('should handle invalid credentials', async ({ page }) => {
    await page.click('text=Sign In');
    
    await page.fill('[data-testid="email"]', 'invalid@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    
    await page.click('[data-testid="signin-submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should allow password reset', async ({ page }) => {
    await page.click('text=Sign In');
    await page.click('text=Forgot Password');
    
    await expect(page).toHaveURL('/forgot-password');
    
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.click('[data-testid="reset-submit"]');

    await expect(page.locator('text=Password reset email sent')).toBeVisible();
  });

  test('should allow user to sign out', async ({ page }) => {
    // First sign in
    await page.click('text=Sign In');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.click('[data-testid="signin-submit"]');

    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Then sign out
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Sign Out');

    // Should redirect to home page and show sign in option
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    await page.click('text=Sign Up');

    // Try to submit empty form
    await page.click('[data-testid="signup-submit"]');

    // Should show validation errors
    await expect(page.locator('text=Full name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();

    // Test invalid email
    await page.fill('[data-testid="email"]', 'invalid-email');
    await page.blur('[data-testid="email"]');
    await expect(page.locator('text=Invalid email address')).toBeVisible();

    // Test weak password
    await page.fill('[data-testid="password"]', 'weak');
    await page.blur('[data-testid="password"]');
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();

    // Test password mismatch
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.fill('[data-testid="confirmPassword"]', 'DifferentPassword123!');
    await page.blur('[data-testid="confirmPassword"]');
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    // Sign in
    await page.click('text=Sign In');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.click('[data-testid="signin-submit"]');

    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Reload page
    await page.reload();

    // Should still be authenticated
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});
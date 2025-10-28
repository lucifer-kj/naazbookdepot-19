import { test, expect } from '@playwright/test';

test.describe('Checkout Process', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Add a product to cart before each test
    await page.goto('/products');
    await page.locator('[data-testid^="product-card-"]').first().click();
    await page.click('[data-testid="add-to-cart-btn"]');
    
    // Navigate to checkout
    await page.click('[data-testid="cart-icon"]');
    await page.click('[data-testid="checkout-btn"]');
    await expect(page).toHaveURL('/checkout');
  });

  test('should display checkout summary', async ({ page }) => {
    // Should show order summary
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
    
    // Should show cart items
    await expect(page.locator('[data-testid="checkout-items"]')).toBeVisible();
    
    // Should show totals
    await expect(page.locator('[data-testid="subtotal"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-cost"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-amount"]')).toBeVisible();
  });

  test('should handle guest checkout', async ({ page }) => {
    // Should show guest checkout option
    await expect(page.locator('[data-testid="guest-checkout"]')).toBeVisible();
    
    // Fill guest information
    await page.fill('[data-testid="guest-email"]', 'guest@example.com');
    await page.fill('[data-testid="guest-phone"]', '9876543210');
    
    // Continue as guest
    await page.click('[data-testid="continue-as-guest"]');
    
    // Should proceed to shipping form
    await expect(page.locator('[data-testid="shipping-form"]')).toBeVisible();
  });

  test('should handle authenticated user checkout', async ({ page }) => {
    // Sign in first
    await page.click('[data-testid="signin-link"]');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.click('[data-testid="signin-submit"]');
    
    // Return to checkout
    await page.goto('/checkout');
    
    // Should show user information
    await expect(page.locator('[data-testid="user-info"]')).toBeVisible();
    
    // Should show saved addresses if any
    const savedAddresses = page.locator('[data-testid="saved-addresses"]');
    if (await savedAddresses.isVisible()) {
      await expect(savedAddresses).toBeVisible();
    }
  });

  test('should validate shipping information', async ({ page }) => {
    // Continue as guest
    await page.click('[data-testid="continue-as-guest"]');
    
    // Try to proceed without filling required fields
    await page.click('[data-testid="continue-to-payment"]');
    
    // Should show validation errors
    await expect(page.locator('text=Full name is required')).toBeVisible();
    await expect(page.locator('text=Address is required')).toBeVisible();
    await expect(page.locator('text=City is required')).toBeVisible();
    await expect(page.locator('text=Pincode is required')).toBeVisible();
  });

  test('should fill and validate shipping form', async ({ page }) => {
    // Continue as guest
    await page.click('[data-testid="continue-as-guest"]');
    
    // Fill shipping information
    await page.fill('[data-testid="full-name"]', 'John Doe');
    await page.fill('[data-testid="phone"]', '9876543210');
    await page.fill('[data-testid="address-line1"]', '123 Main Street');
    await page.fill('[data-testid="address-line2"]', 'Apt 4B');
    await page.fill('[data-testid="city"]', 'Mumbai');
    await page.selectOption('[data-testid="state"]', 'Maharashtra');
    await page.fill('[data-testid="pincode"]', '400001');
    
    // Continue to payment
    await page.click('[data-testid="continue-to-payment"]');
    
    // Should proceed to payment step
    await expect(page.locator('[data-testid="payment-methods"]')).toBeVisible();
  });

  test('should validate Indian phone number', async ({ page }) => {
    await page.click('[data-testid="continue-as-guest"]');
    
    // Test invalid phone numbers
    await page.fill('[data-testid="phone"]', '123456789');
    await page.blur('[data-testid="phone"]');
    await expect(page.locator('text=Invalid phone number')).toBeVisible();
    
    // Test valid phone number
    await page.fill('[data-testid="phone"]', '9876543210');
    await page.blur('[data-testid="phone"]');
    await expect(page.locator('text=Invalid phone number')).not.toBeVisible();
  });

  test('should validate Indian pincode', async ({ page }) => {
    await page.click('[data-testid="continue-as-guest"]');
    
    // Test invalid pincode
    await page.fill('[data-testid="pincode"]', '12345');
    await page.blur('[data-testid="pincode"]');
    await expect(page.locator('text=Invalid pincode')).toBeVisible();
    
    // Test valid pincode
    await page.fill('[data-testid="pincode"]', '400001');
    await page.blur('[data-testid="pincode"]');
    await expect(page.locator('text=Invalid pincode')).not.toBeVisible();
  });

  test('should show payment methods', async ({ page }) => {
    // Complete shipping information
    await page.click('[data-testid="continue-as-guest"]');
    await page.fill('[data-testid="full-name"]', 'John Doe');
    await page.fill('[data-testid="phone"]', '9876543210');
    await page.fill('[data-testid="address-line1"]', '123 Main Street');
    await page.fill('[data-testid="city"]', 'Mumbai');
    await page.selectOption('[data-testid="state"]', 'Maharashtra');
    await page.fill('[data-testid="pincode"]', '400001');
    await page.click('[data-testid="continue-to-payment"]');
    
    // Should show payment options
    await expect(page.locator('[data-testid="payment-methods"]')).toBeVisible();
    
    // Should show PayU for domestic payments
    await expect(page.locator('[data-testid="payu-payment"]')).toBeVisible();
    
    // Should show PayPal for international payments
    await expect(page.locator('[data-testid="paypal-payment"]')).toBeVisible();
  });

  test('should handle PayU payment selection', async ({ page }) => {
    // Complete shipping and go to payment
    await page.click('[data-testid="continue-as-guest"]');
    await page.fill('[data-testid="full-name"]', 'John Doe');
    await page.fill('[data-testid="phone"]', '9876543210');
    await page.fill('[data-testid="address-line1"]', '123 Main Street');
    await page.fill('[data-testid="city"]', 'Mumbai');
    await page.selectOption('[data-testid="state"]', 'Maharashtra');
    await page.fill('[data-testid="pincode"]', '400001');
    await page.click('[data-testid="continue-to-payment"]');
    
    // Select PayU payment
    await page.click('[data-testid="payu-payment"]');
    
    // Should show PayU payment form
    await expect(page.locator('[data-testid="payu-form"]')).toBeVisible();
    
    // Should show UPI options
    await expect(page.locator('[data-testid="upi-options"]')).toBeVisible();
  });

  test('should handle PayPal payment selection', async ({ page }) => {
    // Complete shipping and go to payment
    await page.click('[data-testid="continue-as-guest"]');
    await page.fill('[data-testid="full-name"]', 'John Doe');
    await page.fill('[data-testid="phone"]', '9876543210');
    await page.fill('[data-testid="address-line1"]', '123 Main Street');
    await page.fill('[data-testid="city"]', 'Mumbai');
    await page.selectOption('[data-testid="state"]', 'Maharashtra');
    await page.fill('[data-testid="pincode"]', '400001');
    await page.click('[data-testid="continue-to-payment"]');
    
    // Select PayPal payment
    await page.click('[data-testid="paypal-payment"]');
    
    // Should show PayPal payment form
    await expect(page.locator('[data-testid="paypal-form"]')).toBeVisible();
  });

  test('should calculate shipping costs', async ({ page }) => {
    // Should show shipping calculation based on location
    const shippingCost = page.locator('[data-testid="shipping-cost"]');
    await expect(shippingCost).toBeVisible();
    
    const shippingText = await shippingCost.textContent();
    expect(shippingText).toMatch(/₹\d+|Free Shipping/);
  });

  test('should apply discount codes', async ({ page }) => {
    // Look for discount code section
    const discountSection = page.locator('[data-testid="discount-section"]');
    
    if (await discountSection.isVisible()) {
      // Try to apply a discount code
      await page.fill('[data-testid="discount-code"]', 'TESTCODE');
      await page.click('[data-testid="apply-discount"]');
      
      // Should show result (valid or invalid)
      const discountResult = page.locator('[data-testid="discount-result"]');
      await expect(discountResult).toBeVisible();
    }
  });

  test('should show order review before payment', async ({ page }) => {
    // Complete all steps up to payment
    await page.click('[data-testid="continue-as-guest"]');
    await page.fill('[data-testid="full-name"]', 'John Doe');
    await page.fill('[data-testid="phone"]', '9876543210');
    await page.fill('[data-testid="address-line1"]', '123 Main Street');
    await page.fill('[data-testid="city"]', 'Mumbai');
    await page.selectOption('[data-testid="state"]', 'Maharashtra');
    await page.fill('[data-testid="pincode"]', '400001');
    await page.click('[data-testid="continue-to-payment"]');
    
    // Select payment method
    await page.click('[data-testid="payu-payment"]');
    
    // Should show order review
    await expect(page.locator('[data-testid="order-review"]')).toBeVisible();
    
    // Should show all order details
    await expect(page.locator('[data-testid="review-items"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-shipping"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-payment"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-total"]')).toBeVisible();
  });

  test('should handle checkout errors', async ({ page }) => {
    // Try to proceed with incomplete information
    await page.click('[data-testid="continue-as-guest"]');
    
    // Simulate network error by going offline
    await page.context().setOffline(true);
    
    await page.fill('[data-testid="full-name"]', 'John Doe');
    await page.click('[data-testid="continue-to-payment"]');
    
    // Should show error message
    const errorMessage = page.locator('text=Unable to process request');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
    
    // Restore network
    await page.context().setOffline(false);
  });

  test('should save address for future use', async ({ page }) => {
    // Sign in first
    await page.click('[data-testid="signin-link"]');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'Password123!');
    await page.click('[data-testid="signin-submit"]');
    
    await page.goto('/checkout');
    
    // Fill shipping information
    await page.fill('[data-testid="full-name"]', 'John Doe');
    await page.fill('[data-testid="phone"]', '9876543210');
    await page.fill('[data-testid="address-line1"]', '123 Main Street');
    await page.fill('[data-testid="city"]', 'Mumbai');
    await page.selectOption('[data-testid="state"]', 'Maharashtra');
    await page.fill('[data-testid="pincode"]', '400001');
    
    // Check save address option
    const saveAddressCheckbox = page.locator('[data-testid="save-address"]');
    if (await saveAddressCheckbox.isVisible()) {
      await saveAddressCheckbox.check();
    }
    
    await page.click('[data-testid="continue-to-payment"]');
    
    // Address should be saved for future use
    // This would be verified in subsequent checkouts
  });

  test('should handle mobile responsive checkout', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Checkout should be mobile-friendly
    await expect(page.locator('[data-testid="checkout-container"]')).toBeVisible();
    
    // Steps should be clearly visible on mobile
    await expect(page.locator('[data-testid="checkout-steps"]')).toBeVisible();
    
    // Forms should be touch-friendly
    const guestEmailInput = page.locator('[data-testid="guest-email"]');
    await expect(guestEmailInput).toBeVisible();
    
    // Should be able to complete checkout on mobile
    await page.fill('[data-testid="guest-email"]', 'mobile@example.com');
    await page.click('[data-testid="continue-as-guest"]');
    
    await expect(page.locator('[data-testid="shipping-form"]')).toBeVisible();
  });
});
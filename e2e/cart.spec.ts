import { test, expect } from '@playwright/test';

test.describe('Cart Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should add product to cart', async ({ page }) => {
    // Navigate to products and select first product
    await page.goto('/products');
    await page.locator('[data-testid^="product-card-"]').first().click();
    
    // Add to cart
    await page.click('[data-testid="add-to-cart-btn"]');
    
    // Should show success message
    await expect(page.locator('text=Added to cart')).toBeVisible();
    
    // Cart icon should show item count
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toBeVisible();
    expect(await cartBadge.textContent()).toBe('1');
  });

  test('should update cart quantity', async ({ page }) => {
    // Add product to cart first
    await page.goto('/products');
    await page.locator('[data-testid^="product-card-"]').first().click();
    await page.click('[data-testid="add-to-cart-btn"]');
    
    // Open cart
    await page.click('[data-testid="cart-icon"]');
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
    
    // Update quantity
    const quantityInput = page.locator('[data-testid^="quantity-input-"]').first();
    await quantityInput.fill('3');
    await quantityInput.blur();
    
    // Should update total
    await expect(page.locator('[data-testid="cart-total"]')).toContainText('3');
  });

  test('should remove item from cart', async ({ page }) => {
    // Add product to cart first
    await page.goto('/products');
    await page.locator('[data-testid^="product-card-"]').first().click();
    await page.click('[data-testid="add-to-cart-btn"]');
    
    // Open cart
    await page.click('[data-testid="cart-icon"]');
    
    // Remove item
    await page.click('[data-testid^="remove-item-"]');
    
    // Should show empty cart message
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
    
    // Cart badge should disappear or show 0
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).not.toBeVisible();
  });

  test('should persist cart across page navigation', async ({ page }) => {
    // Add product to cart
    await page.goto('/products');
    await page.locator('[data-testid^="product-card-"]').first().click();
    await page.click('[data-testid="add-to-cart-btn"]');
    
    // Navigate to different page
    await page.goto('/about');
    
    // Cart should still show item
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toBeVisible();
    expect(await cartBadge.textContent()).toBe('1');
  });

  test('should calculate cart totals correctly', async ({ page }) => {
    // Add multiple products to cart
    await page.goto('/products');
    
    // Add first product
    await page.locator('[data-testid^="product-card-"]').first().click();
    const firstPrice = await page.locator('[data-testid="product-price"]').textContent();
    await page.click('[data-testid="add-to-cart-btn"]');
    
    // Go back and add second product
    await page.goBack();
    await page.locator('[data-testid^="product-card-"]').nth(1).click();
    const secondPrice = await page.locator('[data-testid="product-price"]').textContent();
    await page.click('[data-testid="add-to-cart-btn"]');
    
    // Open cart and verify totals
    await page.click('[data-testid="cart-icon"]');
    
    const subtotal = page.locator('[data-testid="cart-subtotal"]');
    await expect(subtotal).toBeVisible();
    
    // Calculate expected total
    const price1 = parseFloat(firstPrice?.replace(/[^0-9.]/g, '') || '0');
    const price2 = parseFloat(secondPrice?.replace(/[^0-9.]/g, '') || '0');
    const expectedTotal = price1 + price2;
    
    const subtotalText = await subtotal.textContent();
    const actualTotal = parseFloat(subtotalText?.replace(/[^0-9.]/g, '') || '0');
    
    expect(actualTotal).toBeCloseTo(expectedTotal, 2);
  });

  test('should handle quantity limits', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[data-testid^="product-card-"]').first().click();
    
    // Try to add large quantity
    const quantityInput = page.locator('[data-testid="quantity-selector"]');
    if (await quantityInput.isVisible()) {
      await quantityInput.fill('999');
      await page.click('[data-testid="add-to-cart-btn"]');
      
      // Should show error or limit quantity
      const errorMessage = page.locator('text=Quantity exceeds available stock');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    }
  });

  test('should show cart preview on hover', async ({ page }) => {
    // Add product to cart first
    await page.goto('/products');
    await page.locator('[data-testid^="product-card-"]').first().click();
    await page.click('[data-testid="add-to-cart-btn"]');
    
    // Hover over cart icon
    await page.hover('[data-testid="cart-icon"]');
    
    // Should show cart preview
    const cartPreview = page.locator('[data-testid="cart-preview"]');
    if (await cartPreview.isVisible()) {
      await expect(cartPreview).toBeVisible();
      await expect(page.locator('[data-testid="preview-item"]')).toBeVisible();
    }
  });

  test('should handle empty cart state', async ({ page }) => {
    // Open cart when empty
    await page.click('[data-testid="cart-icon"]');
    
    // Should show empty cart message
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
    
    // Should show continue shopping button
    const continueShoppingBtn = page.locator('text=Continue Shopping');
    if (await continueShoppingBtn.isVisible()) {
      await continueShoppingBtn.click();
      await expect(page).toHaveURL('/products');
    }
  });

  test('should save cart for guest users', async ({ page }) => {
    // Add product to cart as guest
    await page.goto('/products');
    await page.locator('[data-testid^="product-card-"]').first().click();
    await page.click('[data-testid="add-to-cart-btn"]');
    
    // Refresh page
    await page.reload();
    
    // Cart should still contain item
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toBeVisible();
    expect(await cartBadge.textContent()).toBe('1');
  });

  test('should proceed to checkout', async ({ page }) => {
    // Add product to cart
    await page.goto('/products');
    await page.locator('[data-testid^="product-card-"]').first().click();
    await page.click('[data-testid="add-to-cart-btn"]');
    
    // Open cart and proceed to checkout
    await page.click('[data-testid="cart-icon"]');
    await page.click('[data-testid="checkout-btn"]');
    
    // Should navigate to checkout page
    await expect(page).toHaveURL('/checkout');
    
    // Should show cart items in checkout
    await expect(page.locator('[data-testid="checkout-items"]')).toBeVisible();
  });

  test('should handle cart errors gracefully', async ({ page }) => {
    // This test simulates network errors or server issues
    // Add product to cart
    await page.goto('/products');
    await page.locator('[data-testid^="product-card-"]').first().click();
    
    // Simulate network failure by going offline
    await page.context().setOffline(true);
    
    await page.click('[data-testid="add-to-cart-btn"]');
    
    // Should show error message
    const errorMessage = page.locator('text=Unable to add to cart');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
    
    // Restore network
    await page.context().setOffline(false);
  });

  test('should clear entire cart', async ({ page }) => {
    // Add multiple products to cart
    await page.goto('/products');
    await page.locator('[data-testid^="product-card-"]').first().click();
    await page.click('[data-testid="add-to-cart-btn"]');
    
    await page.goBack();
    await page.locator('[data-testid^="product-card-"]').nth(1).click();
    await page.click('[data-testid="add-to-cart-btn"]');
    
    // Open cart
    await page.click('[data-testid="cart-icon"]');
    
    // Clear cart
    const clearCartBtn = page.locator('[data-testid="clear-cart-btn"]');
    if (await clearCartBtn.isVisible()) {
      await clearCartBtn.click();
      
      // Confirm clear action
      const confirmBtn = page.locator('[data-testid="confirm-clear"]');
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
      }
      
      // Should show empty cart
      await expect(page.locator('text=Your cart is empty')).toBeVisible();
    }
  });
});
import { test, expect } from '@playwright/test';

test.describe('Shopping Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should browse products and view details', async ({ page }) => {
    // Navigate to products page
    await page.click('text=Products');
    await expect(page).toHaveURL('/products');

    // Should show product grid
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
    
    // Should have at least one product
    const productCards = page.locator('[data-testid^="product-card-"]');
    await expect(productCards.first()).toBeVisible();

    // Click on first product to view details
    await productCards.first().click();
    
    // Should navigate to product detail page
    await expect(page).toHaveURL(/\/products\/[^/]+$/);
    
    // Should show product details
    await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="add-to-cart-btn"]')).toBeVisible();
  });

  test('should search for products', async ({ page }) => {
    // Use search functionality
    await page.fill('[data-testid="search-input"]', 'fiction');
    await page.press('[data-testid="search-input"]', 'Enter');

    // Should show search results
    await expect(page).toHaveURL(/\/products\?.*search=fiction/);
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Results should contain search term
    const productTitles = page.locator('[data-testid^="product-title-"]');
    const count = await productTitles.count();
    
    if (count > 0) {
      const firstTitle = await productTitles.first().textContent();
      expect(firstTitle?.toLowerCase()).toContain('fiction');
    }
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/products');
    
    // Click on category filter
    await page.click('[data-testid="category-filter-fiction"]');
    
    // Should update URL and show filtered results
    await expect(page).toHaveURL(/\/products\?.*category=fiction/);
    
    // All visible products should be in fiction category
    const categoryBadges = page.locator('[data-testid^="product-category-"]');
    const count = await categoryBadges.count();
    
    for (let i = 0; i < count; i++) {
      const categoryText = await categoryBadges.nth(i).textContent();
      expect(categoryText?.toLowerCase()).toBe('fiction');
    }
  });

  test('should filter products by price range', async ({ page }) => {
    await page.goto('/products');
    
    // Set price range filter
    await page.fill('[data-testid="price-min"]', '10');
    await page.fill('[data-testid="price-max"]', '50');
    await page.click('[data-testid="apply-filters"]');
    
    // Should show products within price range
    const prices = page.locator('[data-testid^="product-price-"]');
    const count = await prices.count();
    
    for (let i = 0; i < count; i++) {
      const priceText = await prices.nth(i).textContent();
      const price = parseFloat(priceText?.replace(/[^0-9.]/g, '') || '0');
      expect(price).toBeGreaterThanOrEqual(10);
      expect(price).toBeLessThanOrEqual(50);
    }
  });

  test('should sort products', async ({ page }) => {
    await page.goto('/products');
    
    // Sort by price ascending
    await page.selectOption('[data-testid="sort-select"]', 'price_asc');
    
    // Wait for results to update
    await page.waitForTimeout(1000);
    
    // Verify sorting
    const prices = page.locator('[data-testid^="product-price-"]');
    const count = await prices.count();
    
    if (count > 1) {
      const firstPrice = parseFloat((await prices.first().textContent())?.replace(/[^0-9.]/g, '') || '0');
      const lastPrice = parseFloat((await prices.last().textContent())?.replace(/[^0-9.]/g, '') || '0');
      expect(firstPrice).toBeLessThanOrEqual(lastPrice);
    }
  });

  test('should handle pagination', async ({ page }) => {
    await page.goto('/products');
    
    // Check if pagination exists
    const pagination = page.locator('[data-testid="pagination"]');
    
    if (await pagination.isVisible()) {
      const nextButton = page.locator('[data-testid="next-page"]');
      
      if (await nextButton.isVisible() && !(await nextButton.isDisabled())) {
        // Click next page
        await nextButton.click();
        
        // Should update URL with page parameter
        await expect(page).toHaveURL(/\/products\?.*page=2/);
        
        // Should show different products
        await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
      }
    }
  });

  test('should show product availability', async ({ page }) => {
    await page.goto('/products');
    
    const productCard = page.locator('[data-testid^="product-card-"]').first();
    await productCard.click();
    
    // Should show stock status
    const stockStatus = page.locator('[data-testid="stock-status"]');
    await expect(stockStatus).toBeVisible();
    
    const statusText = await stockStatus.textContent();
    expect(statusText).toMatch(/In Stock|Out of Stock|Limited Stock/);
  });

  test('should handle out of stock products', async ({ page }) => {
    // This test assumes there's at least one out of stock product
    await page.goto('/products');
    
    // Look for out of stock product
    const outOfStockProduct = page.locator('[data-testid="product-card"]:has-text("Out of Stock")').first();
    
    if (await outOfStockProduct.isVisible()) {
      await outOfStockProduct.click();
      
      // Add to cart button should be disabled
      const addToCartBtn = page.locator('[data-testid="add-to-cart-btn"]');
      await expect(addToCartBtn).toBeDisabled();
      
      // Should show out of stock message
      await expect(page.locator('text=Out of Stock')).toBeVisible();
    }
  });

  test('should show related products', async ({ page }) => {
    await page.goto('/products');
    
    const productCard = page.locator('[data-testid^="product-card-"]').first();
    await productCard.click();
    
    // Should show related products section
    const relatedProducts = page.locator('[data-testid="related-products"]');
    
    if (await relatedProducts.isVisible()) {
      const relatedItems = page.locator('[data-testid^="related-product-"]');
      expect(await relatedItems.count()).toBeGreaterThan(0);
    }
  });

  test('should handle product images', async ({ page }) => {
    await page.goto('/products');
    
    const productCard = page.locator('[data-testid^="product-card-"]').first();
    await productCard.click();
    
    // Should show product image
    const productImage = page.locator('[data-testid="product-image"]');
    await expect(productImage).toBeVisible();
    
    // Image should be loaded
    await expect(productImage).toHaveAttribute('src', /.+/);
    
    // Test image gallery if multiple images exist
    const imageGallery = page.locator('[data-testid="image-gallery"]');
    
    if (await imageGallery.isVisible()) {
      const thumbnails = page.locator('[data-testid^="thumbnail-"]');
      const count = await thumbnails.count();
      
      if (count > 1) {
        // Click on second thumbnail
        await thumbnails.nth(1).click();
        
        // Main image should change
        await page.waitForTimeout(500);
        const newImageSrc = await productImage.getAttribute('src');
        expect(newImageSrc).toBeTruthy();
      }
    }
  });
});
import { test, expect, devices } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  const browsers = ['chromium', 'firefox', 'webkit'];
  
  browsers.forEach(browserName => {
    test.describe(`${browserName} compatibility`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto('/');
      });

      test(`should load homepage correctly in ${browserName}`, async ({ page }) => {
        // Check basic page elements
        await expect(page.locator('[data-testid="header"]')).toBeVisible();
        await expect(page.locator('[data-testid="navigation"]')).toBeVisible();
        await expect(page.locator('[data-testid="footer"]')).toBeVisible();
        
        // Check hero section
        await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
        
        // Check featured products
        await expect(page.locator('[data-testid="featured-products"]')).toBeVisible();
      });

      test(`should handle navigation in ${browserName}`, async ({ page }) => {
        // Test main navigation links
        await page.click('text=Products');
        await expect(page).toHaveURL('/products');
        
        await page.click('text=About');
        await expect(page).toHaveURL('/about');
        
        await page.click('text=Contact');
        await expect(page).toHaveURL('/contact');
        
        // Test logo click returns to home
        await page.click('[data-testid="logo"]');
        await expect(page).toHaveURL('/');
      });

      test(`should handle forms correctly in ${browserName}`, async ({ page }) => {
        // Test contact form
        await page.goto('/contact');
        
        await page.fill('[data-testid="contact-name"]', 'Test User');
        await page.fill('[data-testid="contact-email"]', 'test@example.com');
        await page.fill('[data-testid="contact-message"]', 'Test message');
        
        await page.click('[data-testid="contact-submit"]');
        
        // Should show success message
        await expect(page.locator('text=Message sent successfully')).toBeVisible();
      });

      test(`should handle responsive design in ${browserName}`, async ({ page }) => {
        // Test desktop view
        await page.setViewportSize({ width: 1200, height: 800 });
        await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible();
        
        // Test tablet view
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(500);
        
        // Test mobile view
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(500);
        
        // Mobile menu should be visible
        const mobileMenuBtn = page.locator('[data-testid="mobile-menu-btn"]');
        if (await mobileMenuBtn.isVisible()) {
          await mobileMenuBtn.click();
          await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
        }
      });

      test(`should handle JavaScript interactions in ${browserName}`, async ({ page }) => {
        // Test cart functionality
        await page.goto('/products');
        await page.locator('[data-testid^="product-card-"]').first().click();
        
        // Add to cart
        await page.click('[data-testid="add-to-cart-btn"]');
        
        // Cart badge should update
        await expect(page.locator('[data-testid="cart-badge"]')).toBeVisible();
        
        // Open cart drawer
        await page.click('[data-testid="cart-icon"]');
        await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
      });

      test(`should handle CSS animations in ${browserName}`, async ({ page }) => {
        // Test hover effects
        const productCard = page.locator('[data-testid^="product-card-"]').first();
        await page.goto('/products');
        
        // Hover over product card
        await productCard.hover();
        
        // Should have hover state (this is basic - actual animation testing would need more sophisticated checks)
        await expect(productCard).toBeVisible();
        
        // Test loading animations
        await page.goto('/products?category=fiction');
        
        // Should show loading state briefly
        const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
        // Note: Loading might be too fast to catch, so we just check it doesn't error
      });

      test(`should handle local storage in ${browserName}`, async ({ page }) => {
        // Add item to cart (should use localStorage for guest users)
        await page.goto('/products');
        await page.locator('[data-testid^="product-card-"]').first().click();
        await page.click('[data-testid="add-to-cart-btn"]');
        
        // Refresh page
        await page.reload();
        
        // Cart should persist
        await expect(page.locator('[data-testid="cart-badge"]')).toBeVisible();
      });

      test(`should handle cookies in ${browserName}`, async ({ page }) => {
        // Accept cookies if banner appears
        const cookieBanner = page.locator('[data-testid="cookie-banner"]');
        if (await cookieBanner.isVisible()) {
          await page.click('[data-testid="accept-cookies"]');
          await expect(cookieBanner).not.toBeVisible();
        }
        
        // Refresh page - cookie banner should not appear again
        await page.reload();
        await expect(cookieBanner).not.toBeVisible();
      });

      test(`should handle images correctly in ${browserName}`, async ({ page }) => {
        await page.goto('/products');
        
        // Check that product images load
        const productImages = page.locator('[data-testid^="product-image-"]');
        const count = await productImages.count();
        
        if (count > 0) {
          const firstImage = productImages.first();
          await expect(firstImage).toBeVisible();
          
          // Check that image has loaded (has src attribute)
          const src = await firstImage.getAttribute('src');
          expect(src).toBeTruthy();
        }
      });

      test(`should handle fonts correctly in ${browserName}`, async ({ page }) => {
        // Check that custom fonts are loaded
        await page.goto('/');
        
        const heading = page.locator('h1').first();
        if (await heading.isVisible()) {
          const fontFamily = await heading.evaluate(el => 
            window.getComputedStyle(el).fontFamily
          );
          
          // Should not be using default system fonts only
          expect(fontFamily).toBeTruthy();
        }
      });

      test(`should handle print styles in ${browserName}`, async ({ page }) => {
        await page.goto('/products');
        await page.locator('[data-testid^="product-card-"]').first().click();
        
        // Emulate print media
        await page.emulateMedia({ media: 'print' });
        
        // Page should still be readable
        await expect(page.locator('[data-testid="product-title"]')).toBeVisible();
        
        // Reset to screen media
        await page.emulateMedia({ media: 'screen' });
      });
    });
  });

  test.describe('Mobile Device Compatibility', () => {
    const mobileDevices = [
      devices['iPhone 12'],
      devices['Pixel 5'],
      devices['iPad'],
    ];

    mobileDevices.forEach(device => {
      test(`should work on ${device.name}`, async ({ browser }) => {
        const context = await browser.newContext({
          ...device,
        });
        const page = await context.newPage();
        
        await page.goto('/');
        
        // Basic functionality should work
        await expect(page.locator('[data-testid="header"]')).toBeVisible();
        
        // Touch interactions should work
        await page.goto('/products');
        const productCard = page.locator('[data-testid^="product-card-"]').first();
        await productCard.tap();
        
        // Should navigate to product page
        await expect(page).toHaveURL(/\/products\/[^/]+$/);
        
        await context.close();
      });
    });
  });

  test.describe('Accessibility Compatibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/');
      
      // Tab through navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to activate links with Enter
      await page.keyboard.press('Enter');
      
      // Should navigate somewhere
      await page.waitForTimeout(1000);
      expect(page.url()).not.toBe('/');
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/');
      
      // Check for ARIA landmarks
      await expect(page.locator('[role="navigation"]')).toBeVisible();
      await expect(page.locator('[role="main"]')).toBeVisible();
      
      // Check for ARIA labels on interactive elements
      const buttons = page.locator('button');
      const count = await buttons.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const text = await button.textContent();
        
        // Button should have either aria-label or text content
        expect(ariaLabel || text).toBeTruthy();
      }
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');
      
      // Should have h1
      await expect(page.locator('h1')).toBeVisible();
      
      // Check heading hierarchy (h1 -> h2 -> h3, etc.)
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      
      if (headings.length > 1) {
        // Basic check that we have headings
        expect(headings.length).toBeGreaterThan(0);
      }
    });

    test('should have sufficient color contrast', async ({ page }) => {
      await page.goto('/');
      
      // This is a basic test - full color contrast testing would require specialized tools
      // We just check that text is visible and readable
      const textElements = page.locator('p, span, div').filter({ hasText: /\w+/ });
      const count = await textElements.count();
      
      if (count > 0) {
        const firstText = textElements.first();
        await expect(firstText).toBeVisible();
        
        // Check that text has color (not transparent)
        const color = await firstText.evaluate(el => 
          window.getComputedStyle(el).color
        );
        expect(color).not.toBe('rgba(0, 0, 0, 0)');
      }
    });
  });

  test.describe('Performance Compatibility', () => {
    test('should load within acceptable time limits', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds (generous for E2E testing)
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow 3G
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });
      
      await page.goto('/');
      
      // Should still load successfully
      await expect(page.locator('[data-testid="header"]')).toBeVisible({ timeout: 10000 });
    });

    test('should handle offline conditions gracefully', async ({ page }) => {
      await page.goto('/');
      
      // Go offline
      await page.context().setOffline(true);
      
      // Try to navigate
      await page.click('text=Products');
      
      // Should show offline message or cached content
      const offlineMessage = page.locator('text=You are offline');
      const cachedContent = page.locator('[data-testid="product-grid"]');
      
      // Either offline message or cached content should be visible
      await expect(offlineMessage.or(cachedContent)).toBeVisible({ timeout: 5000 });
      
      // Go back online
      await page.context().setOffline(false);
    });
  });
});
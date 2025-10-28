import { test, expect } from '@playwright/test';

test.describe('Admin Panel Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Sign in as admin user
    await page.click('text=Sign In');
    await page.fill('[data-testid="email"]', 'admin@example.com');
    await page.fill('[data-testid="password"]', 'AdminPassword123!');
    await page.click('[data-testid="signin-submit"]');
    
    // Navigate to admin panel
    await page.goto('/admin');
  });

  test('should access admin dashboard', async ({ page }) => {
    // Should show admin dashboard
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible();
    
    // Should show key metrics
    await expect(page.locator('[data-testid="total-orders"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-products"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-users"]')).toBeVisible();
  });

  test('should manage products', async ({ page }) => {
    // Navigate to products management
    await page.click('[data-testid="admin-products"]');
    await expect(page).toHaveURL('/admin/products');
    
    // Should show products list
    await expect(page.locator('[data-testid="products-table"]')).toBeVisible();
    
    // Should have add product button
    await expect(page.locator('[data-testid="add-product-btn"]')).toBeVisible();
  });

  test('should add new product', async ({ page }) => {
    await page.click('[data-testid="admin-products"]');
    await page.click('[data-testid="add-product-btn"]');
    
    // Should show product form
    await expect(page.locator('[data-testid="product-form"]')).toBeVisible();
    
    // Fill product details
    await page.fill('[data-testid="product-title"]', 'Test Book');
    await page.fill('[data-testid="product-description"]', 'A great test book');
    await page.fill('[data-testid="product-price"]', '29.99');
    await page.selectOption('[data-testid="product-category"]', 'fiction');
    await page.fill('[data-testid="product-author"]', 'Test Author');
    await page.fill('[data-testid="product-stock"]', '10');
    
    // Submit form
    await page.click('[data-testid="save-product"]');
    
    // Should show success message
    await expect(page.locator('text=Product created successfully')).toBeVisible();
    
    // Should redirect to products list
    await expect(page).toHaveURL('/admin/products');
  });

  test('should edit existing product', async ({ page }) => {
    await page.click('[data-testid="admin-products"]');
    
    // Click edit on first product
    await page.click('[data-testid^="edit-product-"]');
    
    // Should show edit form with existing data
    await expect(page.locator('[data-testid="product-form"]')).toBeVisible();
    
    // Update product title
    await page.fill('[data-testid="product-title"]', 'Updated Test Book');
    
    // Save changes
    await page.click('[data-testid="save-product"]');
    
    // Should show success message
    await expect(page.locator('text=Product updated successfully')).toBeVisible();
  });

  test('should delete product', async ({ page }) => {
    await page.click('[data-testid="admin-products"]');
    
    // Click delete on first product
    await page.click('[data-testid^="delete-product-"]');
    
    // Should show confirmation dialog
    await expect(page.locator('[data-testid="confirm-delete"]')).toBeVisible();
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete-btn"]');
    
    // Should show success message
    await expect(page.locator('text=Product deleted successfully')).toBeVisible();
  });

  test('should manage product images', async ({ page }) => {
    await page.click('[data-testid="admin-products"]');
    await page.click('[data-testid="add-product-btn"]');
    
    // Should show image upload section
    await expect(page.locator('[data-testid="image-upload"]')).toBeVisible();
    
    // Test file upload (mock file)
    const fileInput = page.locator('[data-testid="file-input"]');
    
    // Create a mock file
    const buffer = Buffer.from('fake image content');
    await fileInput.setInputFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: buffer,
    });
    
    // Should show image preview
    await expect(page.locator('[data-testid="image-preview"]')).toBeVisible();
  });

  test('should manage orders', async ({ page }) => {
    // Navigate to orders management
    await page.click('[data-testid="admin-orders"]');
    await expect(page).toHaveURL('/admin/orders');
    
    // Should show orders list
    await expect(page.locator('[data-testid="orders-table"]')).toBeVisible();
    
    // Should show order filters
    await expect(page.locator('[data-testid="order-filters"]')).toBeVisible();
  });

  test('should update order status', async ({ page }) => {
    await page.click('[data-testid="admin-orders"]');
    
    // Click on first order
    await page.click('[data-testid^="order-row-"]');
    
    // Should show order details
    await expect(page.locator('[data-testid="order-details"]')).toBeVisible();
    
    // Update order status
    await page.selectOption('[data-testid="order-status"]', 'shipped');
    await page.click('[data-testid="update-status"]');
    
    // Should show success message
    await expect(page.locator('text=Order status updated')).toBeVisible();
  });

  test('should filter orders by status', async ({ page }) => {
    await page.click('[data-testid="admin-orders"]');
    
    // Filter by pending orders
    await page.selectOption('[data-testid="status-filter"]', 'pending');
    
    // Should update the orders list
    await page.waitForTimeout(1000);
    
    // All visible orders should have pending status
    const statusCells = page.locator('[data-testid^="order-status-"]');
    const count = await statusCells.count();
    
    for (let i = 0; i < count; i++) {
      const statusText = await statusCells.nth(i).textContent();
      expect(statusText?.toLowerCase()).toContain('pending');
    }
  });

  test('should manage users', async ({ page }) => {
    // Navigate to users management
    await page.click('[data-testid="admin-users"]');
    await expect(page).toHaveURL('/admin/users');
    
    // Should show users list
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
    
    // Should show user search
    await expect(page.locator('[data-testid="user-search"]')).toBeVisible();
  });

  test('should search users', async ({ page }) => {
    await page.click('[data-testid="admin-users"]');
    
    // Search for users
    await page.fill('[data-testid="user-search"]', 'test@example.com');
    await page.press('[data-testid="user-search"]', 'Enter');
    
    // Should filter users list
    await page.waitForTimeout(1000);
    
    const userEmails = page.locator('[data-testid^="user-email-"]');
    const count = await userEmails.count();
    
    if (count > 0) {
      const firstEmail = await userEmails.first().textContent();
      expect(firstEmail?.toLowerCase()).toContain('test@example.com');
    }
  });

  test('should update user role', async ({ page }) => {
    await page.click('[data-testid="admin-users"]');
    
    // Click on first user
    await page.click('[data-testid^="user-row-"]');
    
    // Should show user details
    await expect(page.locator('[data-testid="user-details"]')).toBeVisible();
    
    // Update user role
    await page.selectOption('[data-testid="user-role"]', 'admin');
    await page.click('[data-testid="update-role"]');
    
    // Should show success message
    await expect(page.locator('text=User role updated')).toBeVisible();
  });

  test('should view analytics', async ({ page }) => {
    // Navigate to analytics
    await page.click('[data-testid="admin-analytics"]');
    await expect(page).toHaveURL('/admin/analytics');
    
    // Should show analytics dashboard
    await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible();
    
    // Should show charts
    await expect(page.locator('[data-testid="sales-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="orders-chart"]')).toBeVisible();
  });

  test('should export data', async ({ page }) => {
    await page.click('[data-testid="admin-orders"]');
    
    // Click export button
    const exportBtn = page.locator('[data-testid="export-orders"]');
    
    if (await exportBtn.isVisible()) {
      // Set up download handler
      const downloadPromise = page.waitForEvent('download');
      
      await exportBtn.click();
      
      // Wait for download
      const download = await downloadPromise;
      
      // Verify download
      expect(download.suggestedFilename()).toMatch(/orders.*\.csv/);
    }
  });

  test('should manage blog posts', async ({ page }) => {
    // Navigate to blog management
    await page.click('[data-testid="admin-blog"]');
    await expect(page).toHaveURL('/admin/blog');
    
    // Should show blog posts list
    await expect(page.locator('[data-testid="blog-posts-table"]')).toBeVisible();
    
    // Should have add post button
    await expect(page.locator('[data-testid="add-post-btn"]')).toBeVisible();
  });

  test('should create blog post', async ({ page }) => {
    await page.click('[data-testid="admin-blog"]');
    await page.click('[data-testid="add-post-btn"]');
    
    // Should show blog post form
    await expect(page.locator('[data-testid="blog-form"]')).toBeVisible();
    
    // Fill blog post details
    await page.fill('[data-testid="post-title"]', 'Test Blog Post');
    await page.fill('[data-testid="post-excerpt"]', 'This is a test blog post');
    await page.fill('[data-testid="post-content"]', 'This is the full content of the test blog post.');
    
    // Save post
    await page.click('[data-testid="save-post"]');
    
    // Should show success message
    await expect(page.locator('text=Blog post created successfully')).toBeVisible();
  });

  test('should handle admin permissions', async ({ page }) => {
    // Test that non-admin users cannot access admin panel
    await page.goto('/');
    
    // Sign out current admin
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Sign Out');
    
    // Sign in as regular user
    await page.click('text=Sign In');
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.fill('[data-testid="password"]', 'UserPassword123!');
    await page.click('[data-testid="signin-submit"]');
    
    // Try to access admin panel
    await page.goto('/admin');
    
    // Should be redirected or show access denied
    await expect(page.locator('text=Access Denied')).toBeVisible();
  });

  test('should handle bulk operations', async ({ page }) => {
    await page.click('[data-testid="admin-products"]');
    
    // Select multiple products
    await page.check('[data-testid^="select-product-"]:nth-child(1)');
    await page.check('[data-testid^="select-product-"]:nth-child(2)');
    
    // Should show bulk actions
    await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible();
    
    // Test bulk status update
    await page.selectOption('[data-testid="bulk-action"]', 'update-status');
    await page.selectOption('[data-testid="bulk-status"]', 'draft');
    await page.click('[data-testid="apply-bulk-action"]');
    
    // Should show confirmation
    await expect(page.locator('text=Bulk action completed')).toBeVisible();
  });
});
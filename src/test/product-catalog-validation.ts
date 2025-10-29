import { supabase } from '@/lib/supabase';
import { errorMonitoring } from '@/lib/services/ErrorMonitoring';

interface ProductValidationResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: Record<string, unknown>;
}

export class ProductCatalogValidator {
  private results: ProductValidationResult[] = [];

  async validateProductCatalog(): Promise<ProductValidationResult[]> {
    this.results = [];
    
    console.log('📚 Starting Product Catalog & Search Validation...\n');
    
    // Test 1: Product Database Schema
    await this.testProductDatabaseSchema();
    
    // Test 2: Product Listing
    await this.testProductListing();
    
    // Test 3: Product Search
    await this.testProductSearch();
    
    // Test 4: Product Filtering
    await this.testProductFiltering();
    
    // Test 5: Product Sorting
    await this.testProductSorting();
    
    // Test 6: Product Details
    await this.testProductDetails();
    
    // Test 7: Category System
    await this.testCategorySystem();
    
    // Test 8: Product Reviews and Ratings
    await this.testProductReviews();
    
    return this.results;
  }

  private async testProductDatabaseSchema(): Promise<void> {
    try {
      // Test products table structure
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(1);

      if (productsError && !productsError.message.includes('0 rows')) {
        this.addResult('Product Database Schema', 'fail', 'Products table not accessible', productsError);
        return;
      }

      // Test categories table structure
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .limit(1);

      if (categoriesError && !categoriesError.message.includes('0 rows')) {
        this.addResult('Product Database Schema', 'fail', 'Categories table not accessible', categoriesError);
        return;
      }

      this.addResult('Product Database Schema', 'pass', 'Product and category tables accessible');
    } catch (error) {
      this.addResult('Product Database Schema', 'fail', 'Database schema validation error', error);
    }
  }

  private async testProductListing(): Promise<void> {
    try {
      // Test product listing with categories
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(*)
        `)
        .limit(5);

      if (error) {
        this.addResult('Product Listing', 'fail', 'Cannot fetch products with categories', error);
        return;
      }

      if (products && products.length > 0) {
        // Check if products have required fields
        const firstProduct = products[0];
        const requiredFields = ['id', 'name', 'price', 'stock'];
        const missingFields = requiredFields.filter(field => !firstProduct[field]);
        
        if (missingFields.length > 0) {
          this.addResult('Product Listing', 'warning', `Products missing fields: ${missingFields.join(', ')}`);
        } else {
          this.addResult('Product Listing', 'pass', 'Product listing working correctly');
        }
      } else {
        this.addResult('Product Listing', 'warning', 'No products found in database');
      }
    } catch (error) {
      this.addResult('Product Listing', 'fail', 'Product listing validation error', error);
    }
  }

  private async testProductSearch(): Promise<void> {
    try {
      // Test search functionality
      const searchQuery = 'book';
      const { data: searchResults, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(*)
        `)
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(5);

      if (error) {
        this.addResult('Product Search', 'fail', 'Search functionality not working', error);
        return;
      }

      // Test empty search
      const { data: emptyResults, error: emptyError } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%nonexistentproduct%,description.ilike.%nonexistentproduct%`);

      if (emptyError) {
        this.addResult('Product Search', 'warning', 'Empty search handling error', emptyError);
      } else {
        this.addResult('Product Search', 'pass', 'Product search functionality working');
      }
    } catch (error) {
      this.addResult('Product Search', 'fail', 'Product search validation error', error);
    }
  }

  private async testProductFiltering(): Promise<void> {
    try {
      // Test category filtering
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id')
        .limit(1);

      if (catError) {
        this.addResult('Product Filtering', 'warning', 'Cannot test category filtering - no categories', catError);
        return;
      }

      if (categories && categories.length > 0) {
        const { data: filteredProducts, error: filterError } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', categories[0].id);

        if (filterError) {
          this.addResult('Product Filtering', 'fail', 'Category filtering not working', filterError);
        } else {
          this.addResult('Product Filtering', 'pass', 'Product filtering functionality working');
        }
      } else {
        this.addResult('Product Filtering', 'warning', 'No categories available for filtering test');
      }
    } catch (error) {
      this.addResult('Product Filtering', 'fail', 'Product filtering validation error', error);
    }
  }

  private async testProductSorting(): Promise<void> {
    try {
      // Test sorting by different criteria
      const sortTests = [
        { field: 'price', order: 'asc' },
        { field: 'price', order: 'desc' },
        { field: 'created_at', order: 'desc' },
        { field: 'name', order: 'asc' }
      ];

      let allSortsPassed = true;
      for (const sort of sortTests) {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('id, name, price, created_at')
            .order(sort.field, { ascending: sort.order === 'asc' })
            .limit(3);

          if (error) {
            this.addResult('Product Sorting', 'warning', `Sorting by ${sort.field} failed`, error);
            allSortsPassed = false;
          }
        } catch (sortError) {
          this.addResult('Product Sorting', 'warning', `Sorting by ${sort.field} error`, sortError);
          allSortsPassed = false;
        }
      }

      if (allSortsPassed) {
        this.addResult('Product Sorting', 'pass', 'Product sorting functionality working');
      }
    } catch (error) {
      this.addResult('Product Sorting', 'fail', 'Product sorting validation error', error);
    }
  }

  private async testProductDetails(): Promise<void> {
    try {
      // Test individual product retrieval
      const { data: products, error: listError } = await supabase
        .from('products')
        .select('id')
        .limit(1);

      if (listError || !products || products.length === 0) {
        this.addResult('Product Details', 'warning', 'No products available for detail test');
        return;
      }

      const productId = products[0].id;
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(*)
        `)
        .eq('id', productId)
        .single();

      if (error) {
        this.addResult('Product Details', 'fail', 'Cannot fetch individual product details', error);
      } else if (product) {
        // Check if product has essential details
        const hasEssentialFields = product.name && product.price !== undefined && product.stock !== undefined;
        if (hasEssentialFields) {
          this.addResult('Product Details', 'pass', 'Product details functionality working');
        } else {
          this.addResult('Product Details', 'warning', 'Product missing essential fields');
        }
      } else {
        this.addResult('Product Details', 'fail', 'Product details not found');
      }
    } catch (error) {
      this.addResult('Product Details', 'fail', 'Product details validation error', error);
    }
  }

  private async testCategorySystem(): Promise<void> {
    try {
      // Test category listing
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        this.addResult('Category System', 'fail', 'Cannot fetch categories', error);
        return;
      }

      if (categories && categories.length > 0) {
        // Test category-product relationship
        const { data: productsWithCategories, error: relationError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            categories(id, name)
          `)
          .limit(3);

        if (relationError) {
          this.addResult('Category System', 'warning', 'Category-product relationship error', relationError);
        } else {
          this.addResult('Category System', 'pass', 'Category system working correctly');
        }
      } else {
        this.addResult('Category System', 'warning', 'No categories found in database');
      }
    } catch (error) {
      this.addResult('Category System', 'fail', 'Category system validation error', error);
    }
  }

  private async testProductReviews(): Promise<void> {
    try {
      // Test product rating functions
      const { data: products, error: listError } = await supabase
        .from('products')
        .select('id')
        .limit(1);

      if (listError || !products || products.length === 0) {
        this.addResult('Product Reviews', 'warning', 'No products available for review test');
        return;
      }

      const productId = products[0].id;
      
      // Test rating functions
      const [ratingResult, countResult] = await Promise.all([
        supabase.rpc('get_product_average_rating', { product_uuid: productId }),
        supabase.rpc('get_product_review_count', { product_uuid: productId })
      ]);

      if (ratingResult.error || countResult.error) {
        if (ratingResult.error?.message.includes('function get_product_average_rating() does not exist') ||
            countResult.error?.message.includes('function get_product_review_count() does not exist')) {
          this.addResult('Product Reviews', 'warning', 'Review functions not implemented in database');
        } else {
          this.addResult('Product Reviews', 'fail', 'Review functions error', {
            ratingError: ratingResult.error,
            countError: countResult.error
          });
        }
      } else {
        this.addResult('Product Reviews', 'pass', 'Product review system available');
      }
    } catch (error) {
      this.addResult('Product Reviews', 'fail', 'Product reviews validation error', error);
    }
  }

  private addResult(test: string, status: 'pass' | 'fail' | 'warning', message: string, details?: Record<string, unknown>): void {
    this.results.push({ test, status, message, details });
    
    const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${emoji} ${test}: ${message}`);
    
    if (details && status !== 'pass') {
      console.log('   Details:', details);
    }
  }

  generateReport(): string {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    
    let report = '\n📊 Product Catalog & Search Validation Report\n';
    report += '='.repeat(50) + '\n';
    report += `✅ Passed: ${passed}\n`;
    report += `❌ Failed: ${failed}\n`;
    report += `⚠️  Warnings: ${warnings}\n`;
    report += `📋 Total Tests: ${this.results.length}\n\n`;
    
    if (failed > 0) {
      report += '❌ FAILED TESTS:\n';
      this.results.filter(r => r.status === 'fail').forEach(result => {
        report += `   • ${result.test}: ${result.message}\n`;
      });
      report += '\n';
    }
    
    if (warnings > 0) {
      report += '⚠️  WARNINGS:\n';
      this.results.filter(r => r.status === 'warning').forEach(result => {
        report += `   • ${result.test}: ${result.message}\n`;
      });
      report += '\n';
    }
    
    const overallStatus = failed === 0 ? (warnings === 0 ? 'EXCELLENT' : 'GOOD') : 'NEEDS ATTENTION';
    report += `🎯 Overall Status: ${overallStatus}\n`;
    
    return report;
  }
}

// Export function to run validation
export async function validateProductCatalog(): Promise<void> {
  const validator = new ProductCatalogValidator();
  
  try {
    await validator.validateProductCatalog();
    const report = validator.generateReport();
    console.log(report);
    
    // Log to error monitoring if available
    if (errorMonitoring) {
      errorMonitoring.captureMessage('Product catalog validation completed', 'info');
    }
  } catch (error) {
    console.error('❌ Product catalog validation failed:', error);
    if (errorMonitoring) {
      errorMonitoring.captureError(error as Error, {
        component: 'ProductCatalogValidator',
        action: 'validation_failed'
      });
    }
  }
}

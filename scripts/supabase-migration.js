#!/usr/bin/env node

/**
 * Supabase Migration and Verification Script
 * 
 * This script ensures all Supabase integrations are properly configured
 * and creates sample data for testing.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = 'https://tyjnywhsynuwgclpehtx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5am55d2hzeW51d2djbHBlaHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTAwODMsImV4cCI6MjA3Njk4NjA4M30.opDu5zS7aQh17B-Mf7awqNo4DayPZx_fA4e3-SDXzqw';

// Files that might contain hardcoded Supabase references
const FILES_TO_CHECK = [
  'src/pages/UpiPayment.tsx',
  'src/integrations/supabase/client.ts',
  'src/lib/supabase.ts',
  'src/lib/services/blogService.ts',
  'src/lib/hooks/useAuth.ts',
  'src/lib/hooks/useOrders.ts',
  'src/lib/hooks/useProducts.ts'
];

// Database schema verification
const REQUIRED_TABLES = [
  'profiles',
  'products',
  'categories',
  'orders',
  'order_items',
  'reviews',
  'blog_posts',
  'blog_categories',
  'promo_codes',
  'addresses'
];

async function verifySupabaseConnection() {
  console.log('🔍 Verifying Supabase connection...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (response.ok) {
      console.log('✅ Supabase connection successful');
      return true;
    } else {
      console.error('❌ Supabase connection failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Supabase connection error:', error.message);
    return false;
  }
}

async function verifyDatabaseSchema() {
  console.log('🔍 Verifying database schema...');
  
  const missingTables = [];
  
  for (const table of REQUIRED_TABLES) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (response.ok) {
        console.log(`  ✅ Table '${table}' exists`);
      } else if (response.status === 404) {
        console.log(`  ❌ Table '${table}' missing`);
        missingTables.push(table);
      } else {
        console.log(`  ⚠️  Table '${table}' - Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ Error checking table '${table}':`, error.message);
      missingTables.push(table);
    }
  }

  if (missingTables.length > 0) {
    console.log('\n📋 Missing tables that need to be created:');
    missingTables.forEach(table => console.log(`  - ${table}`));
    return false;
  }

  console.log('✅ All required tables exist');
  return true;
}

function fixHardcodedUrls() {
  console.log('🔧 Fixing hardcoded URLs...');
  
  let fixedFiles = 0;
  
  FILES_TO_CHECK.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  File not found: ${filePath}`);
      return;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Replace old Supabase URLs
      const oldUrls = [
        'https://ihxtvfuqodvodrutvvcp.supabase.co',
        'ihxtvfuqodvodrutvvcp.supabase.co'
      ];

      oldUrls.forEach(oldUrl => {
        if (content.includes(oldUrl)) {
          content = content.replace(new RegExp(oldUrl, 'g'), SUPABASE_URL);
          modified = true;
        }
      });

      // Replace old JWT tokens
      const oldTokens = [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloeHR2ZnVxb2R2b2RydXR2dmNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTk4NjgsImV4cCI6MjA2NTI3NTg2OH0.cAjvbp2C5rMvvWVpRHG0LNfu4pa4sQp2agIKfq0ZtFw'
      ];

      oldTokens.forEach(oldToken => {
        if (content.includes(oldToken)) {
          content = content.replace(new RegExp(oldToken, 'g'), SUPABASE_ANON_KEY);
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`  ✅ Fixed: ${filePath}`);
        fixedFiles++;
      } else {
        console.log(`  ✓ OK: ${filePath}`);
      }
    } catch (error) {
      console.log(`  ❌ Error processing ${filePath}:`, error.message);
    }
  });

  console.log(`\n🔧 Fixed ${fixedFiles} file(s)`);
  return fixedFiles;
}

async function createSampleData() {
  console.log('📝 Creating sample data...');

  const sampleData = {
    categories: [
      {
        id: 1,
        name: 'Islamic Books',
        slug: 'islamic-books',
        description: 'Books on Islamic teachings and spirituality',
        image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
        is_active: true
      },
      {
        id: 2,
        name: 'Fiction',
        slug: 'fiction',
        description: 'Fictional stories and novels',
        image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        is_active: true
      },
      {
        id: 3,
        name: 'Educational',
        slug: 'educational',
        description: 'Educational and academic books',
        image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
        is_active: true
      }
    ],
    products: [
      {
        title: 'The Sealed Nectar',
        description: 'A comprehensive biography of Prophet Muhammad (PBUH)',
        price: 299.99,
        compare_at_price: 399.99,
        category: 'Islamic Books',
        author: 'Safiur Rahman Mubarakpuri',
        publisher: 'Darussalam',
        isbn: '9789960899558',
        language: 'English',
        pages: 624,
        weight: 0.8,
        stock_quantity: 50,
        low_stock_threshold: 5,
        featured: true,
        status: 'published',
        image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
        tags: ['biography', 'prophet', 'islamic', 'history']
      },
      {
        title: 'Quran Translation and Commentary',
        description: 'Complete Quran with English translation and detailed commentary',
        price: 599.99,
        compare_at_price: 799.99,
        category: 'Islamic Books',
        author: 'Abdullah Yusuf Ali',
        publisher: 'Islamic Foundation',
        isbn: '9781567445183',
        language: 'English/Arabic',
        pages: 1200,
        weight: 1.5,
        stock_quantity: 30,
        low_stock_threshold: 3,
        featured: true,
        status: 'published',
        image_url: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400',
        tags: ['quran', 'translation', 'commentary', 'islamic']
      },
      {
        title: 'The Alchemist',
        description: 'A magical story about following your dreams',
        price: 199.99,
        compare_at_price: 249.99,
        category: 'Fiction',
        author: 'Paulo Coelho',
        publisher: 'HarperCollins',
        isbn: '9780062315007',
        language: 'English',
        pages: 163,
        weight: 0.3,
        stock_quantity: 75,
        low_stock_threshold: 10,
        featured: true,
        status: 'published',
        image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        tags: ['fiction', 'philosophy', 'dreams', 'adventure']
      },
      {
        title: 'Mathematics for Class 10',
        description: 'Comprehensive mathematics textbook for grade 10 students',
        price: 349.99,
        compare_at_price: 449.99,
        category: 'Educational',
        author: 'R.D. Sharma',
        publisher: 'Dhanpat Rai Publications',
        isbn: '9788177091892',
        language: 'English',
        pages: 800,
        weight: 1.2,
        stock_quantity: 40,
        low_stock_threshold: 5,
        featured: false,
        status: 'published',
        image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
        tags: ['mathematics', 'education', 'textbook', 'class-10']
      },
      {
        title: 'Islamic History and Civilization',
        description: 'Comprehensive guide to Islamic history and contributions to civilization',
        price: 449.99,
        compare_at_price: 599.99,
        category: 'Islamic Books',
        author: 'Dr. Abdul Hamid Siddiqui',
        publisher: 'Islamic Publications',
        isbn: '9781234567890',
        language: 'English',
        pages: 500,
        weight: 0.9,
        stock_quantity: 25,
        low_stock_threshold: 3,
        featured: false,
        status: 'published',
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        tags: ['history', 'islamic', 'civilization', 'culture']
      }
    ],
    blog_categories: [
      {
        name: 'Islamic Teachings',
        slug: 'islamic-teachings',
        description: 'Articles about Islamic teachings and spirituality'
      },
      {
        name: 'Book Reviews',
        slug: 'book-reviews',
        description: 'Reviews and recommendations of books'
      },
      {
        name: 'Author Interviews',
        slug: 'author-interviews',
        description: 'Interviews with authors and publishers'
      }
    ],
    blog_posts: [
      {
        title: 'The Importance of Reading in Islam',
        slug: 'importance-of-reading-in-islam',
        excerpt: 'Discover how Islam emphasizes the importance of knowledge and reading',
        content: 'Islam places great emphasis on knowledge and learning. The first revelation to Prophet Muhammad (PBUH) was "Read in the name of your Lord who created." This article explores the significance of reading and seeking knowledge in Islamic tradition.',
        category: 'Islamic Teachings',
        author: 'Admin',
        featured_image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
        status: 'published',
        views: 150,
        read_time: 5,
        tags: ['reading', 'islam', 'knowledge', 'education']
      },
      {
        title: 'Top 10 Islamic Books Every Muslim Should Read',
        slug: 'top-10-islamic-books-every-muslim-should-read',
        excerpt: 'A curated list of essential Islamic books for spiritual growth',
        content: 'Here are ten essential Islamic books that every Muslim should consider reading for spiritual growth and understanding of the faith. From classical texts to contemporary works, these books offer valuable insights.',
        category: 'Book Reviews',
        author: 'Admin',
        featured_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
        status: 'published',
        views: 320,
        read_time: 8,
        tags: ['books', 'islamic', 'recommendations', 'spirituality']
      }
    ]
  };

  let createdCount = 0;

  // Create categories
  for (const category of sampleData.categories) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(category)
      });

      if (response.ok || response.status === 409) { // 409 = conflict (already exists)
        console.log(`  ✅ Category: ${category.name}`);
        createdCount++;
      } else {
        console.log(`  ❌ Failed to create category ${category.name}: ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ Error creating category ${category.name}:`, error.message);
    }
  }

  // Create products
  for (const product of sampleData.products) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(product)
      });

      if (response.ok || response.status === 409) {
        console.log(`  ✅ Product: ${product.title}`);
        createdCount++;
      } else {
        console.log(`  ❌ Failed to create product ${product.title}: ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ Error creating product ${product.title}:`, error.message);
    }
  }

  // Create blog categories
  for (const blogCategory of sampleData.blog_categories) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/blog_categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(blogCategory)
      });

      if (response.ok || response.status === 409) {
        console.log(`  ✅ Blog Category: ${blogCategory.name}`);
        createdCount++;
      } else {
        console.log(`  ❌ Failed to create blog category ${blogCategory.name}: ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ Error creating blog category ${blogCategory.name}:`, error.message);
    }
  }

  // Create blog posts
  for (const blogPost of sampleData.blog_posts) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(blogPost)
      });

      if (response.ok || response.status === 409) {
        console.log(`  ✅ Blog Post: ${blogPost.title}`);
        createdCount++;
      } else {
        console.log(`  ❌ Failed to create blog post ${blogPost.title}: ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ Error creating blog post ${blogPost.title}:`, error.message);
    }
  }

  console.log(`\n📝 Created ${createdCount} sample data entries`);
  return createdCount;
}

async function main() {
  console.log('🚀 Starting Supabase Migration and Verification\n');

  // Step 1: Fix hardcoded URLs
  const fixedFiles = fixHardcodedUrls();

  // Step 2: Verify connection
  const connectionOk = await verifySupabaseConnection();
  if (!connectionOk) {
    console.log('\n❌ Cannot proceed without Supabase connection');
    process.exit(1);
  }

  // Step 3: Verify schema
  const schemaOk = await verifyDatabaseSchema();
  if (!schemaOk) {
    console.log('\n⚠️  Some tables are missing. Please run the database migrations first.');
  }

  // Step 4: Create sample data
  if (schemaOk) {
    await createSampleData();
  }

  console.log('\n✅ Supabase migration and verification complete!');
  
  if (fixedFiles > 0) {
    console.log('\n📝 Next steps:');
    console.log('1. Restart your development server');
    console.log('2. Clear browser cache');
    console.log('3. Test the application features');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  verifySupabaseConnection,
  verifyDatabaseSchema,
  fixHardcodedUrls,
  createSampleData
};
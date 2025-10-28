#!/usr/bin/env node

/**
 * Supabase Setup and Verification Tool
 * 
 * This script helps set up and verify Supabase integration
 */

const fs = require('fs');
const path = require('path');

// Configuration from environment
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://tyjnywhsynuwgclpehtx.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5am55d2hzeW51d2djbHBlaHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTAwODMsImV4cCI6MjA3Njk4NjA4M30.opDu5zS7aQh17B-Mf7awqNo4DayPZx_fA4e3-SDXzqw';

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log(`URL: ${SUPABASE_URL}`);
  
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
      console.error('❌ Connection failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

async function checkTables() {
  console.log('\n🔍 Checking database tables...');
  
  const requiredTables = [
    'categories', 'products', 'profiles', 'orders', 'order_items',
    'reviews', 'blog_posts', 'blog_categories', 'promo_codes', 'addresses'
  ];

  const results = {};
  
  for (const table of requiredTables) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });

      if (response.ok) {
        console.log(`  ✅ ${table}`);
        results[table] = 'exists';
      } else if (response.status === 404) {
        console.log(`  ❌ ${table} (missing)`);
        results[table] = 'missing';
      } else {
        console.log(`  ⚠️  ${table} (status: ${response.status})`);
        results[table] = 'error';
      }
    } catch (error) {
      console.log(`  ❌ ${table} (error: ${error.message})`);
      results[table] = 'error';
    }
  }

  return results;
}

async function checkSampleData() {
  console.log('\n🔍 Checking sample data...');
  
  const dataChecks = [
    { table: 'categories', name: 'Categories' },
    { table: 'products', name: 'Products' },
    { table: 'blog_categories', name: 'Blog Categories' },
    { table: 'blog_posts', name: 'Blog Posts' },
    { table: 'promo_codes', name: 'Promo Codes' }
  ];

  const results = {};

  for (const check of dataChecks) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${check.table}?select=count`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'count=exact'
        }
      });

      if (response.ok) {
        const count = response.headers.get('content-range')?.split('/')[1] || '0';
        console.log(`  ✅ ${check.name}: ${count} records`);
        results[check.table] = parseInt(count);
      } else {
        console.log(`  ❌ ${check.name}: Error ${response.status}`);
        results[check.table] = 0;
      }
    } catch (error) {
      console.log(`  ❌ ${check.name}: ${error.message}`);
      results[check.table] = 0;
    }
  }

  return results;
}

async function createSampleData() {
  console.log('\n📝 Creating sample data...');

  // Sample categories
  const categories = [
    {
      name: 'Islamic Books',
      slug: 'islamic-books',
      description: 'Books on Islamic teachings and spirituality',
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      is_active: true,
      sort_order: 1
    },
    {
      name: 'Fiction',
      slug: 'fiction',
      description: 'Fictional stories and novels',
      image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
      is_active: true,
      sort_order: 2
    },
    {
      name: 'Educational',
      slug: 'educational',
      description: 'Educational and academic books',
      image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
      is_active: true,
      sort_order: 3
    }
  ];

  // Create categories
  for (const category of categories) {
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

      if (response.ok || response.status === 409) {
        console.log(`  ✅ Category: ${category.name}`);
      } else {
        console.log(`  ❌ Failed to create category ${category.name}: ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ Error creating category ${category.name}: ${error.message}`);
    }
  }

  // Sample products
  const products = [
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
      featured: true,
      status: 'published',
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      tags: ['biography', 'prophet', 'islamic', 'history']
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
      featured: true,
      status: 'published',
      image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
      tags: ['fiction', 'philosophy', 'dreams']
    },
    {
      title: 'Mathematics for Class 10',
      description: 'Comprehensive mathematics textbook for grade 10',
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
      featured: false,
      status: 'published',
      image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
      tags: ['mathematics', 'education', 'textbook']
    }
  ];

  // Create products
  for (const product of products) {
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
      } else {
        console.log(`  ❌ Failed to create product ${product.title}: ${response.status}`);
      }
    } catch (error) {
      console.log(`  ❌ Error creating product ${product.title}: ${error.message}`);
    }
  }

  console.log('\n✅ Sample data creation completed');
}

function generateSetupInstructions(tableResults, dataResults) {
  console.log('\n📋 Setup Instructions:');
  
  const missingTables = Object.entries(tableResults)
    .filter(([table, status]) => status === 'missing')
    .map(([table]) => table);

  if (missingTables.length > 0) {
    console.log('\n❌ Missing Tables:');
    missingTables.forEach(table => console.log(`  - ${table}`));
    console.log('\n🔧 To create missing tables:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the schema from: supabase/migrations/001_initial_schema.sql');
    console.log('4. Run the seed data from: supabase/seed.sql');
  }

  const emptyTables = Object.entries(dataResults)
    .filter(([table, count]) => count === 0)
    .map(([table]) => table);

  if (emptyTables.length > 0) {
    console.log('\n📝 Empty Tables (need sample data):');
    emptyTables.forEach(table => console.log(`  - ${table}`));
    console.log('\n💡 Run this script with --create-data flag to populate sample data');
  }

  if (missingTables.length === 0 && emptyTables.length === 0) {
    console.log('\n🎉 Everything looks good! Your Supabase setup is complete.');
  }
}

async function main() {
  console.log('🚀 Supabase Setup and Verification Tool\n');

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Cannot proceed without Supabase connection');
    console.log('💡 Check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
  }

  // Check tables
  const tableResults = await checkTables();
  
  // Check sample data
  const dataResults = await checkSampleData();

  // Create sample data if requested
  if (process.argv.includes('--create-data')) {
    await createSampleData();
    // Re-check data after creation
    await checkSampleData();
  }

  // Generate setup instructions
  generateSetupInstructions(tableResults, dataResults);

  console.log('\n✅ Verification complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testConnection,
  checkTables,
  checkSampleData,
  createSampleData
};
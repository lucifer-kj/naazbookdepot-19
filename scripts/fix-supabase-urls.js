#!/usr/bin/env node

/**
 * Script to fix hardcoded Supabase URLs in the codebase
 */

const fs = require('fs');
const path = require('path');

const OLD_URL = 'ihxtvfuqodvodrutvvcp.supabase.co';
const NEW_URL = 'tyjnywhsynuwgclpehtx.supabase.co';

const filesToFix = [
  'src/pages/UpiPayment.tsx'
];

function fixFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(new RegExp(OLD_URL, 'g'), NEW_URL);
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Fixed URLs in: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed in: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Fixing hardcoded Supabase URLs...\n');
  
  let fixedCount = 0;
  
  for (const file of filesToFix) {
    if (fixFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n✨ Fixed ${fixedCount} file(s)`);
  
  if (fixedCount > 0) {
    console.log('\n📝 Next steps:');
    console.log('1. Restart your development server');
    console.log('2. Clear browser cache');
    console.log('3. Check that all API calls are working');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixFile };
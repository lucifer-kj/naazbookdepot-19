#!/usr/bin/env node

/**
 * Test Runner Script
 * 
 * This script provides a simple way to run different types of tests
 * and verify the testing infrastructure is working correctly.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n🔄 ${description}...`, 'blue');
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    log(`✅ ${description} completed successfully`, 'green');
    return { success: true, output };
  } catch (error) {
    log(`❌ ${description} failed:`, 'red');
    log(error.message, 'red');
    return { success: false, error: error.message };
  }
}

function checkTestFiles() {
  log('\n📋 Checking test files...', 'blue');
  
  const testFiles = [
    'src/lib/validation/__tests__/schemas.test.ts',
    'src/lib/services/__tests__/sanitizationService.test.ts',
    'src/lib/services/__tests__/apiErrorHandler.test.ts',
    'src/lib/hooks/__tests__/useCart.integration.test.tsx',
    'src/lib/hooks/__tests__/useAuth.integration.test.tsx',
    'src/lib/hooks/__tests__/useProducts.integration.test.tsx',
    'src/components/__tests__/CartIntegration.test.tsx',
    'e2e/auth.spec.ts',
    'e2e/shopping.spec.ts',
    'e2e/cart.spec.ts',
    'e2e/checkout.spec.ts',
    'e2e/admin.spec.ts',
    'e2e/cross-browser.spec.ts'
  ];
  
  const missingFiles = testFiles.filter(file => !existsSync(file));
  
  if (missingFiles.length === 0) {
    log('✅ All test files are present', 'green');
    return true;
  } else {
    log('❌ Missing test files:', 'red');
    missingFiles.forEach(file => log(`  - ${file}`, 'red'));
    return false;
  }
}

function checkTestConfig() {
  log('\n⚙️ Checking test configuration...', 'blue');
  
  const configFiles = [
    'vitest.config.ts',
    'playwright.config.ts',
    'src/test/setup.ts',
    'src/test/utils.tsx'
  ];
  
  const missingConfigs = configFiles.filter(file => !existsSync(file));
  
  if (missingConfigs.length === 0) {
    log('✅ All configuration files are present', 'green');
    return true;
  } else {
    log('❌ Missing configuration files:', 'red');
    missingConfigs.forEach(file => log(`  - ${file}`, 'red'));
    return false;
  }
}

function main() {
  log('🧪 Test Infrastructure Verification', 'blue');
  log('=====================================', 'blue');
  
  // Check if test files exist
  const filesOk = checkTestFiles();
  const configOk = checkTestConfig();
  
  if (!filesOk || !configOk) {
    log('\n❌ Test infrastructure is incomplete', 'red');
    process.exit(1);
  }
  
  // Run unit tests
  const unitTests = runCommand('npx vitest run --reporter=basic', 'Running unit tests');
  
  // Check if Playwright is installed
  log('\n🎭 Checking Playwright installation...', 'blue');
  const playwrightCheck = runCommand('npx playwright --version', 'Checking Playwright version');
  
  if (playwrightCheck.success) {
    log('✅ Playwright is installed', 'green');
    
    // Note: We don't run E2E tests here as they require the dev server to be running
    log('\n📝 E2E tests are configured but not run automatically', 'yellow');
    log('   To run E2E tests:', 'yellow');
    log('   1. Start the dev server: npm run dev', 'yellow');
    log('   2. In another terminal: npm run test:e2e', 'yellow');
  } else {
    log('❌ Playwright installation issue', 'red');
  }
  
  // Summary
  log('\n📊 Test Infrastructure Summary:', 'blue');
  log('===============================', 'blue');
  
  if (unitTests.success) {
    log('✅ Unit tests: Working', 'green');
  } else {
    log('❌ Unit tests: Issues found', 'red');
  }
  
  if (playwrightCheck.success) {
    log('✅ E2E tests: Configured', 'green');
  } else {
    log('❌ E2E tests: Configuration issues', 'red');
  }
  
  log('\n🎯 Available test commands:', 'blue');
  log('  npm run test              - Run unit tests', 'blue');
  log('  npm run test:watch        - Run unit tests in watch mode', 'blue');
  log('  npm run test:coverage     - Run unit tests with coverage', 'blue');
  log('  npm run test:integration  - Run integration tests', 'blue');
  log('  npm run test:e2e          - Run E2E tests (requires dev server)', 'blue');
  log('  npm run test:e2e:ui       - Run E2E tests with UI', 'blue');
  log('  npm run test:all          - Run all tests', 'blue');
  
  const overallSuccess = unitTests.success && playwrightCheck.success;
  
  if (overallSuccess) {
    log('\n🎉 Test infrastructure is ready!', 'green');
    process.exit(0);
  } else {
    log('\n⚠️ Test infrastructure has some issues', 'yellow');
    process.exit(1);
  }
}

main();
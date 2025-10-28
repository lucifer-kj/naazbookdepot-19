#!/usr/bin/env node

/**
 * Environment Setup Script
 * 
 * This script helps set up environment variables for different environments
 * and validates that all required variables are present.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const environments = {
  development: '.env.example',
  production: '.env.production.example',
  local: '.env.local.example'
};

const requiredVars = {
  core: [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_API_BASE_URL'
  ],
  payment: [
    'VITE_PAYPAL_CLIENT_ID',
    'VITE_PAYU_MERCHANT_KEY'
  ],
  monitoring: [
    'VITE_SENTRY_DSN'
  ]
};

async function copyEnvFile(source, target) {
  try {
    const content = fs.readFileSync(source, 'utf8');
    fs.writeFileSync(target, content);
    console.log(`✅ Created ${target} from ${source}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to copy ${source} to ${target}:`, error.message);
    return false;
  }
}

async function validateEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${filePath} does not exist`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const envVars = {};

  // Parse environment variables
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      envVars[key] = value;
    }
  });

  console.log(`\n📋 Validating ${filePath}:`);
  
  let allValid = true;
  
  // Check core variables
  console.log('\n🔧 Core Variables:');
  requiredVars.core.forEach(varName => {
    const value = envVars[varName];
    if (!value || value.includes('your_') || value.includes('_here')) {
      console.log(`  ❌ ${varName}: Missing or placeholder value`);
      allValid = false;
    } else {
      console.log(`  ✅ ${varName}: Configured`);
    }
  });

  // Check payment variables
  console.log('\n💳 Payment Variables:');
  requiredVars.payment.forEach(varName => {
    const value = envVars[varName];
    if (!value || value.includes('your_') || value.includes('_here')) {
      console.log(`  ⚠️  ${varName}: Missing or placeholder value (optional for development)`);
    } else {
      console.log(`  ✅ ${varName}: Configured`);
    }
  });

  // Check monitoring variables
  console.log('\n📊 Monitoring Variables:');
  requiredVars.monitoring.forEach(varName => {
    const value = envVars[varName];
    if (!value || value.includes('your_') || value.includes('_here')) {
      console.log(`  ⚠️  ${varName}: Missing or placeholder value (optional for development)`);
    } else {
      console.log(`  ✅ ${varName}: Configured`);
    }
  });

  return allValid;
}

async function generateSecureKeys() {
  console.log('\n🔐 Generating secure keys...');
  
  const crypto = require('crypto');
  
  const keys = {
    jwt_secret: crypto.randomBytes(64).toString('hex'),
    encryption_key: crypto.randomBytes(32).toString('hex'),
    session_secret: crypto.randomBytes(32).toString('hex')
  };

  console.log('\n📝 Generated secure keys (add these to your .env file):');
  Object.entries(keys).forEach(([key, value]) => {
    console.log(`VITE_${key.toUpperCase()}=${value}`);
  });

  return keys;
}

async function setupEnvironment() {
  console.log('🚀 Environment Setup Wizard\n');

  // Ask which environment to set up
  console.log('Available environments:');
  Object.keys(environments).forEach((env, index) => {
    console.log(`  ${index + 1}. ${env}`);
  });

  const envChoice = await question('\nWhich environment would you like to set up? (1-3): ');
  const envNames = Object.keys(environments);
  const selectedEnv = envNames[parseInt(envChoice) - 1];

  if (!selectedEnv) {
    console.log('❌ Invalid choice');
    rl.close();
    return;
  }

  const sourceFile = environments[selectedEnv];
  const targetFile = selectedEnv === 'local' ? '.env.local' : '.env';

  console.log(`\n📁 Setting up ${selectedEnv} environment...`);

  // Check if target file exists
  if (fs.existsSync(targetFile)) {
    const overwrite = await question(`${targetFile} already exists. Overwrite? (y/N): `);
    if (overwrite.toLowerCase() !== 'y') {
      console.log('❌ Setup cancelled');
      rl.close();
      return;
    }
  }

  // Copy environment file
  const success = await copyEnvFile(sourceFile, targetFile);
  if (!success) {
    rl.close();
    return;
  }

  // Validate the created file
  await validateEnvFile(targetFile);

  // Ask if user wants to generate secure keys
  const generateKeys = await question('\nWould you like to generate secure keys? (y/N): ');
  if (generateKeys.toLowerCase() === 'y') {
    await generateSecureKeys();
  }

  console.log(`\n✅ Environment setup complete!`);
  console.log(`\n📝 Next steps:`);
  console.log(`1. Edit ${targetFile} and replace placeholder values with your actual configuration`);
  console.log(`2. Never commit .env files to version control`);
  console.log(`3. Run 'npm run validate-env' to validate your configuration`);
  
  rl.close();
}

async function validateAllEnvFiles() {
  console.log('🔍 Validating all environment files...\n');

  const envFiles = ['.env', '.env.local', '.env.production'];
  let hasValidEnv = false;

  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      const isValid = await validateEnvFile(file);
      if (isValid) hasValidEnv = true;
    }
  }

  if (!hasValidEnv) {
    console.log('\n❌ No valid environment configuration found!');
    console.log('Run this script without arguments to set up your environment.');
    process.exit(1);
  } else {
    console.log('\n✅ Environment validation complete!');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--validate')) {
    await validateAllEnvFiles();
  } else {
    await setupEnvironment();
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  validateEnvFile,
  copyEnvFile,
  generateSecureKeys
};
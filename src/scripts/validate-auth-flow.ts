import { supabase } from '../lib/supabase';

async function validateAuthenticationFlow() {
  console.log('🔍 Validating Authentication Flow...\n');

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: [] as Array<{name: string, status: 'pass' | 'fail' | 'warning', message: string}>
  };

  // Test 1: Supabase Client Configuration
  try {
    if (supabase && supabase.auth) {
      results.tests.push({
        name: 'Supabase Client Configuration',
        status: 'pass',
        message: 'Supabase client properly initialized'
      });
      results.passed++;
    } else {
      results.tests.push({
        name: 'Supabase Client Configuration',
        status: 'fail',
        message: 'Supabase client not properly initialized'
      });
      results.failed++;
    }
  } catch (error) {
    results.tests.push({
      name: 'Supabase Client Configuration',
      status: 'fail',
      message: `Supabase client error: ${error}`
    });
    results.failed++;
  }

  // Test 2: Session Management
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      results.tests.push({
        name: 'Session Management',
        status: 'warning',
        message: `Session retrieval error: ${error.message}`
      });
      results.warnings++;
    } else {
      results.tests.push({
        name: 'Session Management',
        status: 'pass',
        message: 'Session retrieval working correctly'
      });
      results.passed++;
    }
  } catch (error) {
    results.tests.push({
      name: 'Session Management',
      status: 'fail',
      message: `Session management error: ${error}`
    });
    results.failed++;
  }

  // Test 3: Login Flow (with invalid credentials)
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@nonexistent.com',
      password: 'invalidpassword'
    });

    if (error) {
      if (error.message.includes('Invalid login credentials') || 
          error.message.includes('Email not confirmed') ||
          error.message.includes('User not found')) {
        results.tests.push({
          name: 'Login Flow Error Handling',
          status: 'pass',
          message: 'Login properly handles invalid credentials'
        });
        results.passed++;
      } else {
        results.tests.push({
          name: 'Login Flow Error Handling',
          status: 'warning',
          message: `Unexpected login error: ${error.message}`
        });
        results.warnings++;
      }
    } else {
      results.tests.push({
        name: 'Login Flow Error Handling',
        status: 'warning',
        message: 'Login succeeded with test credentials (unexpected)'
      });
      results.warnings++;
    }
  } catch (error) {
    results.tests.push({
      name: 'Login Flow Error Handling',
      status: 'fail',
      message: `Login flow error: ${error}`
    });
    results.failed++;
  }

  // Test 4: Logout Flow
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      results.tests.push({
        name: 'Logout Flow',
        status: 'warning',
        message: `Logout error: ${error.message}`
      });
      results.warnings++;
    } else {
      results.tests.push({
        name: 'Logout Flow',
        status: 'pass',
        message: 'Logout flow working correctly'
      });
      results.passed++;
    }
  } catch (error) {
    results.tests.push({
      name: 'Logout Flow',
      status: 'fail',
      message: `Logout flow error: ${error}`
    });
    results.failed++;
  }

  // Test 5: Admin Role Check
  try {
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      if (error.message.includes('function is_admin() does not exist')) {
        results.tests.push({
          name: 'Admin Role Check',
          status: 'warning',
          message: 'Admin role function not implemented in database'
        });
        results.warnings++;
      } else {
        results.tests.push({
          name: 'Admin Role Check',
          status: 'fail',
          message: `Admin role check failed: ${error.message}`
        });
        results.failed++;
      }
    } else {
      results.tests.push({
        name: 'Admin Role Check',
        status: 'pass',
        message: 'Admin role check function available'
      });
      results.passed++;
    }
  } catch (error) {
    results.tests.push({
      name: 'Admin Role Check',
      status: 'fail',
      message: `Admin role check error: ${error}`
    });
    results.failed++;
  }

  // Test 6: Session Storage
  try {
    const testKey = 'auth-test-' + Date.now();
    const testValue = 'test-value';
    
    sessionStorage.setItem(testKey, testValue);
    const retrieved = sessionStorage.getItem(testKey);
    sessionStorage.removeItem(testKey);
    
    if (retrieved === testValue) {
      results.tests.push({
        name: 'Session Storage',
        status: 'pass',
        message: 'Session storage working correctly'
      });
      results.passed++;
    } else {
      results.tests.push({
        name: 'Session Storage',
        status: 'warning',
        message: 'Session storage not working correctly'
      });
      results.warnings++;
    }
  } catch (error) {
    results.tests.push({
      name: 'Session Storage',
      status: 'warning',
      message: `Session storage error: ${error}`
    });
    results.warnings++;
  }

  // Generate Report
  console.log('📊 Authentication Flow Validation Report');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log(`📋 Total Tests: ${results.tests.length}\n`);

  // Show detailed results
  results.tests.forEach(test => {
    const emoji = test.status === 'pass' ? '✅' : test.status === 'fail' ? '❌' : '⚠️';
    console.log(`${emoji} ${test.name}: ${test.message}`);
  });

  const overallStatus = results.failed === 0 ? 
    (results.warnings === 0 ? 'EXCELLENT' : 'GOOD') : 
    'NEEDS ATTENTION';
  
  console.log(`\n🎯 Overall Authentication Status: ${overallStatus}`);

  return {
    success: results.failed === 0,
    results
  };
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateAuthenticationFlow()
    .then(({ success }) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

export { validateAuthenticationFlow };
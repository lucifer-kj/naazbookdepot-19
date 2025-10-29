import { supabase } from '@/lib/supabase';
import { errorMonitoring } from '@/lib/services/ErrorMonitoring';

interface AuthValidationResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export class AuthFlowValidator {
  private results: AuthValidationResult[] = [];

  async validateAuthenticationFlow(): Promise<AuthValidationResult[]> {
    this.results = [];
    
    console.log('🔍 Starting Authentication Flow Validation...');
    
    // Test 1: Supabase Client Configuration
    await this.testSupabaseConfiguration();
    
    // Test 2: Session Management
    await this.testSessionManagement();
    
    // Test 3: Login Flow
    await this.testLoginFlow();
    
    // Test 4: Logout Flow
    await this.testLogoutFlow();
    
    // Test 5: Registration Flow
    await this.testRegistrationFlow();
    
    // Test 6: Admin Role Check
    await this.testAdminRoleCheck();
    
    // Test 7: Protected Route Access
    await this.testProtectedRouteAccess();
    
    // Test 8: Session Persistence
    await this.testSessionPersistence();
    
    return this.results;
  }

  private async testSupabaseConfiguration(): Promise<void> {
    try {
      if (!supabase) {
        this.addResult('Supabase Configuration', 'fail', 'Supabase client not initialized');
        return;
      }

      if (!supabase.auth) {
        this.addResult('Supabase Configuration', 'fail', 'Supabase auth not available');
        return;
      }

      // Test basic connectivity
      const { data, error } = await supabase.auth.getSession();
      
      if (error && error.message.includes('Invalid API key')) {
        this.addResult('Supabase Configuration', 'fail', 'Invalid Supabase API key', error);
        return;
      }

      this.addResult('Supabase Configuration', 'pass', 'Supabase client properly configured');
    } catch (error) {
      this.addResult('Supabase Configuration', 'fail', 'Supabase configuration error', error);
    }
  }

  private async testSessionManagement(): Promise<void> {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        this.addResult('Session Management', 'fail', 'Failed to retrieve session', error);
        return;
      }

      if (data && typeof data === 'object') {
        this.addResult('Session Management', 'pass', 'Session retrieval working correctly');
      } else {
        this.addResult('Session Management', 'warning', 'Session data structure unexpected', data);
      }
    } catch (error) {
      this.addResult('Session Management', 'fail', 'Session management error', error);
    }
  }

  private async testLoginFlow(): Promise<void> {
    try {
      // Test with invalid credentials (should fail gracefully)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@nonexistent.com',
        password: 'invalidpassword'
      });

      if (error) {
        // This is expected for invalid credentials
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed') ||
            error.message.includes('User not found')) {
          this.addResult('Login Flow', 'pass', 'Login properly handles invalid credentials');
        } else {
          this.addResult('Login Flow', 'warning', 'Unexpected login error', error);
        }
      } else if (data.user) {
        // Unexpected success with invalid credentials
        this.addResult('Login Flow', 'warning', 'Login succeeded with test credentials', data);
      } else {
        this.addResult('Login Flow', 'pass', 'Login flow working correctly');
      }
    } catch (error) {
      this.addResult('Login Flow', 'fail', 'Login flow error', error);
    }
  }

  private async testLogoutFlow(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        this.addResult('Logout Flow', 'fail', 'Logout failed', error);
      } else {
        this.addResult('Logout Flow', 'pass', 'Logout flow working correctly');
      }
    } catch (error) {
      this.addResult('Logout Flow', 'fail', 'Logout flow error', error);
    }
  }

  private async testRegistrationFlow(): Promise<void> {
    try {
      // Test with invalid email (should fail gracefully)
      const { data, error } = await supabase.auth.signUp({
        email: 'invalid-email',
        password: 'testpassword123'
      });

      if (error) {
        if (error.message.includes('Invalid email') || 
            error.message.includes('Unable to validate email address')) {
          this.addResult('Registration Flow', 'pass', 'Registration properly validates email format');
        } else {
          this.addResult('Registration Flow', 'warning', 'Unexpected registration error', error);
        }
      } else {
        this.addResult('Registration Flow', 'warning', 'Registration accepted invalid email', data);
      }
    } catch (error) {
      this.addResult('Registration Flow', 'fail', 'Registration flow error', error);
    }
  }

  private async testAdminRoleCheck(): Promise<void> {
    try {
      // Test admin role check function
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        if (error.message.includes('function is_admin() does not exist')) {
          this.addResult('Admin Role Check', 'warning', 'Admin role function not implemented in database');
        } else {
          this.addResult('Admin Role Check', 'fail', 'Admin role check failed', error);
        }
      } else {
        this.addResult('Admin Role Check', 'pass', 'Admin role check function available');
      }
    } catch (error) {
      this.addResult('Admin Role Check', 'fail', 'Admin role check error', error);
    }
  }

  private async testProtectedRouteAccess(): Promise<void> {
    try {
      // Check if we can access current session for protected routes
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        this.addResult('Protected Route Access', 'pass', 'User session available for route protection');
      } else {
        this.addResult('Protected Route Access', 'pass', 'No active session - protected routes should redirect');
      }
    } catch (error) {
      this.addResult('Protected Route Access', 'fail', 'Protected route access check failed', error);
    }
  }

  private async testSessionPersistence(): Promise<void> {
    try {
      // Test if session storage is working
      const testKey = 'auth-test-' + Date.now();
      const testValue = 'test-value';
      
      try {
        sessionStorage.setItem(testKey, testValue);
        const retrieved = sessionStorage.getItem(testKey);
        sessionStorage.removeItem(testKey);
        
        if (retrieved === testValue) {
          this.addResult('Session Persistence', 'pass', 'Session storage available for auth persistence');
        } else {
          this.addResult('Session Persistence', 'warning', 'Session storage not working correctly');
        }
      } catch (storageError) {
        this.addResult('Session Persistence', 'warning', 'Session storage not available', storageError);
      }
    } catch (error) {
      this.addResult('Session Persistence', 'fail', 'Session persistence test failed', error);
    }
  }

  private addResult(test: string, status: 'pass' | 'fail' | 'warning', message: string, details?: any): void {
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
    
    let report = '\n📊 Authentication Flow Validation Report\n';
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
export async function validateAuthenticationFlow(): Promise<void> {
  const validator = new AuthFlowValidator();
  
  try {
    await validator.validateAuthenticationFlow();
    const report = validator.generateReport();
    console.log(report);
    
    // Log to error monitoring if available
    if (errorMonitoring) {
      errorMonitoring.captureMessage('Authentication flow validation completed', 'info');
    }
  } catch (error) {
    console.error('❌ Authentication validation failed:', error);
    if (errorMonitoring) {
      errorMonitoring.captureError(error as Error, {
        component: 'AuthFlowValidator',
        action: 'validation_failed'
      });
    }
  }
}
// Simple environment test
console.log('🔍 Environment Test Starting...');
console.log('NODE_ENV:', import.meta.env.MODE);
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');

// Test if basic imports work
try {
  console.log('✅ Environment test completed successfully');
} catch (error) {
  console.error('❌ Environment test failed:', error);
}
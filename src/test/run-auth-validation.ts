import { validateAuthenticationFlow } from './auth-flow-validation';

// Run authentication validation
console.log('🚀 Starting Authentication Flow Validation...\n');

validateAuthenticationFlow()
  .then(() => {
    console.log('\n✨ Authentication validation completed!');
  })
  .catch((error) => {
    console.error('\n💥 Authentication validation failed:', error);
    process.exit(1);
  });

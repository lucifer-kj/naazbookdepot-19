
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './envCheck'

// Environment validation at startup
import { environmentService } from '@/lib/services/environmentService';
import { configValidator } from '@/lib/utils/configValidator';

// Initialize and validate environment
const envValidation = environmentService.initialize();
const configValidation = configValidator.validateAll();

// Initialize error monitoring
import { errorMonitoring } from '@/lib/services/ErrorMonitoring';
errorMonitoring.initialize();

// Log critical issues in development
if (import.meta.env.DEV && (!envValidation.isValid || !configValidation.isValid)) {
  console.group('🚨 Configuration Issues Detected');
  if (!envValidation.isValid) {
    import('./lib/utils/consoleMigration').then(({ handleValidationError }) => {
      handleValidationError('Environment validation failed', { errors: envValidation.errors });
    });
  }
  if (!configValidation.isValid) {
    import('./lib/utils/consoleMigration').then(({ handleValidationError }) => {
      handleValidationError('Configuration validation failed', { errors: configValidation.errors });
    });
  }
  console.groupEnd();
}

createRoot(document.getElementById("root")!).render(<App />);

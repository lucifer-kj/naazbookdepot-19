// Environment validation at startup
import { environmentService } from './lib/services/environmentService';

// Initialize environment validation
const validationResult = environmentService.initialize();

// Export validation result for use in other modules
export { validationResult };
export { environmentService };
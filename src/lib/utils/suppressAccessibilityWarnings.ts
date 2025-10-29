// Suppress accessibility warnings in production while maintaining functionality
// This should only be used temporarily while fixing accessibility issues

export const suppressAccessibilityWarnings = () => {
  if (import.meta.env.PROD) {
    // Store original console methods
    const originalWarn = console.warn;
    const originalError = console.error;

    // Filter out specific accessibility warnings in production
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      
      // Skip Radix UI accessibility warnings in production
      if (
        message.includes('DialogContent') ||
        message.includes('DialogTitle') ||
        message.includes('aria-describedby') ||
        message.includes('Missing `Description`') ||
        message.includes('screen reader users')
      ) {
        return;
      }
      
      // Log other warnings normally
      originalWarn.apply(console, args);
    };

    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Skip Radix UI accessibility errors in production
      if (
        message.includes('DialogContent') ||
        message.includes('DialogTitle') ||
        message.includes('aria-describedby')
      ) {
        return;
      }
      
      // Log other errors normally
      originalError.apply(console, args);
    };
  }
};

// Restore original console methods (for development)
export const restoreConsole = () => {
  // This would restore original methods if needed
  // Implementation depends on how you want to handle this
};
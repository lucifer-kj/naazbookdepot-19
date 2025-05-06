
// Default Strapi API settings
export const STRAPI_DEFAULT_URL = 'http://localhost:1337';

// Get the configured Strapi URL
export function getStrapiUrl(): string {
  return import.meta.env.VITE_STRAPI_API_URL || STRAPI_DEFAULT_URL;
}

// Get the Strapi media URL (for images)
export function getStrapiMediaUrl(): string {
  const baseUrl = getStrapiUrl();
  return `${baseUrl}`;
}

// Check if we have a valid Strapi config
export function hasStrapiConfig(): boolean {
  return !!import.meta.env.VITE_STRAPI_API_URL;
}

// Log Strapi configuration (for debugging)
export function logStrapiConfig(): void {
  console.log('Strapi Configuration:');
  console.log(`API URL: ${getStrapiUrl()}`);
  console.log(`Is Configured: ${hasStrapiConfig()}`);
}

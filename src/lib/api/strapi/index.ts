
// Export only frontend-related Strapi services
export * from './auth-service';
export * from './product-service';
export * from './category-service';
export * from './media-service';
export * from './data-adapters';
export * from './config';
export { fetchStrapi, normalizeStrapi } from '../strapi-client';

import express from 'express';
import { imageOptimizationMiddleware } from '../middleware/imageOptimization';

const router = express.Router();

// Image optimization endpoint
router.get('/images/*', imageOptimizationMiddleware);

// Cache control for static assets
router.use('/assets', express.static('public', {
  maxAge: '7d',
  setHeaders: (res, path) => {
    // Set cache headers based on file type
    if (path.endsWith('.css') || path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    } else if (path.endsWith('.jpg') || path.endsWith('.png') || path.endsWith('.webp')) {
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 1 week
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
    }
  }
}));

export default router;
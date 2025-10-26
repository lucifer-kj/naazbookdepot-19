import { NextFunction, Request, Response } from 'express';
import sharp from 'sharp';
import path from 'path';
import { promisify } from 'util';
import { createHash } from 'crypto';
import fs from 'fs/promises';

const CACHE_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
}

export const imageOptimizationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const imagePattern = /\.(jpg|jpeg|png|gif|webp)$/i;
  if (!imagePattern.test(req.path)) {
    return next();
  }

  try {
    // Parse query parameters for image processing
    const options: ImageProcessingOptions = {
      width: Number(req.query.width) || undefined,
      height: Number(req.query.height) || undefined,
      quality: Number(req.query.quality) || 80,
      format: (req.query.format as ImageProcessingOptions['format']) || 'webp',
    };

    // Generate cache key based on file path and options
    const cacheKey = createHash('md5')
      .update(`${req.path}-${JSON.stringify(options)}`)
      .digest('hex');

    const cachePath = path.join(process.cwd(), 'cache', 'images', cacheKey);

    // Check if cached version exists
    try {
      const stats = await fs.stat(cachePath);
      const buffer = await fs.readFile(cachePath);

      // Set caching headers
      res.setHeader('Cache-Control', `public, max-age=${CACHE_DURATION}`);
      res.setHeader('Last-Modified', stats.mtime.toUTCString());
      res.setHeader('ETag', `"${cacheKey}"`);
      
      // Check if client cache is still valid
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch === `"${cacheKey}"`) {
        res.status(304).end();
        return;
      }

      res.type(`image/${options.format}`);
      res.send(buffer);
      return;
    } catch (err) {
      // Cache miss, continue to process image
    }

    // Process image
    const imagePath = path.join(process.cwd(), 'public', req.path);
    const image = sharp(imagePath);

    // Apply transformations
    if (options.width || options.height) {
      image.resize(options.width, options.height, {
        fit: 'cover',
        withoutEnlargement: true,
      });
    }

    // Convert to desired format
    switch (options.format) {
      case 'webp':
        image.webp({ quality: options.quality });
        break;
      case 'jpeg':
        image.jpeg({ quality: options.quality });
        break;
      case 'png':
        image.png({ quality: options.quality });
        break;
      case 'avif':
        image.avif({ quality: options.quality });
        break;
    }

    const buffer = await image.toBuffer();

    // Save to cache
    await fs.mkdir(path.dirname(cachePath), { recursive: true });
    await fs.writeFile(cachePath, buffer);

    // Set headers and send response
    res.setHeader('Cache-Control', `public, max-age=${CACHE_DURATION}`);
    res.setHeader('Last-Modified', new Date().toUTCString());
    res.setHeader('ETag', `"${cacheKey}"`);
    res.type(`image/${options.format}`);
    res.send(buffer);
  } catch (error) {
    console.error('Image processing error:', error);
    next(error);
  }
};
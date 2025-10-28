# CDN Setup Guide

This guide explains how to set up different CDN options for your Vite application.

## 🚀 Quick Setup (Supabase Storage - Recommended)

Since you're already using Supabase, this is the easiest option:

1. **Set up Supabase Storage buckets:**
   ```sql
   -- Run this in your Supabase SQL editor
   INSERT INTO storage.buckets (id, name, public) VALUES 
   ('images', 'images', true),
   ('products', 'products', true),
   ('avatars', 'avatars', true);
   ```

2. **Update your .env file:**
   ```bash
   VITE_IMAGE_CDN_URL=https://your-project.supabase.co/storage/v1/object/public
   ```

3. **Set up storage policies (in Supabase Dashboard > Storage > Policies):**
   ```sql
   -- Allow public read access
   CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
   
   -- Allow authenticated users to upload
   CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   ```

## 📋 Other CDN Options

### **Option 1: Cloudinary**

1. **Sign up at [Cloudinary](https://cloudinary.com/)**
2. **Get your cloud name from the dashboard**
3. **Update .env:**
   ```bash
   VITE_IMAGE_CDN_URL=https://res.cloudinary.com/your-cloud-name/image/upload
   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
   VITE_CLOUDINARY_API_KEY=your-api-key
   VITE_CLOUDINARY_API_SECRET=your-api-secret
   ```

### **Option 2: AWS S3 + CloudFront**

1. **Create S3 bucket and CloudFront distribution**
2. **Update .env:**
   ```bash
   VITE_IMAGE_CDN_URL=https://your-distribution.cloudfront.net
   VITE_AWS_BUCKET_NAME=your-bucket-name
   VITE_AWS_REGION=us-east-1
   ```

### **Option 3: Vercel/Netlify (for static images)**

1. **Place images in `public/images/` folder**
2. **Update .env:**
   ```bash
   VITE_IMAGE_CDN_URL=/images
   ```

### **Option 4: Custom CDN (BunnyCDN, KeyCDN, etc.)**

1. **Set up your CDN service**
2. **Update .env:**
   ```bash
   VITE_IMAGE_CDN_URL=https://your-cdn-domain.com
   ```

## 🛠️ Usage Examples

### **Basic Image Usage:**
```tsx
import { OptimizedImage } from '@/components/ui/optimized-image';

function ProductCard({ product }) {
  return (
    <OptimizedImage
      src={product.imageUrl}
      alt={product.title}
      width={300}
      height={300}
      quality={85}
    />
  );
}
```

### **Upload Images:**
```tsx
import { imageService } from '@/lib/services/imageService';

async function handleImageUpload(file: File) {
  const result = await imageService.uploadImage(
    file,
    'product-image',
    {
      folder: 'products',
      maxSize: 5 * 1024 * 1024, // 5MB
    }
  );
  
  if (result.success) {
    console.log('Image uploaded:', result.url);
  }
}
```

### **Get CDN URLs:**
```tsx
import { imageService } from '@/lib/services/imageService';

// Get CDN URL for a file path
const cdnUrl = imageService.getCdnUrl('products/image.jpg');

// Get responsive URLs
const responsiveUrls = imageService.getResponsiveImageUrls(originalUrl);
```

## 🔧 Environment Variables

Add these to your `.env` file based on your chosen CDN:

```bash
# Supabase Storage (Recommended)
VITE_IMAGE_CDN_URL=https://your-project.supabase.co/storage/v1/object/public

# Cloudinary
VITE_IMAGE_CDN_URL=https://res.cloudinary.com/your-cloud-name/image/upload
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name

# AWS CloudFront
VITE_IMAGE_CDN_URL=https://your-distribution.cloudfront.net

# Custom CDN
VITE_IMAGE_CDN_URL=https://your-cdn-domain.com

# File Upload Settings
VITE_MAX_FILE_SIZE=5242880  # 5MB
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

## 🚀 Performance Tips

1. **Use WebP format** for better compression
2. **Implement lazy loading** for images below the fold
3. **Use responsive images** for different screen sizes
4. **Set proper cache headers** (handled automatically with Supabase)
5. **Optimize image sizes** before upload

## 🔒 Security Considerations

1. **Validate file types** on both client and server
2. **Limit file sizes** to prevent abuse
3. **Use signed URLs** for private images
4. **Implement rate limiting** for uploads
5. **Scan uploaded files** for malware (if handling user uploads)

## 📱 Mobile Optimization

The OptimizedImage component automatically handles:
- Responsive image loading
- Different image sizes for different screen sizes
- WebP format support with fallbacks
- Lazy loading for better performance

## 🐛 Troubleshooting

### **Images not loading:**
1. Check if the CDN URL is correct in `.env`
2. Verify CORS settings on your CDN
3. Check browser network tab for 404 errors

### **Slow image loading:**
1. Ensure images are properly optimized
2. Check if CDN is geographically close to users
3. Verify cache headers are set correctly

### **Upload failures:**
1. Check file size limits
2. Verify file type restrictions
3. Check authentication/permissions
4. Review error logs in Sentry
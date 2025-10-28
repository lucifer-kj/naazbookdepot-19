-- Storage Buckets and Policies Setup
-- This file sets up storage buckets and their security policies

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES 
('images', 'images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
('products', 'products', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
('blog', 'blog', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for public read access
CREATE POLICY "Public read access for images" ON storage.objects FOR SELECT USING (
  bucket_id IN ('images', 'products', 'blog')
);

-- Storage policies for authenticated uploads
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND 
  bucket_id IN ('images', 'products', 'blog', 'avatars')
);

-- Storage policies for avatar management
CREATE POLICY "Users can upload own avatars" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own avatars" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Admin policies for all storage operations
CREATE POLICY "Admins can manage all storage objects" ON storage.objects FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- Success message
SELECT 'Storage buckets and policies created successfully!' as message;
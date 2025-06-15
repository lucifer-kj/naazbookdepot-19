
-- First, let's add a parent_id column to categories table to support subcategories
ALTER TABLE categories ADD COLUMN parent_id uuid;
ALTER TABLE categories ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES categories(id);

-- Insert main categories
INSERT INTO categories (id, name, slug, parent_id) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Islamic Books and Educational Materials', 'islamic-books-educational', NULL),
('550e8400-e29b-41d4-a716-446655440002', 'Attars, Scents and Perfumes', 'attars-scents-perfumes', NULL),
('550e8400-e29b-41d4-a716-446655440003', 'Other Essentials', 'other-essentials', NULL);

-- Insert subcategories for Islamic Books and Educational Materials
INSERT INTO categories (id, name, slug, parent_id) VALUES 
('550e8400-e29b-41d4-a716-446655440011', 'Qur''an and Tafsir', 'quran-tafsir', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440012', 'Hadith and Sunnah', 'hadith-sunnah', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440013', 'Islamic History and Biographies', 'islamic-history-biographies', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440014', 'Women and Family', 'women-family', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440015', 'Children''s Islamic Books', 'childrens-islamic-books', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440016', 'Madarsa and School Curriculum', 'madarsa-school-curriculum', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440017', 'Multilingual Books', 'multilingual-books', '550e8400-e29b-41d4-a716-446655440001');

-- Insert subcategories for Attars, Scents and Perfumes
INSERT INTO categories (id, name, slug, parent_id) VALUES 
('550e8400-e29b-41d4-a716-446655440021', 'Attars (Alcohol-free perfume oils)', 'attars-alcohol-free', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440022', 'Perfume Sprays', 'perfume-sprays', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440023', 'Premium Collections', 'premium-collections', '550e8400-e29b-41d4-a716-446655440002');

-- Insert subcategories for Other Essentials
INSERT INTO categories (id, name, slug, parent_id) VALUES 
('550e8400-e29b-41d4-a716-446655440031', 'Rehals, Qur''an stand', 'rehals-quran-stand', '550e8400-e29b-41d4-a716-446655440003');

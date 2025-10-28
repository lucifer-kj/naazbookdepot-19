-- Sample Data for Naaz Book Depot
-- This file populates the database with sample data for testing

-- Insert categories
INSERT INTO categories (name, slug, description, image_url, is_active, sort_order) VALUES
('Islamic Books', 'islamic-books', 'Books on Islamic teachings, spirituality, and history', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', true, 1),
('Fiction', 'fiction', 'Fictional stories, novels, and literature', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', true, 2),
('Educational', 'educational', 'Educational and academic books for students', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400', true, 3),
('Biography', 'biography', 'Biographies and autobiographies of notable personalities', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', true, 4),
('Children Books', 'children-books', 'Books for children and young readers', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400', true, 5),
('History', 'history', 'Historical books and documentaries', 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (
  title, description, price, compare_at_price, category, author, publisher, 
  isbn, language, pages, weight, stock_quantity, featured, status, image_url, tags
) VALUES
-- Islamic Books
(
  'The Sealed Nectar (Ar-Raheeq Al-Makhtum)',
  'A comprehensive biography of Prophet Muhammad (PBUH) that won first prize in the worldwide competition on the biography of the Prophet organized by the Muslim World League.',
  299.99, 399.99, 'Islamic Books', 'Safiur Rahman Mubarakpuri', 'Darussalam',
  '9789960899558', 'English', 624, 0.8, 50, true, 'published',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
  ARRAY['biography', 'prophet', 'islamic', 'history', 'seerah']
),
(
  'The Noble Quran - English Translation',
  'Complete Quran with English translation and detailed commentary by Dr. Muhammad Taqi-ud-Din Al-Hilali and Dr. Muhammad Muhsin Khan.',
  599.99, 799.99, 'Islamic Books', 'Dr. Muhammad Taqi-ud-Din Al-Hilali', 'Darussalam',
  '9789960717456', 'English/Arabic', 1200, 1.5, 30, true, 'published',
  'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400',
  ARRAY['quran', 'translation', 'commentary', 'islamic', 'holy-book']
),
(
  'Fortress of the Muslim (Hisnul Muslim)',
  'A collection of authentic supplications and remembrances from the Quran and Sunnah for daily use.',
  149.99, 199.99, 'Islamic Books', 'Said bin Ali bin Wahf Al-Qahtani', 'Darussalam',
  '9789960892900', 'English/Arabic', 256, 0.3, 75, false, 'published',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  ARRAY['dua', 'supplications', 'islamic', 'daily-prayers', 'remembrance']
),
(
  'Stories of the Prophets',
  'Authentic stories of all the Prophets mentioned in the Quran, compiled from various Islamic sources.',
  399.99, 499.99, 'Islamic Books', 'Ibn Kathir', 'Darussalam',
  '9789960892917', 'English', 512, 0.7, 40, true, 'published',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
  ARRAY['prophets', 'stories', 'islamic', 'history', 'quran']
),

-- Fiction
(
  'The Alchemist',
  'A magical story about following your dreams and listening to your heart. Paulo Coelho''s masterpiece about a young shepherd''s journey.',
  199.99, 249.99, 'Fiction', 'Paulo Coelho', 'HarperCollins',
  '9780062315007', 'English', 163, 0.3, 75, true, 'published',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
  ARRAY['fiction', 'philosophy', 'dreams', 'adventure', 'bestseller']
),
(
  'To Kill a Mockingbird',
  'Harper Lee''s timeless novel about racial injustice and childhood innocence in the American South.',
  249.99, 299.99, 'Fiction', 'Harper Lee', 'J.B. Lippincott & Co.',
  '9780061120084', 'English', 281, 0.4, 60, false, 'published',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
  ARRAY['fiction', 'classic', 'social-justice', 'american-literature']
),
(
  'The Kite Runner',
  'Khaled Hosseini''s powerful debut novel about friendship, betrayal, and redemption set against Afghanistan''s tumultuous history.',
  279.99, 329.99, 'Fiction', 'Khaled Hosseini', 'Riverhead Books',
  '9781594631931', 'English', 372, 0.5, 45, true, 'published',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  ARRAY['fiction', 'afghanistan', 'friendship', 'redemption', 'bestseller']
),

-- Educational
(
  'Mathematics for Class 10 - NCERT',
  'Official NCERT mathematics textbook for class 10 students following the Indian curriculum.',
  149.99, 199.99, 'Educational', 'NCERT', 'NCERT Publications',
  '9788174507525', 'English', 320, 0.6, 100, false, 'published',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
  ARRAY['mathematics', 'education', 'ncert', 'class-10', 'textbook']
),
(
  'Science for Class 9 - NCERT',
  'Comprehensive science textbook covering physics, chemistry, and biology for class 9 students.',
  179.99, 229.99, 'Educational', 'NCERT', 'NCERT Publications',
  '9788174507532', 'English', 280, 0.5, 80, false, 'published',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
  ARRAY['science', 'education', 'ncert', 'class-9', 'physics', 'chemistry', 'biology']
),
(
  'English Grammar and Composition',
  'Complete guide to English grammar with exercises and composition writing techniques.',
  229.99, 279.99, 'Educational', 'Wren & Martin', 'S. Chand Publishing',
  '9788121928311', 'English', 432, 0.7, 65, true, 'published',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',
  ARRAY['english', 'grammar', 'composition', 'education', 'language']
),

-- Biography
(
  'Steve Jobs',
  'The exclusive biography of Steve Jobs by Walter Isaacson, based on extensive interviews with Jobs himself.',
  449.99, 599.99, 'Biography', 'Walter Isaacson', 'Simon & Schuster',
  '9781451648539', 'English', 656, 0.9, 35, true, 'published',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  ARRAY['biography', 'steve-jobs', 'apple', 'technology', 'entrepreneur']
),
(
  'Wings of Fire: An Autobiography',
  'The inspiring autobiography of Dr. A.P.J. Abdul Kalam, India''s former President and renowned scientist.',
  199.99, 249.99, 'Biography', 'A.P.J. Abdul Kalam', 'Universities Press',
  '9788173711466', 'English', 196, 0.3, 70, true, 'published',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
  ARRAY['biography', 'kalam', 'scientist', 'president', 'inspiration', 'indian']
),

-- Children Books
(
  'The Jungle Book',
  'Rudyard Kipling''s classic collection of stories about Mowgli and his adventures in the Indian jungle.',
  179.99, 229.99, 'Children Books', 'Rudyard Kipling', 'Macmillan Children''s Books',
  '9780230770119', 'English', 224, 0.4, 55, false, 'published',
  'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
  ARRAY['children', 'classic', 'adventure', 'animals', 'jungle']
),
(
  'Panchatantra Stories',
  'Traditional Indian folk tales with moral lessons, beautifully illustrated for children.',
  129.99, 169.99, 'Children Books', 'Vishnu Sharma', 'Amar Chitra Katha',
  '9788184820829', 'English', 128, 0.3, 90, true, 'published',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
  ARRAY['children', 'panchatantra', 'moral-stories', 'indian', 'illustrated']
),

-- History
(
  'A Brief History of Time',
  'Stephen Hawking''s groundbreaking work that explores the nature of time, space, and the universe.',
  349.99, 449.99, 'History', 'Stephen Hawking', 'Bantam Books',
  '9780553380163', 'English', 256, 0.4, 40, true, 'published',
  'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400',
  ARRAY['history', 'science', 'physics', 'universe', 'time', 'hawking']
),
(
  'The Discovery of India',
  'Jawaharlal Nehru''s classic work on Indian history, culture, and philosophy written during his imprisonment.',
  299.99, 399.99, 'History', 'Jawaharlal Nehru', 'Oxford University Press',
  '9780195693942', 'English', 642, 0.8, 25, false, 'published',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  ARRAY['history', 'india', 'nehru', 'culture', 'philosophy', 'independence']
)
ON CONFLICT (title) DO NOTHING;

-- Insert blog categories
INSERT INTO blog_categories (name, slug, description) VALUES
('Islamic Teachings', 'islamic-teachings', 'Articles about Islamic teachings, spirituality, and guidance'),
('Book Reviews', 'book-reviews', 'Reviews and recommendations of books across various genres'),
('Author Interviews', 'author-interviews', 'Exclusive interviews with authors and publishers'),
('Reading Tips', 'reading-tips', 'Tips and advice for better reading habits and comprehension'),
('Educational Content', 'educational-content', 'Educational articles and learning resources'),
('News & Updates', 'news-updates', 'Latest news and updates from the book world')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample blog posts
INSERT INTO blog_posts (
  title, slug, excerpt, content, category, author, featured_image, 
  status, views, read_time, tags, published_at
) VALUES
(
  'The Importance of Reading in Islam',
  'importance-of-reading-in-islam',
  'Discover how Islam emphasizes the importance of knowledge and reading, starting from the very first revelation.',
  'Islam places tremendous emphasis on knowledge and learning. The first word revealed to Prophet Muhammad (PBUH) was "Iqra" which means "Read" or "Recite". This divine command highlights the fundamental importance of reading and seeking knowledge in Islam.

The Quran states: "Read in the name of your Lord who created. Created man from a clinging substance. Read, and your Lord is the most Generous. Who taught by the pen. Taught man that which he knew not." (96:1-5)

This article explores the significance of reading and seeking knowledge in Islamic tradition, the rewards promised for those who pursue knowledge, and how reading can strengthen our faith and understanding of the world around us.

Throughout Islamic history, Muslims have been at the forefront of learning and scholarship. The establishment of libraries, universities, and centers of learning in cities like Baghdad, Cordoba, and Cairo demonstrates the Islamic commitment to knowledge and reading.

Today, as Muslims, we should continue this tradition by making reading a regular part of our lives, seeking beneficial knowledge, and sharing what we learn with others.',
  'Islamic Teachings', 'Admin', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
  'published', 245, 6, ARRAY['reading', 'islam', 'knowledge', 'education', 'quran'], NOW() - INTERVAL '5 days'
),
(
  'Top 10 Islamic Books Every Muslim Should Read',
  'top-10-islamic-books-every-muslim-should-read',
  'A curated list of essential Islamic books that provide spiritual guidance and deepen understanding of the faith.',
  'Reading is fundamental to Islamic learning and spiritual growth. Here are ten essential Islamic books that every Muslim should consider reading:

1. **The Noble Quran** - The holy book of Islam, the direct word of Allah
2. **Sahih Al-Bukhari** - The most authentic collection of Hadith
3. **The Sealed Nectar** - Biography of Prophet Muhammad (PBUH)
4. **Fortress of the Muslim** - Collection of authentic supplications
5. **Stories of the Prophets** - Tales of all the Prophets mentioned in the Quran
6. **Riyadh as-Salihin** - Gardens of the Righteous by Imam An-Nawawi
7. **Tafsir Ibn Kathir** - Comprehensive commentary on the Quran
8. **The Purification of the Soul** - Compilation on spiritual purification
9. **In the Footsteps of the Prophet** - Lessons from the life of Muhammad (PBUH)
10. **Don''t Be Sad** - Contemporary Islamic guidance for dealing with life''s challenges

Each of these books offers unique insights into Islamic teachings and can help strengthen your faith and understanding. Start with the Quran and gradually explore these other valuable resources.',
  'Book Reviews', 'Admin', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
  'published', 412, 8, ARRAY['books', 'islamic', 'recommendations', 'spirituality', 'reading-list'], NOW() - INTERVAL '3 days'
),
(
  'How to Develop a Daily Reading Habit',
  'how-to-develop-daily-reading-habit',
  'Practical tips and strategies to build a consistent reading habit that fits into your busy lifestyle.',
  'Developing a daily reading habit can transform your life, expand your knowledge, and provide countless hours of enjoyment. Here are proven strategies to help you build and maintain a consistent reading routine:

**Start Small**
Begin with just 10-15 minutes of reading per day. This small commitment is easier to maintain and helps build the habit gradually.

**Choose the Right Time**
Identify the best time for you to read - whether it''s early morning, during lunch breaks, or before bed. Consistency in timing helps reinforce the habit.

**Create a Reading Environment**
Designate a comfortable, quiet space for reading. Good lighting and minimal distractions are essential for focused reading.

**Set Realistic Goals**
Instead of aiming to read 50 books a year, start with 1-2 books per month. Achievable goals prevent discouragement and maintain motivation.

**Carry a Book Everywhere**
Always have a book or e-reader with you. This allows you to read during unexpected free moments throughout the day.

**Track Your Progress**
Keep a reading journal or use apps to track your reading progress. Seeing your accomplishments motivates continued reading.

**Join Reading Communities**
Connect with other readers through book clubs, online forums, or social media groups. Sharing experiences enhances the reading journey.

Remember, the goal is consistency, not speed. Focus on building the habit first, and the benefits will naturally follow.',
  'Reading Tips', 'Admin', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800',
  'published', 189, 5, ARRAY['reading-habits', 'productivity', 'self-improvement', 'tips', 'lifestyle'], NOW() - INTERVAL '1 day'
),
(
  'The Benefits of Reading Fiction vs Non-Fiction',
  'benefits-reading-fiction-vs-non-fiction',
  'Explore the unique advantages of reading both fiction and non-fiction books for personal and intellectual growth.',
  'Both fiction and non-fiction books offer distinct benefits for readers. Understanding these advantages can help you create a balanced reading diet that maximizes personal growth and enjoyment.

**Benefits of Reading Fiction:**

*Emotional Intelligence*
Fiction helps develop empathy by allowing readers to experience different perspectives and emotions through characters'' journeys.

*Creativity and Imagination*
Fictional stories stimulate creative thinking and imagination, encouraging readers to visualize scenes and scenarios.

*Stress Relief*
Engaging stories provide an escape from daily stresses, offering relaxation and mental rejuvenation.

*Language Skills*
Fiction often features rich, descriptive language that enhances vocabulary and writing skills.

**Benefits of Reading Non-Fiction:**

*Knowledge Acquisition*
Non-fiction books provide factual information, skills, and insights that can be directly applied to real life.

*Critical Thinking*
Analytical and educational content strengthens logical reasoning and critical thinking abilities.

*Professional Development*
Business, self-help, and educational books contribute to career advancement and personal improvement.

*Understanding Reality*
Biographies, history, and science books deepen understanding of the world and human experience.

**The Ideal Balance**
Most avid readers benefit from reading both genres. A common approach is the 70-30 rule: 70% of your reading in your preferred genre and 30% in the other. This ensures you gain the benefits of both while maintaining reading enjoyment.

Consider alternating between fiction and non-fiction books, or dedicate specific times to each genre based on your mood and goals.',
  'Reading Tips', 'Admin', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
  'published', 156, 7, ARRAY['fiction', 'non-fiction', 'reading-benefits', 'personal-growth', 'education'], NOW() - INTERVAL '7 days'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample promo codes
INSERT INTO promo_codes (
  code, description, discount_type, discount_value, minimum_order_value,
  max_usage, valid_from, valid_until, is_active
) VALUES
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10.00, 200.00, 100, NOW(), NOW() + INTERVAL '30 days', true),
('ISLAMIC25', 'Special discount on Islamic books', 'percentage', 25.00, 500.00, 50, NOW(), NOW() + INTERVAL '15 days', true),
('STUDENT15', 'Student discount on educational books', 'percentage', 15.00, 300.00, 200, NOW(), NOW() + INTERVAL '60 days', true),
('BULK50', 'Bulk order discount', 'fixed', 50.00, 1000.00, 25, NOW(), NOW() + INTERVAL '45 days', true),
('RAMADAN20', 'Ramadan special offer', 'percentage', 20.00, 400.00, 75, NOW(), NOW() + INTERVAL '20 days', true)
ON CONFLICT (code) DO NOTHING;

-- Update blog categories post count
UPDATE blog_categories SET post_count = (
  SELECT COUNT(*) FROM blog_posts WHERE blog_posts.category = blog_categories.name
);

-- Insert some sample reviews (these would normally be created by users)
-- Note: This requires actual user IDs, so we'll skip this for now
-- Reviews will be created when users actually use the system

-- Create a sample admin user profile (this would be created through the auth system)
-- Note: This requires an actual auth user ID, so we'll skip this for now

-- Success message
SELECT 'Sample data inserted successfully!' as message;
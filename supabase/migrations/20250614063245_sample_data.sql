-- Insert sample categories
INSERT INTO public.categories (name, slug) VALUES
('Fiction', 'fiction'),
('Non-Fiction', 'non-fiction'),
('Children''s Books', 'children-books'),
('Academic', 'academic'),
('Self-Help', 'self-help');

-- Insert sample products
INSERT INTO public.products (title, slug, description, price, category_id, stock_quantity, is_featured, tags) VALUES
('The Great Adventure', 'the-great-adventure', 'An epic tale of discovery and courage', 29.99, (SELECT id FROM public.categories WHERE slug = 'fiction'), 100, true, ARRAY['adventure', 'fiction']),
('Learn Python Programming', 'learn-python-programming', 'Comprehensive guide to Python programming', 49.99, (SELECT id FROM public.categories WHERE slug = 'academic'), 50, true, ARRAY['programming', 'education']),
('Mindfulness for Beginners', 'mindfulness-for-beginners', 'Start your journey to mindfulness', 19.99, (SELECT id FROM public.categories WHERE slug = 'self-help'), 75, false, ARRAY['mindfulness', 'self-help']),
('The Magic Rainbow', 'the-magic-rainbow', 'A colorful adventure for children', 15.99, (SELECT id FROM public.categories WHERE slug = 'children-books'), 120, true, ARRAY['children', 'adventure']),
('History of Science', 'history-of-science', 'Explore the development of scientific thought', 39.99, (SELECT id FROM public.categories WHERE slug = 'non-fiction'), 30, false, ARRAY['science', 'history']);

-- Insert sample users (password is 'Test@123' hashed with bcrypt)
INSERT INTO public.users (email, password, full_name, role) VALUES
('admin@example.com', '$2a$10$xJ7Yd8kVE5h0F8.IAK8zV.t8Br1G1N8f3g.FB2.4Gb.ZK1xwO5Rji', 'Admin User', 'admin'),
('user@example.com', '$2a$10$xJ7Yd8kVE5h0F8.IAK8zV.t8Br1G1N8f3g.FB2.4Gb.ZK1xwO5Rji', 'Test User', 'user');

-- Insert sample reviews
INSERT INTO public.reviews (product_id, user_id, rating, comment) VALUES
((SELECT id FROM public.products WHERE slug = 'the-great-adventure'), (SELECT id FROM public.users WHERE email = 'user@example.com'), 5, 'Amazing book, couldn''t put it down!'),
((SELECT id FROM public.products WHERE slug = 'learn-python-programming'), (SELECT id FROM public.users WHERE email = 'user@example.com'), 4, 'Very helpful for beginners'),
((SELECT id FROM public.products WHERE slug = 'mindfulness-for-beginners'), (SELECT id FROM public.users WHERE email = 'user@example.com'), 5, 'Changed my life!');
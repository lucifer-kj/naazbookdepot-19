
import { supabase } from '@/integrations/supabase/client';

// Utility functions for database operations
export const dbService = {
  // Products
  async getProducts(filters?: {
    shopType?: string;
    categoryId?: string;
    featured?: boolean;
    limit?: number;
  }) {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_images(*),
        categories(*)
      `)
      .eq('is_active', true);

    if (filters?.shopType) {
      query = query.eq('shop_type', filters.shopType);
    }

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.featured) {
      query = query.eq('is_featured', true);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Categories
  async getCategories(shopType?: string) {
    let query = supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (shopType) {
      query = query.eq('shop_type', shopType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Newsletter
  async subscribeToNewsletter(email: string, name?: string) {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email, name })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Testimonials
  async getFeaturedTestimonials() {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_approved', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Blog posts
  async getBlogPosts(limit?: number) {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
};

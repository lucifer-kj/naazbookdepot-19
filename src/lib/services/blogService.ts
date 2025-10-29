import { supabase } from '../supabase';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  author_id: string;
  published_date: string;
  category: string;
  tags: string[];
  featured_image?: string;
  read_time: number;
  status: 'draft' | 'published' | 'archived';
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  views: number;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  post_count: number;
}

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  averageReadTime: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
}

class BlogService {
  /**
   * Get all blog posts with pagination and filtering
   */
  async getPosts(options: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
    sortBy?: 'created_at' | 'published_date' | 'views' | 'title';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{ posts: BlogPost[]; total: number; hasMore: boolean }> {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        status = 'published',
        search,
        sortBy = 'published_date',
        sortOrder = 'desc'
      } = options;

      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        posts: data || [],
        total: count || 0,
        hasMore: (count || 0) > page * limit
      };
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }
  }

  /**
   * Get a single blog post by slug
   */
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Post not found
        }
        throw error;
      }

      // Increment view count
      await this.incrementViews(data.id);

      return data;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      throw error;
    }
  }

  /**
   * Create a new blog post
   */
  async createPost(postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'views'>): Promise<BlogPost> {
    try {
      // Generate slug from title if not provided
      if (!postData.slug) {
        postData.slug = this.generateSlug(postData.title);
      }

      // Calculate read time if not provided
      if (!postData.read_time) {
        postData.read_time = this.calculateReadTime(postData.content);
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{
          ...postData,
          views: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  }

  /**
   * Update an existing blog post
   */
  async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    try {
      // Recalculate read time if content changed
      if (updates.content) {
        updates.read_time = this.calculateReadTime(updates.content);
      }

      // Update slug if title changed
      if (updates.title && !updates.slug) {
        updates.slug = this.generateSlug(updates.title);
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }
  }

  /**
   * Delete a blog post
   */
  async deletePost(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      throw error;
    }
  }

  /**
   * Get blog categories
   */
  async getCategories(): Promise<BlogCategory[]> {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching blog categories:', error);
      throw error;
    }
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: Omit<BlogCategory, 'id' | 'post_count'>): Promise<BlogCategory> {
    try {
      if (!categoryData.slug) {
        categoryData.slug = this.generateSlug(categoryData.name);
      }

      const { data, error } = await supabase
        .from('blog_categories')
        .insert([{
          ...categoryData,
          post_count: 0
        }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating blog category:', error);
      throw error;
    }
  }

  /**
   * Get blog statistics
   */
  async getBlogStats(): Promise<BlogStats> {
    try {
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('status, category, views, read_time');

      if (error) throw error;

      const totalPosts = posts?.length || 0;
      const publishedPosts = posts?.filter(p => p.status === 'published').length || 0;
      const draftPosts = posts?.filter(p => p.status === 'draft').length || 0;
      const totalViews = posts?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
      const averageReadTime = posts?.length ? 
        posts.reduce((sum, p) => sum + (p.read_time || 0), 0) / posts.length : 0;

      // Calculate top categories
      const categoryCounts: Record<string, number> = {};
      posts?.forEach(p => {
        if (p.category) {
          categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
        }
      });

      const topCategories = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews,
        averageReadTime,
        topCategories
      };
    } catch (error) {
      console.error('Error fetching blog stats:', error);
      throw error;
    }
  }

  /**
   * Increment view count for a post
   */
  private async incrementViews(postId: string): Promise<void> {
    try {
      await supabase.rpc('increment_blog_views', { post_id: postId });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }

  /**
   * Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  /**
   * Calculate estimated read time based on content
   */
  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Search posts with advanced options
   */
  async searchPosts(query: string, options: {
    categories?: string[];
    tags?: string[];
    dateRange?: { start: Date; end: Date };
    minReadTime?: number;
    maxReadTime?: number;
  } = {}): Promise<BlogPost[]> {
    try {
      let supabaseQuery = supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published');

      // Text search
      if (query) {
        supabaseQuery = supabaseQuery.or(
          `title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`
        );
      }

      // Category filter
      if (options.categories && options.categories.length > 0) {
        supabaseQuery = supabaseQuery.in('category', options.categories);
      }

      // Date range filter
      if (options.dateRange) {
        supabaseQuery = supabaseQuery
          .gte('published_date', options.dateRange.start.toISOString())
          .lte('published_date', options.dateRange.end.toISOString());
      }

      // Read time filter
      if (options.minReadTime) {
        supabaseQuery = supabaseQuery.gte('read_time', options.minReadTime);
      }
      if (options.maxReadTime) {
        supabaseQuery = supabaseQuery.lte('read_time', options.maxReadTime);
      }

      supabaseQuery = supabaseQuery.order('published_date', { ascending: false });

      const { data, error } = await supabaseQuery;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error searching blog posts:', error);
      throw error;
    }
  }

  /**
   * Get related posts based on category and tags
   */
  async getRelatedPosts(postId: string, limit: number = 3): Promise<BlogPost[]> {
    try {
      // First get the current post to find its category and tags
      const { data: currentPost, error: currentError } = await supabase
        .from('blog_posts')
        .select('category, tags')
        .eq('id', postId)
        .single();

      if (currentError) throw currentError;

      // Find related posts by category or tags
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .neq('id', postId)
        .or(`category.eq.${currentPost.category},tags.ov.{${currentPost.tags?.join(',') || ''}}`)
        .order('published_date', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching related posts:', error);
      return [];
    }
  }

  /**
   * Generate SEO-optimized meta tags for a post
   */
  generateSEOTags(post: BlogPost): {
    title: string;
    description: string;
    keywords: string[];
    ogTitle: string;
    ogDescription: string;
    ogImage?: string;
  } {
    return {
      title: post.seo_title || `${post.title} | Naaz Books Blog`,
      description: post.seo_description || post.excerpt,
      keywords: post.seo_keywords || post.tags || [],
      ogTitle: post.title,
      ogDescription: post.excerpt,
      ogImage: post.featured_image
    };
  }
}

export const blogService = new BlogService();

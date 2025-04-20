
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PostgrestError } from "@supabase/supabase-js";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  author_name: string | null;
  author_avatar: string | null;
  featured_image_url: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  category_id: string | null;
  tags: string[] | null;
  view_count: number | null;
  created_at: string;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Get all blog posts with optional filters
export const getBlogPosts = async ({
  status,
  category_id,
  search,
  page = 1,
  limit = 10,
}: {
  status?: 'draft' | 'published';
  category_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  let query = supabase
    .from('blog_posts')
    .select('*', { count: 'exact' });

  if (status) {
    query = query.eq('status', status);
  }

  if (category_id) {
    query = query.eq('category_id', category_id);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) throw error;

  return {
    posts: data as BlogPost[],
    total: count || 0,
  };
};

// Get a single blog post by slug
export const getBlogPost = async (slug: string) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;

  // Increment view count
  await supabase.rpc('increment_blog_view_count', { post_id: data.id });

  return data as BlogPost;
};

// Create or update a blog post
export const saveBlogPost = async (post: Partial<BlogPost> & { id?: string }) => {
  if (post.id) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(post)
      .eq('id', post.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(post)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Delete a blog post
export const deleteBlogPost = async (id: string) => {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Get blog categories
export const getBlogCategories = async () => {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as BlogCategory[];
};

// React Query hooks
export const useBlogPosts = (filters: Parameters<typeof getBlogPosts>[0]) => {
  return useQuery({
    queryKey: ['blog-posts', filters],
    queryFn: () => getBlogPosts(filters),
  });
};

export const useBlogPost = (slug: string) => {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => getBlogPost(slug),
    enabled: !!slug,
  });
};

export const useBlogCategories = () => {
  return useQuery({
    queryKey: ['blog-categories'],
    queryFn: getBlogCategories,
  });
};

export const useSaveBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveBlogPost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Blog post saved successfully');
    },
    onError: (error: PostgrestError) => {
      toast.error(`Error saving blog post: ${error.message}`);
    },
  });
};

export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast.success('Blog post deleted successfully');
    },
    onError: (error: PostgrestError) => {
      toast.error(`Error deleting blog post: ${error.message}`);
    },
  });
};

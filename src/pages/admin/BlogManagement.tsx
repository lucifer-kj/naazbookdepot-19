import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Calendar,
  User,
  Tag,
  BarChart3,
  FileText,
  Clock,
  TrendingUp
} from 'lucide-react';
import { blogService, BlogPost, BlogStats } from '@/lib/services/blogService';
import { toast } from 'sonner';

const BlogManagement = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [categories] = useState(['education', 'literature', 'reviews', 'author-interviews', 'reading-tips']);

  const [newPost, setNewPost] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    featured_image: '',
    status: 'draft' as 'draft' | 'published',
    seo_title: '',
    seo_description: '',
    seo_keywords: ''
  });

  const postsPerPage = 10;

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, [fetchPosts]);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const result = await blogService.getPosts({
        page: currentPage,
        limit: postsPerPage,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        search: searchTerm || undefined,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      setPosts(result.posts);
      setTotalPosts(result.total);
    } catch (error) {
      import('../../lib/utils/consoleMigration').then(({ handleApiError }) => {
        handleApiError(error, 'fetch_blog_posts', { page, limit });
      });
      toast.error('Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  }, [currentPage, postsPerPage, selectedCategory, selectedStatus, searchTerm]);

  const fetchStats = async () => {
    try {
      const blogStats = await blogService.getBlogStats();
      setStats(blogStats);
    } catch (error) {
      import('../../lib/utils/consoleMigration').then(({ handleApiError }) => {
        handleApiError(error, 'fetch_blog_stats');
      });
    }
  };

  const handleCreatePost = async () => {
    try {
      if (!newPost.title || !newPost.content || !newPost.category) {
        toast.error('Please fill in all required fields');
        return;
      }

      await blogService.createPost({
        ...newPost,
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        seo_keywords: newPost.seo_keywords.split(',').map(kw => kw.trim()).filter(Boolean),
        author: 'Admin', // In real app, get from auth context
        author_id: 'admin-id',
        published_date: newPost.status === 'published' ? new Date().toISOString() : '',
        slug: '',
        read_time: 0
      });

      toast.success('Blog post created successfully');
      setIsCreateDialogOpen(false);
      resetNewPost();
      fetchPosts();
      fetchStats();
    } catch (error) {
      import('../../lib/utils/consoleMigration').then(({ handleDatabaseError }) => {
        handleDatabaseError(error, 'create_blog_post', { title: newPost.title });
      });
      toast.error('Failed to create blog post');
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;

    try {
      await blogService.updatePost(editingPost.id, {
        ...newPost,
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        seo_keywords: newPost.seo_keywords.split(',').map(kw => kw.trim()).filter(Boolean),
        published_date: newPost.status === 'published' && editingPost.status === 'draft' 
          ? new Date().toISOString() 
          : editingPost.published_date
      });

      toast.success('Blog post updated successfully');
      setEditingPost(null);
      resetNewPost();
      fetchPosts();
      fetchStats();
    } catch (error) {
      import('../../lib/utils/consoleMigration').then(({ handleDatabaseError }) => {
        handleDatabaseError(error, 'update_blog_post', { postId: post.id });
      });
      toast.error('Failed to update blog post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      await blogService.deletePost(postId);
      toast.success('Blog post deleted successfully');
      fetchPosts();
      fetchStats();
    } catch (error) {
      import('../../lib/utils/consoleMigration').then(({ handleDatabaseError }) => {
        handleDatabaseError(error, 'delete_blog_post', { postId: id });
      });
      toast.error('Failed to delete blog post');
    }
  };

  const resetNewPost = () => {
    setNewPost({
      title: '',
      excerpt: '',
      content: '',
      category: '',
      tags: '',
      featured_image: '',
      status: 'draft',
      seo_title: '',
      seo_description: '',
      seo_keywords: ''
    });
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags?.join(', ') || '',
      featured_image: post.featured_image || '',
      status: post.status,
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
      seo_keywords: post.seo_keywords?.join(', ') || ''
    });
    setIsCreateDialogOpen(true);
  };

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-gray-600">Manage your blog posts and content</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetNewPost(); setEditingPost(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Enter post title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newPost.category} onValueChange={(value) => setNewPost({ ...newPost, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={newPost.excerpt}
                  onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                  placeholder="Brief description of the post"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Write your blog post content here..."
                  rows={10}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                <div>
                  <Label htmlFor="featured_image">Featured Image URL</Label>
                  <Input
                    id="featured_image"
                    value={newPost.featured_image}
                    onChange={(e) => setNewPost({ ...newPost, featured_image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {/* SEO Section */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">SEO Settings</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="seo_title">SEO Title</Label>
                    <Input
                      id="seo_title"
                      value={newPost.seo_title}
                      onChange={(e) => setNewPost({ ...newPost, seo_title: e.target.value })}
                      placeholder="SEO optimized title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="seo_description">SEO Description</Label>
                    <Textarea
                      id="seo_description"
                      value={newPost.seo_description}
                      onChange={(e) => setNewPost({ ...newPost, seo_description: e.target.value })}
                      placeholder="SEO meta description"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="seo_keywords">SEO Keywords (comma-separated)</Label>
                    <Input
                      id="seo_keywords"
                      value={newPost.seo_keywords}
                      onChange={(e) => setNewPost({ ...newPost, seo_keywords: e.target.value })}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <Select value={newPost.status} onValueChange={(value: 'draft' | 'published') => setNewPost({ ...newPost, status: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={editingPost ? handleUpdatePost : handleCreatePost}>
                    {editingPost ? 'Update Post' : 'Create Post'}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Posts</p>
                  <p className="text-2xl font-bold">{stats.totalPosts}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-2xl font-bold">{stats.publishedPosts}</p>
                </div>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Read Time</p>
                  <p className="text-2xl font-bold">{Math.round(stats.averageReadTime)}m</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No blog posts found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{post.title}</h3>
                        <Badge className={getStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {post.author}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(post.created_at)}
                        </span>
                        <span className="flex items-center">
                          <Tag className="w-3 h-3 mr-1" />
                          {post.category}
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {post.views} views
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {post.read_time}m read
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(post)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  size="sm"
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogManagement;
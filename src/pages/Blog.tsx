import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Search, Calendar, User, Tag, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  published_date: string;
  category: string;
  tags: string[];
  featured_image?: string;
  read_time: number;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  const categories = ['all', 'education', 'literature', 'reviews', 'author-interviews', 'reading-tips'];

  // Mock blog posts for demonstration
  const mockPosts: BlogPost[] = [
    {
      id: '1',
      title: 'The Art of Speed Reading: Techniques for Better Comprehension',
      excerpt: 'Discover proven techniques to increase your reading speed while maintaining comprehension. Learn from experts and transform your reading habits.',
      content: 'Full article content here...',
      author: 'Dr. Sarah Johnson',
      published_date: '2024-01-15',
      category: 'reading-tips',
      tags: ['reading', 'productivity', 'education'],
      featured_image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80',
      read_time: 5
    },
    {
      id: '2',
      title: 'Top 10 Must-Read Books for Personal Development',
      excerpt: 'A curated list of transformative books that will help you grow personally and professionally. Each book offers unique insights and practical wisdom.',
      content: 'Full article content here...',
      author: 'Mohammed Naaz',
      published_date: '2024-01-10',
      category: 'reviews',
      tags: ['personal-development', 'self-help', 'recommendations'],
      featured_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
      read_time: 8
    },
    {
      id: '3',
      title: 'The Digital Revolution in Education: How E-books Are Changing Learning',
      excerpt: 'Explore how digital books and e-learning platforms are revolutionizing education and making knowledge more accessible than ever before.',
      content: 'Full article content here...',
      author: 'Prof. Rajesh Kumar',
      published_date: '2024-01-05',
      category: 'education',
      tags: ['technology', 'e-learning', 'digital-books'],
      featured_image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&q=80',
      read_time: 6
    },
    {
      id: '4',
      title: 'Interview with Bestselling Author: The Writing Process Revealed',
      excerpt: 'An exclusive interview with a bestselling author discussing their writing process, inspiration, and advice for aspiring writers.',
      content: 'Full article content here...',
      author: 'Literary Team',
      published_date: '2024-01-01',
      category: 'author-interviews',
      tags: ['interview', 'writing', 'authors'],
      featured_image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80',
      read_time: 10
    },
    {
      id: '5',
      title: 'Classic Literature in Modern Times: Why Old Books Still Matter',
      excerpt: 'Discover why classic literature remains relevant today and how these timeless works continue to offer valuable insights into human nature.',
      content: 'Full article content here...',
      author: 'Dr. Priya Sharma',
      published_date: '2023-12-28',
      category: 'literature',
      tags: ['classics', 'literature', 'analysis'],
      featured_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
      read_time: 7
    },
    {
      id: '6',
      title: 'Building a Home Library: Essential Books for Every Collection',
      excerpt: 'Learn how to curate a diverse and meaningful home library that reflects your interests and provides lasting value for you and your family.',
      content: 'Full article content here...',
      author: 'Book Curator Team',
      published_date: '2023-12-25',
      category: 'reviews',
      tags: ['home-library', 'collection', 'recommendations'],
      featured_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
      read_time: 9
    }
  ];

  useEffect(() => {
    // In a real app, this would fetch from Supabase
    // For now, we'll use mock data
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryLabel = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-naaz-green"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-naaz-green to-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Naaz Blog</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Insights, reviews, and stories from the world of books and learning
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-naaz-green focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Blog Posts Grid */}
        {currentPosts.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {currentPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-naaz-green text-white">
                        {getCategoryLabel(post.category)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <User className="w-4 h-4 mr-1" />
                      <span className="mr-4">{post.author}</span>
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="mr-4">{formatDate(post.published_date)}</span>
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{post.read_time} min read</span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h2>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button variant="outline" className="w-full group">
                      Read More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
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
                    className={currentPage === page ? "bg-naaz-green hover:bg-green-600" : ""}
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
          </>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Newsletter Signup */}
        <section className="bg-gray-50 rounded-lg p-8 mt-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-6">
              Subscribe to our newsletter to get the latest articles and book recommendations delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
              />
              <Button className="bg-naaz-green hover:bg-green-600">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default Blog;
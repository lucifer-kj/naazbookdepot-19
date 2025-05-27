
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, User, Tag, Clock, ArrowRight, Search } from 'lucide-react';

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Book Reviews', 'Islamic History', 'Author Interviews', 'Reading Guides', 'Islamic Literature'];

  const blogPosts = [
    {
      id: 1,
      title: 'Understanding the Tafsir of Ibn Kathir: A Comprehensive Guide',
      excerpt: 'Explore the rich commentary traditions of the Quran through one of Islam\'s most respected scholars.',
      author: 'Dr. Mohammed Farooq',
      date: '2024-01-15',
      category: 'Reading Guides',
      readTime: '8 min',
      image: '/lovable-uploads/61ad7a88-c8e2-42f6-b3b1-567415b3c17e.png',
      featured: true
    },
    {
      id: 2,
      title: 'The Golden Age of Islamic Literature: Books That Shaped Civilization',
      excerpt: 'Journey through the classical works that influenced Islamic thought and global knowledge.',
      author: 'Amina Khatun',
      date: '2024-01-10',
      category: 'Islamic History',
      readTime: '12 min',
      image: '/lovable-uploads/a8c77a1e-70d0-4c8f-8218-bbff0885a682.png'
    },
    {
      id: 3,
      title: 'Interview with Contemporary Islamic Author Dr. Tariq Ramadan',
      excerpt: 'Insights on modern Islamic scholarship and the role of literature in today\'s world.',
      author: 'Editorial Team',
      date: '2024-01-05',
      category: 'Author Interviews',
      readTime: '15 min',
      image: '/lovable-uploads/35ff87ed-b986-45b1-9c00-555f9d78c627.png'
    },
    {
      id: 4,
      title: 'Sahih Al-Bukhari: The Most Authentic Collection of Hadith',
      excerpt: 'Deep dive into the methodology and significance of Imam Bukhari\'s hadith collection.',
      author: 'Imam Syed Hassan',
      date: '2024-01-01',
      category: 'Book Reviews',
      readTime: '10 min',
      image: '/lovable-uploads/62fd92cc-0660-4c44-a99d-c69c5be673cb.png'
    },
    {
      id: 5,
      title: 'Building an Islamic Library: Essential Books for Every Muslim Home',
      excerpt: 'Curated recommendations for creating a comprehensive Islamic book collection.',
      author: 'Dr. Mohammed Farooq',
      date: '2023-12-28',
      category: 'Reading Guides',
      readTime: '7 min',
      image: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png'
    },
    {
      id: 6,
      title: 'The Art of Islamic Calligraphy in Manuscript Tradition',
      excerpt: 'Exploring the beautiful intersection of art and literature in Islamic manuscripts.',
      author: 'Amina Khatun',
      date: '2023-12-25',
      category: 'Islamic Literature',
      readTime: '9 min',
      image: '/lovable-uploads/61ad7a88-c8e2-42f6-b3b1-567415b3c17e.png'
    }
  ];

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-naaz-green text-white py-16 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-4">Islamic Knowledge Hub</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Discover insights, reviews, and guidance from Islamic literature and scholars
            </p>
            <div className="max-w-md mx-auto flex">
              <input
                type="text"
                placeholder="Search articles..."
                className="flex-1 px-4 py-3 rounded-l-lg text-gray-800 outline-none"
              />
              <button className="bg-naaz-gold hover:bg-naaz-gold/90 px-6 py-3 rounded-r-lg transition-colors">
                <Search size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <section className="py-16 px-4 bg-white">
            <div className="container mx-auto">
              <h2 className="text-2xl font-playfair font-bold text-naaz-green mb-8 text-center">Featured Article</h2>
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <img 
                      src={featuredPost.image} 
                      alt={featuredPost.title}
                      className="w-full h-64 object-cover rounded-lg shadow-lg"
                    />
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Tag className="mr-1" size={16} />
                      <span className="bg-naaz-gold/20 text-naaz-gold px-2 py-1 rounded mr-3">
                        {featuredPost.category}
                      </span>
                      <Clock className="mr-1" size={16} />
                      <span>{featuredPost.readTime} read</span>
                    </div>
                    <h3 className="text-2xl font-playfair font-bold text-naaz-green mb-4">
                      {featuredPost.title}
                    </h3>
                    <p className="text-gray-700 mb-4">{featuredPost.excerpt}</p>
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <User className="mr-1" size={16} />
                      <span className="mr-4">{featuredPost.author}</span>
                      <Calendar className="mr-1" size={16} />
                      <span>{new Date(featuredPost.date).toLocaleDateString()}</span>
                    </div>
                    <button className="bg-naaz-green hover:bg-naaz-green/90 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center">
                      Read Article
                      <ArrowRight className="ml-2" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Categories */}
        <section className="py-8 px-4 bg-naaz-cream">
          <div className="container mx-auto">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-naaz-green text-white'
                      : 'bg-white text-naaz-green hover:bg-naaz-green hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.filter(post => !post.featured).map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Tag className="mr-1" size={14} />
                      <span className="bg-naaz-gold/20 text-naaz-gold px-2 py-1 rounded text-xs mr-3">
                        {post.category}
                      </span>
                      <Clock className="mr-1" size={14} />
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-playfair font-semibold text-naaz-green mb-3 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <User className="mr-1" size={12} />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1" size={12} />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button className="mt-4 text-naaz-green hover:text-naaz-gold font-medium text-sm flex items-center">
                      Read More
                      <ArrowRight className="ml-1" size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 px-4 bg-naaz-green text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-playfair font-bold mb-4">Stay Updated</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter for the latest articles, book reviews, and Islamic knowledge updates.
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-800 outline-none"
              />
              <button className="bg-naaz-gold hover:bg-naaz-gold/90 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;

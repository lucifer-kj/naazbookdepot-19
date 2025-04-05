
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Posts' },
    { id: 'books', name: 'Islamic Literature' },
    { id: 'perfumes', name: 'Fragrances & Attars' },
    { id: 'essentials', name: 'Islamic Essentials' },
    { id: 'spirituality', name: 'Spirituality' },
    { id: 'lifestyle', name: 'Islamic Lifestyle' }
  ];

  const blogPosts = [
    {
      id: 1,
      title: "The Benefits of Natural Attars Over Synthetic Fragrances",
      excerpt: "Learn why traditional attar perfumes offer more than just pleasant scents, from their spiritual significance to their health benefits compared to synthetic options.",
      image: "/lovable-uploads/35ff87ed-b986-45b1-9c00-555f9d78c627.png",
      category: "perfumes",
      date: "April 2, 2025",
      author: "Sarah Ahmed",
      slug: "benefits-of-natural-attars",
      featured: true
    },
    {
      id: 2,
      title: "Essential Islamic Books for Every Home Library",
      excerpt: "Discover the fundamental texts that should be part of every Muslim household, from Quran translations to hadith collections and contemporary interpretations.",
      image: "/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png",
      category: "books",
      date: "March 28, 2025",
      author: "Mohammed Khan",
      slug: "essential-islamic-books",
      featured: false
    },
    {
      id: 3,
      title: "Prayer Mat Materials: What to Look For in Quality Products",
      excerpt: "A guide to selecting the best prayer mats for comfort and durability, including material comparisons and maintenance tips for prolonged use.",
      image: "/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png",
      category: "essentials",
      date: "March 25, 2025",
      author: "Fatima Rahman",
      slug: "prayer-mat-materials",
      featured: false
    },
    {
      id: 4,
      title: "Understanding the Different Schools of Islamic Thought",
      excerpt: "A comprehensive overview of the major madhabs (schools of thought) in Islamic jurisprudence and their historical development.",
      image: "/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png",
      category: "spirituality",
      date: "March 20, 2025",
      author: "Dr. Abdullah Yusuf",
      slug: "schools-of-islamic-thought",
      featured: false
    },
    {
      id: 5,
      title: "The Art of Perfume Making in Islamic Tradition",
      excerpt: "Explore the rich history of perfumery in Islamic civilization, from ancient techniques to modern adaptations of non-alcoholic fragrances.",
      image: "/lovable-uploads/35ff87ed-b986-45b1-9c00-555f9d78c627.png",
      category: "perfumes",
      date: "March 15, 2025",
      author: "Aisha Malik",
      slug: "perfume-making-islamic-tradition",
      featured: false
    },
    {
      id: 6,
      title: "Incorporating Islamic Principles into Modern Living",
      excerpt: "Practical advice on how to maintain Islamic values and practices in contemporary society while balancing work, family, and spiritual obligations.",
      image: "/lovable-uploads/a8c77a1e-70d0-4c8f-8218-bbff0885a682.png",
      category: "lifestyle",
      date: "March 10, 2025",
      author: "Zainab Hussain",
      slug: "islamic-principles-modern-living",
      featured: false
    }
  ];

  const filteredPosts = activeCategory === 'all' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory);

  const featuredPost = blogPosts.find(post => post.featured);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-4">Our Blog</h1>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Insights, guides, and stories from the world of Islamic literature, fragrances, and lifestyle.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-10 max-w-xl mx-auto">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search articles..." 
                className="w-full py-3 pl-4 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-naaz-green"
              />
              <Search 
                size={20} 
                className="absolute top-1/2 transform -translate-y-1/2 right-4 text-gray-500"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="mb-10 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-4 min-w-max pb-2">
              {categories.map(category => (
                <button 
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-5 py-2 rounded-full transition-colors ${
                    activeCategory === category.id 
                      ? 'bg-naaz-green text-white' 
                      : 'bg-naaz-cream hover:bg-naaz-green/10 text-naaz-green'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Post */}
          {featuredPost && activeCategory === 'all' && (
            <div className="mb-12">
              <Link to={`/blog/${featuredPost.slug}`} className="block group">
                <div className="grid md:grid-cols-2 gap-8 bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="h-64 md:h-auto overflow-hidden">
                    <img 
                      src={featuredPost.image} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center mb-4">
                      <span className="bg-naaz-gold/10 text-naaz-gold text-sm font-medium px-3 py-1 rounded-full">
                        Featured
                      </span>
                      <span className="ml-3 text-sm text-gray-500">{featuredPost.date}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-playfair font-bold text-naaz-green mb-4 group-hover:text-naaz-gold transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-600 mb-5">{featuredPost.excerpt}</p>
                    <div className="mt-auto flex justify-between items-center">
                      <span className="text-sm text-gray-500">By {featuredPost.author}</span>
                      <span className="text-naaz-green font-medium group-hover:text-naaz-gold transition-colors flex items-center">
                        Read More
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.filter(post => !post.featured || activeCategory !== 'all').map(post => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-naaz-gold bg-naaz-gold/10 px-2 py-1 rounded">
                        {categories.find(cat => cat.id === post.category)?.name || post.category}
                      </span>
                      <span className="text-xs text-gray-500">{post.date}</span>
                    </div>
                    <h3 className="text-xl font-playfair font-bold mb-3 text-naaz-green group-hover:text-naaz-gold transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 flex-grow">{post.excerpt}</p>
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">By {post.author}</span>
                      <span className="text-naaz-green font-medium group-hover:text-naaz-gold transition-colors flex items-center">
                        Read More
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex justify-center">
            <nav className="flex items-center space-x-1">
              <a href="#" className="px-4 py-2 border border-gray-300 rounded-l-md text-naaz-green hover:bg-naaz-cream">
                Previous
              </a>
              <a href="#" className="px-4 py-2 border border-gray-300 bg-naaz-green text-white">1</a>
              <a href="#" className="px-4 py-2 border border-gray-300 text-naaz-green hover:bg-naaz-cream">2</a>
              <a href="#" className="px-4 py-2 border border-gray-300 text-naaz-green hover:bg-naaz-cream">3</a>
              <span className="px-4 py-2 border border-gray-300 text-gray-500">...</span>
              <a href="#" className="px-4 py-2 border border-gray-300 text-naaz-green hover:bg-naaz-cream">10</a>
              <a href="#" className="px-4 py-2 border border-gray-300 rounded-r-md text-naaz-green hover:bg-naaz-cream">
                Next
              </a>
            </nav>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;

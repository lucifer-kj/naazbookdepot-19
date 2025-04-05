
import React from 'react';
import { Link } from 'react-router-dom';

const BlogSection = () => {
  const blogPosts = [
    {
      id: 1,
      title: "The Benefits of Natural Attars Over Synthetic Fragrances",
      excerpt: "Learn why traditional attar perfumes offer more than just pleasant scents...",
      image: "/lovable-uploads/35ff87ed-b986-45b1-9c00-555f9d78c627.png",
      category: "Perfumes",
      date: "April 2, 2025",
      slug: "benefits-of-natural-attars"
    },
    {
      id: 2,
      title: "Essential Islamic Books for Every Home Library",
      excerpt: "Discover the fundamental texts that should be part of every Muslim household...",
      image: "/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png",
      category: "Books",
      date: "March 28, 2025",
      slug: "essential-islamic-books"
    },
    {
      id: 3,
      title: "Prayer Mat Materials: What to Look For in Quality Products",
      excerpt: "A guide to selecting the best prayer mats for comfort and durability...",
      image: "/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png",
      category: "Essentials",
      date: "March 25, 2025",
      slug: "prayer-mat-materials"
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-4">Our Blog</h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Insights, guides, and stories from the world of Islamic literature, fragrances, and lifestyle.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="group">
              <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-naaz-gold bg-naaz-gold/10 px-2 py-1 rounded">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">{post.date}</span>
                  </div>
                  <h3 className="text-xl font-playfair font-bold mb-2 text-naaz-green group-hover:text-naaz-gold transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                  <span className="text-naaz-green font-medium group-hover:text-naaz-gold transition-colors flex items-center">
                    Read More
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/blog" className="accent-button">
            View All Articles
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;

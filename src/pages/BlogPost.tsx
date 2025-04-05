
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useParams } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Share2 } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams();
  
  // In a real application, you would fetch the blog post based on the slug
  // This is a placeholder for demonstration
  const post = {
    title: "The Benefits of Natural Attars Over Synthetic Fragrances",
    date: "April 2, 2025",
    author: "Sarah Ahmed",
    category: "Fragrances & Attars",
    image: "/lovable-uploads/35ff87ed-b986-45b1-9c00-555f9d78c627.png",
    content: `
      <p>In the world of fragrances, there's a growing recognition of the unique qualities and benefits that natural attars offer compared to their synthetic counterparts. Attars have been an integral part of Islamic culture for centuries, with their roots tracing back to ancient civilizations.</p>
      
      <h2>What Are Attars?</h2>
      
      <p>Attars are natural perfumes made by steam distilling botanical materials into a base oil, traditionally sandalwood oil. This ancient method of extraction preserves the essence of the source material, whether it's flowers, herbs, spices, or wood. The resulting fragrance is concentrated, pure, and free from alcohol or synthetic additives.</p>
      
      <h2>The Spiritual Connection</h2>
      
      <p>In Islamic tradition, pleasant fragrances hold significant spiritual value. Prophet Muhammad (PBUH) was known to love good scents and encouraged their use. Natural attars, being alcohol-free, are particularly suitable for Muslims as they can be worn during prayers and other religious activities.</p>
      
      <p>The process of creating attars is often considered an art form that has been passed down through generations. The craftspeople who make these fragrances are not merely perfumers but artisans who understand the delicate balance of scents and their effects on human emotions and spirituality.</p>
      
      <h2>Health Benefits of Natural Attars</h2>
      
      <p>Beyond their pleasing aromas, natural attars offer several health benefits that synthetic fragrances cannot match:</p>
      
      <ul>
        <li><strong>No Harmful Chemicals:</strong> Unlike synthetic perfumes that may contain phthalates, parabens, and other potentially harmful chemicals, natural attars are free from these substances.</li>
        <li><strong>Aromatherapeutic Properties:</strong> Many natural oils used in attars have therapeutic benefits. For example, rose attar can help reduce anxiety, while sandalwood can promote mental clarity.</li>
        <li><strong>Skin-Friendly:</strong> Natural attars are generally gentler on the skin and less likely to cause irritation compared to alcohol-based perfumes.</li>
        <li><strong>Longer Lasting:</strong> When applied to pulse points, the oils in attars slowly release their fragrance throughout the day, often outlasting synthetic options.</li>
      </ul>
      
      <h2>Environmental Considerations</h2>
      
      <p>The production of natural attars, when done responsibly, is more environmentally sustainable than the manufacturing of synthetic fragrances. The latter often involves petrochemicals and creates waste products that can harm ecosystems.</p>
      
      <p>However, it's important to note that the demand for certain natural materials, like agarwood (oud), has led to sustainability concerns. At Naaz Perfumes, we ensure our attars come from sustainable sources and, where possible, support conservation efforts for endangered plant species used in traditional perfumery.</p>
      
      <h2>Choosing the Right Attar</h2>
      
      <p>When selecting an attar, consider the following:</p>
      
      <ol>
        <li>The base note: Different base oils will affect how the fragrance develops on your skin</li>
        <li>Longevity: Some attars last longer than others</li>
        <li>Seasonal appropriateness: Lighter, floral scents may be better for summer, while woody, warm fragrances suit winter</li>
        <li>Personal body chemistry: The same attar can smell different on different people</li>
      </ol>
      
      <p>At Naaz Perfumes, we offer personalized consultations to help you find the perfect attar that complements your natural scent and meets your preferences.</p>
      
      <h2>Conclusion</h2>
      
      <p>The revival of interest in natural attars represents more than just a trend in the fragrance industry. It reflects a growing appreciation for traditional craftsmanship, natural products, and the cultural heritage associated with these exquisite scents. By choosing natural attars over synthetic fragrances, you're not only enjoying a superior olfactory experience but also connecting with a rich historical tradition that spans centuries and cultures.</p>
    `,
    relatedPosts: [
      {
        id: 1,
        title: "The Art of Perfume Making in Islamic Tradition",
        image: "/lovable-uploads/35ff87ed-b986-45b1-9c00-555f9d78c627.png",
        slug: "perfume-making-islamic-tradition"
      },
      {
        id: 2,
        title: "Selecting Your Signature Fragrance: A Guide to Attar Notes",
        image: "/lovable-uploads/35ff87ed-b986-45b1-9c00-555f9d78c627.png",
        slug: "guide-to-attar-notes"
      },
      {
        id: 3,
        title: "How to Apply and Preserve the Longevity of Natural Perfumes",
        image: "/lovable-uploads/35ff87ed-b986-45b1-9c00-555f9d78c627.png",
        slug: "applying-natural-perfumes"
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-10 px-4">
        <div className="container mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-2">
                <li className="inline-flex items-center">
                  <Link to="/" className="text-gray-700 hover:text-naaz-gold transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <Link to="/blog" className="ml-1 text-gray-700 hover:text-naaz-gold transition-colors">
                      Blog
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span className="ml-1 text-gray-500" aria-current="page">
                      {post.category}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          {/* Article Header */}
          <div className="max-w-4xl mx-auto mb-10">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-4">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center text-sm text-gray-600 mb-6 gap-4">
              <span className="flex items-center">
                <img 
                  src="https://ui-avatars.com/api/?name=Sarah+Ahmed&background=0A4F3C&color=fff"
                  alt="Author"
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span>By {post.author}</span>
              </span>
              <span>|</span>
              <span>{post.date}</span>
              <span>|</span>
              <span className="bg-naaz-gold/10 text-naaz-gold px-2 py-1 rounded">
                {post.category}
              </span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="rounded-xl overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Article Content */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Social Sharing */}
              <div className="md:w-16">
                <div className="sticky top-24 flex flex-row md:flex-col gap-4 md:gap-6">
                  <button className="w-10 h-10 rounded-full bg-naaz-green/10 flex items-center justify-center text-naaz-green hover:bg-naaz-green hover:text-white transition-colors">
                    <Facebook size={18} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-naaz-green/10 flex items-center justify-center text-naaz-green hover:bg-naaz-green hover:text-white transition-colors">
                    <Twitter size={18} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-naaz-green/10 flex items-center justify-center text-naaz-green hover:bg-naaz-green hover:text-white transition-colors">
                    <Linkedin size={18} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-naaz-green/10 flex items-center justify-center text-naaz-green hover:bg-naaz-green hover:text-white transition-colors">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
              
              {/* Main Content */}
              <article className="flex-grow">
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                
                {/* Article Tags */}
                <div className="mt-10 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-gray-600">Tags:</span>
                    <a href="#" className="bg-naaz-cream px-3 py-1 rounded-full text-sm text-naaz-green hover:bg-naaz-green hover:text-white transition-colors">
                      Perfumes
                    </a>
                    <a href="#" className="bg-naaz-cream px-3 py-1 rounded-full text-sm text-naaz-green hover:bg-naaz-green hover:text-white transition-colors">
                      Attar
                    </a>
                    <a href="#" className="bg-naaz-cream px-3 py-1 rounded-full text-sm text-naaz-green hover:bg-naaz-green hover:text-white transition-colors">
                      Natural Fragrances
                    </a>
                    <a href="#" className="bg-naaz-cream px-3 py-1 rounded-full text-sm text-naaz-green hover:bg-naaz-green hover:text-white transition-colors">
                      Islamic Culture
                    </a>
                  </div>
                </div>
                
                {/* Author Bio */}
                <div className="mt-10 bg-naaz-cream p-6 rounded-xl">
                  <div className="flex items-center">
                    <img 
                      src="https://ui-avatars.com/api/?name=Sarah+Ahmed&background=0A4F3C&color=fff&size=80"
                      alt="Author"
                      className="w-16 h-16 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-naaz-green">{post.author}</h3>
                      <p className="text-gray-600">Fragrance Expert & Content Creator</p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700">
                    Sarah Ahmed is a fragrance enthusiast with over 10 years of experience in the perfume industry. 
                    She specializes in natural attars and Islamic perfumery traditions, frequently conducting 
                    workshops on traditional perfume making across India.
                  </p>
                </div>
              </article>
            </div>
          </div>

          {/* Related Posts */}
          <div className="max-w-4xl mx-auto mt-16">
            <h2 className="text-2xl font-playfair font-bold text-naaz-green mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {post.relatedPosts.map(related => (
                <Link key={related.id} to={`/blog/${related.slug}`} className="group">
                  <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={related.image} 
                        alt={related.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-playfair font-bold text-naaz-green group-hover:text-naaz-gold transition-colors">
                        {related.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;

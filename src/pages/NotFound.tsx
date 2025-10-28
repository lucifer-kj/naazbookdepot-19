import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Home, BookOpen, Mail, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const NotFound = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const popularPages = [
    { name: 'Home', path: '/', icon: Home, description: 'Return to our homepage' },
    { name: 'Books', path: '/products', icon: BookOpen, description: 'Browse our book collection' },
    { name: 'About Us', path: '/about', icon: Mail, description: 'Learn more about Naaz Books' },
    { name: 'Contact', path: '/contact', icon: Mail, description: 'Get in touch with us' }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* 404 Display */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-200 mb-4">404</h1>
            <div className="relative -mt-8">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Oops! Page Not Found
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                The page you're looking for seems to have wandered off into the library stacks. 
                Don't worry, we'll help you find what you need!
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex max-w-md mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg"
                />
              </div>
              <Button type="submit" className="ml-2 px-6 py-3 bg-naaz-green hover:bg-green-600">
                Search
              </Button>
            </form>
            <p className="text-sm text-gray-500 mt-2">
              Try searching for books, authors, or topics you're interested in
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Popular Pages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularPages.map((page) => (
                <Link
                  key={page.path}
                  to={page.path}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-naaz-green hover:bg-green-50 transition-colors group"
                >
                  <page.icon className="w-6 h-6 text-naaz-green mr-3 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{page.name}</div>
                    <div className="text-sm text-gray-600">{page.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate(-1)}
                variant="outline" 
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              
              <Link to="/">
                <Button className="w-full sm:w-auto bg-naaz-green hover:bg-green-600">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>
              </Link>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <h4 className="font-medium text-gray-900 mb-2">Site Navigation</h4>
            <nav className="text-sm">
              <ol className="flex flex-wrap items-center space-x-2 text-gray-600">
                <li>
                  <Link to="/" className="hover:text-naaz-green">Home</Link>
                </li>
                <li className="before:content-['/'] before:mx-2">
                  <Link to="/products" className="hover:text-naaz-green">Books</Link>
                </li>
                <li className="before:content-['/'] before:mx-2">
                  <Link to="/about" className="hover:text-naaz-green">About</Link>
                </li>
                <li className="before:content-['/'] before:mx-2">
                  <Link to="/contact" className="hover:text-naaz-green">Contact</Link>
                </li>
                <li className="before:content-['/'] before:mx-2">
                  <Link to="/blog" className="hover:text-naaz-green">Blog</Link>
                </li>
              </ol>
            </nav>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 mb-2">Still Need Help?</h4>
            <p className="text-blue-800 mb-4">
              Our customer support team is here to assist you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contact">
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </Link>
              <Link to="/faq">
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  View FAQ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotFound;
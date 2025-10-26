import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-200">404</h1>
            <div className="relative -mt-16">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Page Not Found
              </h2>
              <p className="text-gray-600 mb-8">
                Sorry, we couldn't find the page you're looking for. 
                It might have been moved, deleted, or you entered the wrong URL.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Link to="/">
              <Button className="w-full">
                Go Back Home
              </Button>
            </Link>
            
            <Link to="/products">
              <Button variant="outline" className="w-full">
                Browse Products
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? <Link to="/contact" className="text-blue-600 hover:underline">Contact us</Link>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotFound;
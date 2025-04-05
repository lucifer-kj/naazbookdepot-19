
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-naaz-cream">
      <div className="text-center p-8">
        <h1 className="text-6xl font-playfair font-bold text-naaz-green mb-4">404</h1>
        <p className="text-xl text-naaz-burgundy mb-8">Oops! Page not found</p>
        <p className="text-gray-600 mb-8 max-w-md">
          We couldn't find the page you were looking for. It might have been removed or doesn't exist.
        </p>
        <Link to="/" className="gold-button">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { BookOpen, SprayCan, BookMarked, UserCircle, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [session, setSession] = React.useState(null);

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4 px-4">
        <Link to="/" className="text-2xl font-playfair font-bold text-naaz-green">
          The Naaz Group
        </Link>

        <div className="flex items-center space-x-6">
          <Link to="/books" className="flex items-center space-x-2 text-gray-700 hover:text-naaz-green">
            <BookOpen size={20} />
            <span>Books</span>
          </Link>
          <Link to="/perfumes" className="flex items-center space-x-2 text-gray-700 hover:text-naaz-green">
            <SprayCan size={20} />
            <span>Perfumes</span>
          </Link>
          <Link to="/essentials" className="flex items-center space-x-2 text-gray-700 hover:text-naaz-green">
            <BookMarked size={20} />
            <span>Essentials</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {session ? (
            <>
              <Link to="/account" className="flex items-center space-x-2 text-gray-700 hover:text-naaz-green">
                <UserCircle size={20} />
                <span>Account</span>
              </Link>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2"
                onClick={handleLogout}
              >
                <LogOut size={20} />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-naaz-gold hover:underline">
                Login
              </Link>
              <Link to="/register" className="bg-naaz-green text-white px-4 py-2 rounded-md hover:bg-naaz-green/90 transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

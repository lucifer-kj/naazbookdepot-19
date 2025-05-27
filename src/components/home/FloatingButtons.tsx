
import React from 'react';
import { MessageCircle, ArrowUp } from 'lucide-react';

interface FloatingButtonsProps {
  showBackToTop: boolean;
  scrollToTop: () => void;
}

const FloatingButtons: React.FC<FloatingButtonsProps> = ({ showBackToTop, scrollToTop }) => {
  return (
    <>
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <a 
          href="https://wa.me/919163431395" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 animate-pulse"
        >
          <MessageCircle size={24} />
        </a>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button 
          onClick={scrollToTop} 
          className="fixed bottom-6 left-6 bg-naaz-gold hover:bg-naaz-gold/90 text-white p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-300 z-50"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </>
  );
};

export default FloatingButtons;

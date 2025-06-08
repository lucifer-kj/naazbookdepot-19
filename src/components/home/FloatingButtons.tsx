import React from 'react';
import { ArrowUp } from 'lucide-react';

interface FloatingButtonsProps {
  showBackToTop: boolean;
  scrollToTop: () => void;
}

const FloatingButtons: React.FC<FloatingButtonsProps> = ({ showBackToTop, scrollToTop }) => {
  return (
    <>
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        {/* Replace a tag with WhatsApp SVG icon */}
        <a 
          href="https://wa.me/919163431395" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
        >
          {/* WhatsApp SVG icon, size 24 */}
          <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" viewBox="0 0 24 24">
            <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.967-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.205 5.077 4.372.71.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 6.318h-.001a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374A9.86 9.86 0 0 1 2.1 11.893C2.1 6.72 6.62 2.2 11.793 2.2c2.627 0 5.093 1.024 6.949 2.88a9.74 9.74 0 0 1 2.872 6.927c-.003 5.173-4.523 9.693-9.563 9.693zm8.413-18.28A11.815 11.815 0 0 0 11.793 0C5.282 0 0 5.282 0 11.893c0 2.096.547 4.142 1.588 5.945L.057 23.943a1.2 1.2 0 0 0 1.473 1.473l6.13-1.613a11.86 11.86 0 0 0 4.133.757h.001c6.511 0 11.793-5.282 11.793-11.893 0-3.17-1.233-6.151-3.482-8.487z"/>
          </svg>
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

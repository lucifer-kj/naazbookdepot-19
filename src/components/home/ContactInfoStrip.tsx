import React from 'react';
import { Phone, Mail } from 'lucide-react';

const ContactInfoStrip = () => {
  const contactInfo = [
    { icon: <Phone size={14} />, text: '+91 90510 85118' },
    { icon: <Phone size={14} />, text: '+91 91634 31395' },
    { icon: <Mail size={14} />, text: 'naazgroupofficial@gmail.com' },
    { icon: <Mail size={14} />, text: '1, Ismail Madani Lane, Kolkata' }
  ];

  // Duplicate for seamless looping
  const loopedInfo = [...contactInfo, ...contactInfo];

  return (
    <div className="bg-naaz-green text-white py-3 px-4 overflow-hidden">
      <div className="container mx-auto">
        {/* Desktop: normal flex, Mobile: horizontal scroll + animation */}
        <div className="hidden md:flex flex-wrap items-center justify-center gap-4 md:gap-8">
          {contactInfo.map((info, index) => (
            <div key={index} className="flex items-center">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span>{info.icon}</span>
                <span className="text-sm font-medium">{info.text}</span>
              </div>
              {index !== contactInfo.length - 1 && (
                <span className="mx-2 text-naaz-gold font-bold">|</span>
              )}
            </div>
          ))}
        </div>
        <div className="md:hidden relative w-full overflow-x-hidden">
          <div
            className="flex items-center gap-6 animate-contact-marquee whitespace-nowrap"
            style={{ animationDuration: '18s', animationDelay: '1s' }}
            onMouseEnter={e => (e.currentTarget.style.animationPlayState = 'paused')}
            onMouseLeave={e => (e.currentTarget.style.animationPlayState = 'running')}
          >
            {loopedInfo.map((info, index) => (
              <div key={index} className="flex items-center">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span>{info.icon}</span>
                  <span className="text-sm font-medium">{info.text}</span>
                </div>
                {index !== loopedInfo.length - 1 && (
                  <span className="mx-2 text-naaz-gold font-bold">|</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Animation styles */}
      <style>{`
        @keyframes contact-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-contact-marquee {
          animation-name: contact-marquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
};

export default ContactInfoStrip;

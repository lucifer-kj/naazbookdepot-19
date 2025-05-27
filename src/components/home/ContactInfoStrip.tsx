
import React from 'react';
import { Phone, Mail } from 'lucide-react';

const ContactInfoStrip = () => {
  const contactInfo = [
    { icon: <Phone size={14} />, text: '033 22350051' },
    { icon: <Phone size={14} />, text: '033 22350960' },
    { icon: <Phone size={14} />, text: '+91 91634 31395' },
    { icon: <Mail size={14} />, text: 'naazgroupofficial@gmail.com' },
    { icon: <Mail size={14} />, text: 'Visit us in Kolkata, West Bengal' }
  ];

  return (
    <div className="bg-naaz-green text-white py-3 px-4">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          {contactInfo.map((info, index) => (
            <div key={index} className="flex items-center gap-2 whitespace-nowrap">
              <span>{info.icon}</span>
              <span className="text-sm font-medium">{info.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactInfoStrip;

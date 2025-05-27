
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Truck, Package, MapPin, Clock, Shield, CreditCard } from 'lucide-react';

const Shipping = () => {
  const shippingZones = [
    {
      zone: 'Local (Kolkata & NCR)',
      time: '1-2 business days',
      cost: '₹50',
      icon: '🏠'
    },
    {
      zone: 'Eastern India',
      time: '2-3 business days',
      cost: '₹75',
      icon: '🌾'
    },
    {
      zone: 'Pan India',
      time: '3-5 business days',
      cost: '₹100',
      icon: '🇮🇳'
    },
    {
      zone: 'International',
      time: '7-14 business days',
      cost: 'Varies by destination',
      icon: '🌍'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-naaz-green text-white py-16 px-4">
          <div className="container mx-auto text-center">
            <Truck className="mx-auto mb-4" size={64} />
            <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-4">Shipping Information</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Fast, reliable delivery of Islamic knowledge to your doorstep across India and worldwide
            </p>
          </div>
        </div>

        {/* Shipping Options */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-playfair font-bold text-naaz-green text-center mb-12">Shipping Options</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {shippingZones.map((zone, index) => (
                <div key={index} className="bg-naaz-cream p-6 rounded-lg text-center">
                  <div className="text-4xl mb-4">{zone.icon}</div>
                  <h3 className="text-lg font-playfair font-semibold text-naaz-green mb-2">{zone.zone}</h3>
                  <p className="text-gray-700 mb-2">{zone.time}</p>
                  <p className="text-naaz-gold font-semibold">{zone.cost}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <div className="bg-naaz-gold/20 p-4 rounded-lg inline-block">
                <p className="text-naaz-green font-semibold">FREE SHIPPING on orders above ₹999</p>
              </div>
            </div>
          </div>
        </section>

        {/* Shipping Process */}
        <section className="py-16 px-4 bg-naaz-cream">
          <div className="container mx-auto">
            <h2 className="text-3xl font-playfair font-bold text-naaz-green text-center mb-12">How We Ship</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-naaz-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package size={24} />
                </div>
                <h3 className="font-playfair font-semibold text-naaz-green mb-2">Order Processing</h3>
                <p className="text-gray-700">Orders processed within 24 hours of confirmation</p>
              </div>
              
              <div className="text-center">
                <div className="bg-naaz-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield size={24} />
                </div>
                <h3 className="font-playfair font-semibold text-naaz-green mb-2">Secure Packaging</h3>
                <p className="text-gray-700">Books carefully packed to prevent damage during transit</p>
              </div>
              
              <div className="text-center">
                <div className="bg-naaz-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck size={24} />
                </div>
                <h3 className="font-playfair font-semibold text-naaz-green mb-2">Fast Delivery</h3>
                <p className="text-gray-700">Shipped via trusted courier partners across India</p>
              </div>
              
              <div className="text-center">
                <div className="bg-naaz-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin size={24} />
                </div>
                <h3 className="font-playfair font-semibold text-naaz-green mb-2">Order Tracking</h3>
                <p className="text-gray-700">Real-time tracking information sent via SMS and email</p>
              </div>
            </div>
          </div>
        </section>

        {/* Shipping Partners */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-playfair font-bold text-naaz-green text-center mb-12">Our Trusted Partners</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-naaz-cream rounded-lg">
                <h3 className="font-playfair font-semibold text-naaz-green mb-3">India Post</h3>
                <p className="text-gray-700">Reliable nationwide delivery network with affordable rates</p>
              </div>
              
              <div className="text-center p-6 bg-naaz-cream rounded-lg">
                <h3 className="font-playfair font-semibold text-naaz-green mb-3">Blue Dart</h3>
                <p className="text-gray-700">Express delivery service for urgent shipments</p>
              </div>
              
              <div className="text-center p-6 bg-naaz-cream rounded-lg">
                <h3 className="font-playfair font-semibold text-naaz-green mb-3">DTDC</h3>
                <p className="text-gray-700">Cost-effective shipping solution for bulk orders</p>
              </div>
            </div>
          </div>
        </section>

        {/* International Shipping */}
        <section className="py-16 px-4 bg-naaz-cream">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-playfair font-bold text-naaz-green text-center mb-8">International Shipping</h2>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-4">Available Countries</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• United States & Canada</li>
                      <li>• United Kingdom & Europe</li>
                      <li>• Australia & New Zealand</li>
                      <li>• Middle East (UAE, Saudi Arabia, Qatar)</li>
                      <li>• Southeast Asia (Malaysia, Singapore)</li>
                      <li>• Other countries on request</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-4">Important Notes</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Customs duties may apply</li>
                      <li>• Delivery times may vary by destination</li>
                      <li>• Tracking available for all shipments</li>
                      <li>• Insurance included for high-value orders</li>
                      <li>• Contact us for shipping quotes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shipping Policies */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-playfair font-bold text-naaz-green text-center mb-12">Shipping Policies</h2>
            <div className="space-y-8">
              <div className="bg-naaz-cream p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <Clock className="text-naaz-gold mr-3" size={24} />
                  <h3 className="text-xl font-playfair font-semibold text-naaz-green">Order Processing Time</h3>
                </div>
                <ul className="space-y-2 text-gray-700 ml-8">
                  <li>• Standard orders: 1-2 business days</li>
                  <li>• Custom orders: 3-5 business days</li>
                  <li>• Bulk orders (50+ books): 5-7 business days</li>
                  <li>• Orders placed after 2 PM processed next business day</li>
                </ul>
              </div>

              <div className="bg-naaz-cream p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <Package className="text-naaz-gold mr-3" size={24} />
                  <h3 className="text-xl font-playfair font-semibold text-naaz-green">Packaging Standards</h3>
                </div>
                <ul className="space-y-2 text-gray-700 ml-8">
                  <li>• Books wrapped in protective bubble wrap</li>
                  <li>• Sturdy cardboard boxes for multiple items</li>
                  <li>• Moisture-resistant packaging during monsoon</li>
                  <li>• Islamic blessing included with each order</li>
                </ul>
              </div>

              <div className="bg-naaz-cream p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <CreditCard className="text-naaz-gold mr-3" size={24} />
                  <h3 className="text-xl font-playfair font-semibold text-naaz-green">Cash on Delivery</h3>
                </div>
                <ul className="space-y-2 text-gray-700 ml-8">
                  <li>• Available for orders within India</li>
                  <li>• ₹25 additional handling fee applies</li>
                  <li>• Maximum order value: ₹5,000</li>
                  <li>• ID verification required at delivery</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact for Shipping */}
        <section className="py-16 px-4 bg-naaz-green text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-playfair font-bold mb-4">Shipping Questions?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Need help with shipping options or have a special delivery request? Our team is here to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="font-semibold mb-2">Email Support</p>
                <p>shipping@naazbookdepot.com</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="font-semibold mb-2">Phone Support</p>
                <p>+91 98765 43210</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="font-semibold mb-2">WhatsApp</p>
                <p>+91 98765 43210</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Shipping;

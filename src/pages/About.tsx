
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
  const milestones = [
    { year: '1960', event: 'Founding of Naaz Book Depot in Kolkata' },
    { year: '1975', event: 'Expanded to include Islamic essentials' },
    { year: '1988', event: 'Opened second branch in Mumbai' },
    { year: '1995', event: 'Introduced Naaz Perfumes collection' },
    { year: '2010', event: 'Launched online e-commerce platform' },
    { year: '2023', event: 'Celebrating over 60 years of service to the community' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Banner */}
        <div className="relative h-80 overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/lovable-uploads/a8c77a1e-70d0-4c8f-8218-bbff0885a682.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.7)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-naaz-green/80 to-transparent" />
          <div className="relative container mx-auto h-full flex flex-col justify-center px-4">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white mb-4">About The Naaz Group</h1>
            <p className="text-white/90 max-w-xl text-lg">
              Over 60 years of heritage serving the Islamic community with authenticity and excellence.
            </p>
          </div>
        </div>

        {/* Our Story */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl font-playfair font-bold text-naaz-green mb-6">Our Story</h2>
                <div className="prose prose-lg text-gray-700">
                  <p>
                    Founded in 1960, Naaz Book Depot began as a small bookshop in Kolkata, specializing in Islamic literature and texts. 
                    What started as a modest endeavor by Abdul Rahman Khan has since grown into a trusted name in quality Islamic products across India.
                  </p>
                  <p>
                    Our commitment to authenticity and quality led us to expand our offerings beyond books. In 1975, we introduced a line of 
                    Islamic essentials, including prayer mats, caps, and other accessories. Later in 1995, we launched Naaz Perfumes, 
                    our collection of premium non-alcoholic attars and fragrances crafted according to Islamic traditions.
                  </p>
                  <p>
                    Today, with over six decades of experience, The Naaz Group operates three specialized shops across Mumbai 
                    and Kolkata, each dedicated to a specific product category while maintaining our core values of quality, 
                    authenticity, and exceptional customer service.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="border-8 border-naaz-cream p-3 rounded-lg shadow-xl">
                  <img 
                    src="/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png" 
                    alt="Naaz Book Depot Historical Photo" 
                    className="rounded w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-5 -right-5 w-32 h-32 bg-naaz-gold rounded-full flex items-center justify-center text-center p-2">
                  <span className="text-naaz-green font-playfair font-bold text-lg">Serving Since 1960</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 px-4 bg-naaz-cream/30">
          <div className="container mx-auto">
            <h2 className="text-3xl font-playfair font-bold text-naaz-green text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="w-16 h-16 bg-naaz-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-naaz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-playfair font-bold text-naaz-green mb-3">Authenticity</h3>
                <p className="text-gray-600">
                  We ensure all our products maintain authenticity, whether it's literature, fragrances, or Islamic essentials.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="w-16 h-16 bg-naaz-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-naaz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-playfair font-bold text-naaz-green mb-3">Quality</h3>
                <p className="text-gray-600">
                  We never compromise on quality, carefully selecting each product to meet the highest standards.
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="w-16 h-16 bg-naaz-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-naaz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-playfair font-bold text-naaz-green mb-3">Community</h3>
                <p className="text-gray-600">
                  We take pride in serving the Muslim community for over six decades, building trust through generations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-playfair font-bold text-naaz-green text-center mb-12">Our Journey</h2>
            <div className="relative border-l-4 border-naaz-green ml-6 md:ml-0 md:mx-auto md:max-w-3xl pl-8 pb-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="mb-12 relative">
                  <div className="absolute -left-[52px] w-10 h-10 bg-naaz-gold rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-naaz-green rounded-full"></div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-2xl font-playfair font-bold text-naaz-green mb-1">{milestone.year}</h3>
                    <p className="text-gray-700">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;

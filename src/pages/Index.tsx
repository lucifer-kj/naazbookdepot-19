
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturedCategories from '../components/FeaturedCategories';
import FeaturedProducts from '../components/FeaturedProducts';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';
import MarketplaceSection from '../components/MarketplaceSection';
import SpecializedShops from '../components/SpecializedShops';
import BlogSection from '../components/BlogSection';
import NewArrivals from '../components/NewArrivals';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <MarketplaceSection />
        <SpecializedShops />
        <FeaturedProducts />
        <NewArrivals />
        <BlogSection />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

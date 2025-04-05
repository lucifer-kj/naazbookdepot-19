
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Perfumes = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-playfair font-bold text-naaz-green mb-8">Non-Alcoholic Perfumes</h1>
          <p className="text-lg mb-8">
            Our collection of premium non-alcoholic attars and fragrances from Naaz Perfumes.
          </p>
          <div className="bg-naaz-cream border border-naaz-green/20 rounded-lg p-8 text-center">
            <p className="text-xl font-playfair text-naaz-green">Coming Soon</p>
            <p className="text-gray-600 mt-2">This page is currently under development.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Perfumes;

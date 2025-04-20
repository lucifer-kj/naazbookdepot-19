
import React from 'react';
import { Link } from 'react-router-dom';
import Image from '@/components/ui/image';

const SpecializedShops = () => {
  const shops = [
    {
      id: 1,
      title: "Naaz Book Depot",
      description: "Discover the rich heritage of Islamic literature",
      image: "/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png",
      link: "/books"
    },
    {
      id: 2,
      title: "Naaz Perfumes",
      description: "Premium Islamic perfumes and attar collections",
      image: "/lovable-uploads/35ff87ed-b986-45b1-9c00-555f9d78c627.png",
      link: "/perfumes"
    },
    {
      id: 3,
      title: "Naaz Essentials",
      description: "Quality Islamic lifestyle products and accessories",
      image: "/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png",
      link: "/essentials"
    }
  ];

  return (
    <section className="py-12 sm:py-16 px-4 bg-naaz-cream/50">
      <div className="container mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-3 sm:mb-4">
            Our Specialized Shops
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto px-2">
            Visit our dedicated online shops, each offering a specialized selection of premium Islamic products.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {shops.map((shop) => (
            <div key={shop.id} className="relative group overflow-hidden rounded-lg shadow-lg h-64 sm:h-72 md:h-80">
              <div className="relative h-full w-full overflow-hidden">
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-naaz-green to-transparent opacity-70"
                >
                  <Image 
                    src={shop.image}
                    alt={shop.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-naaz-green to-transparent opacity-70" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 text-white">
                  <h3 className="text-xl sm:text-2xl font-playfair font-bold mb-2">{shop.title}</h3>
                  <p className="mb-4 opacity-90 text-sm sm:text-base">{shop.description}</p>
                  <Link 
                    to={shop.link} 
                    className="inline-block border border-white text-white py-2 px-4 rounded hover:bg-white hover:text-naaz-green transition-all text-sm sm:text-base"
                  >
                    Visit Shop
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecializedShops;

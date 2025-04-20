
import React from 'react';
import { Link } from 'react-router-dom';

const SpecializedShops = () => {
  const shops = [
    {
      id: 1,
      title: "Naaz Book Depot",
      description: "Discover the rich heritage of Islamic literature",
      image: "https://unsplash.com/photos/a-stack-of-books-with-a-ladder-leaning-against-it-wwtLv4Z4BEA",
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
    <section className="py-16 px-4 bg-naaz-cream/50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-4">
            Our Specialized Shops
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Visit our dedicated online shops, each offering a specialized selection of premium Islamic products.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {shops.map((shop) => (
            <div key={shop.id} className="relative group overflow-hidden rounded-lg shadow-lg">
              <div className="relative h-80 w-full overflow-hidden">
                <div 
                  className="absolute inset-0 bg-gradient-to-t from-naaz-green to-transparent opacity-70"
                  style={{
                    backgroundImage: `url(${shop.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundBlendMode: 'overlay',
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-naaz-green to-transparent opacity-70" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <h3 className="text-2xl font-playfair font-bold mb-2">{shop.title}</h3>
                  <p className="mb-4 opacity-90">{shop.description}</p>
                  <Link 
                    to={shop.link} 
                    className="inline-block border border-white text-white py-2 px-4 rounded hover:bg-white hover:text-naaz-green transition-all"
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

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductDisplay from '../components/product/ProductDisplay';
import { Product } from '../components/product/ProductDisplay';

// Mock product data for demonstration
const mockProduct: Product = {
  id: 1,
  name: 'The Noble Quran - Arabic with English Translation',
  description: '<p>This beautifully presented edition of the Noble Quran features the original Arabic text alongside a precise English translation. It includes comprehensive tafsir (commentary) to aid in understanding the deeper meanings of the verses.</p><p>The book is printed on high-quality paper with a luxurious leather-bound cover, making it both functional for daily reading and a beautiful addition to your Islamic book collection.</p><h3>Features:</h3><ul><li>Original Arabic text with English translation</li><li>Comprehensive commentary and tafsir</li><li>Premium leather binding</li><li>Gold-gilded page edges</li><li>Bookmark ribbon</li><li>Index of topics</li></ul>',
  short_description: 'Elegant edition with Arabic text and English translation, featuring comprehensive commentary.',
  price: '1500',
  regular_price: '1800',
  sale_price: '1500',
  stock_status: 'instock',
  average_rating: '4.8',
  rating_count: 24,
  quantity_in_stock: 20, // Added missing property
  categories: [
    { id: 1, name: 'Books', slug: 'books' },
    { id: 2, name: 'Quran & Tafsir', slug: 'quran-tafsir' }
  ],
  images: [
    { id: 1, src: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png', alt: 'The Noble Quran front cover' },
    { id: 2, src: '/lovable-uploads/35ff87ed-b986-45b1-9c00-555f9d78c627.png', alt: 'The Noble Quran open pages' },
    { id: 3, src: '/lovable-uploads/61ad7a88-c8e2-42f6-b3b1-567415b3c17e.png', alt: 'The Noble Quran back cover' }
  ],
  attributes: [
    {
      name: 'Language',
      options: ['Arabic-English', 'Arabic-Urdu', 'Arabic-Hindi']
    },
    {
      name: 'Binding',
      options: ['Leather', 'Hardcover', 'Paperback']
    }
  ],
  variations: [
    {
      id: 101,
      name: 'The Noble Quran - Arabic with English Translation - Leather',
      price: '1500',
      stock_status: 'instock',
      attributes: [
        { name: 'Language', value: 'Arabic-English' },
        { name: 'Binding', value: 'Leather' }
      ]
    },
    {
      id: 102,
      name: 'The Noble Quran - Arabic with Urdu Translation - Leather',
      price: '1450',
      stock_status: 'instock',
      attributes: [
        { name: 'Language', value: 'Arabic-Urdu' },
        { name: 'Binding', value: 'Leather' }
      ]
    },
    {
      id: 103,
      name: 'The Noble Quran - Arabic with Hindi Translation - Leather',
      price: '1450',
      stock_status: 'outofstock',
      attributes: [
        { name: 'Language', value: 'Arabic-Hindi' },
        { name: 'Binding', value: 'Leather' }
      ]
    }
  ],
  related_ids: [2, 3, 4]
};

const mockRelatedProducts: Product[] = [
  {
    id: 2,
    name: 'Tafsir Ibn Kathir',
    description: 'Comprehensive tafsir of the Quran',
    price: '2200',
    stock_status: 'instock',
    average_rating: '4.9',
    rating_count: 18,
    quantity_in_stock: 8, // Added missing property
    categories: [{ id: 1, name: 'Books', slug: 'books' }],
    images: [{ id: 1, src: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png', alt: 'Tafsir Ibn Kathir' }]
  },
  {
    id: 3,
    name: 'Quran with Wooden Display Stand',
    description: 'Beautiful Quran with wooden stand',
    price: '3500',
    stock_status: 'instock',
    average_rating: '4.7',
    rating_count: 12,
    quantity_in_stock: 5, // Added missing property
    categories: [{ id: 1, name: 'Books', slug: 'books' }],
    images: [{ id: 1, src: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png', alt: 'Quran with stand' }]
  },
  {
    id: 4,
    name: 'Pocket Quran - Travel Size',
    description: 'Compact Quran for travel',
    price: '600',
    stock_status: 'instock',
    average_rating: '4.5',
    rating_count: 25,
    quantity_in_stock: 30, // Added missing property
    categories: [{ id: 1, name: 'Books', slug: 'books' }],
    images: [{ id: 1, src: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png', alt: 'Travel Quran' }]
  },
  {
    id: 5,
    name: 'Arabic Calligraphy Quran',
    description: 'Quran with beautiful calligraphy',
    price: '1800',
    stock_status: 'instock',
    average_rating: '4.8',
    rating_count: 15,
    quantity_in_stock: 12, // Added missing property
    categories: [{ id: 1, name: 'Books', slug: 'books' }],
    images: [{ id: 1, src: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png', alt: 'Calligraphy Quran' }]
  }
];

const mockReviews = [
  {
    id: 1,
    reviewer_name: 'Ahmed Khan',
    review: 'Amazing quality and beautiful binding. The translation is accurate and easy to understand.',
    rating: 5,
    date_created: '2023-06-15T10:34:23',
    verified: true
  },
  {
    id: 2,
    reviewer_name: 'Fatima Rahman',
    review: 'I purchased this Quran as a gift for my father, and he absolutely loves it. The print quality is excellent, and the commentary is very helpful.',
    rating: 5,
    date_created: '2023-05-22T14:12:45',
    verified: true
  },
  {
    id: 3,
    reviewer_name: 'Mohammed Ali',
    review: 'Very good quality overall, but the paper is a bit thin. Otherwise, the translation and commentary are excellent.',
    rating: 4,
    date_created: '2023-04-18T09:45:12',
    verified: true
  }
];

interface TabContentProps {
  product: Product;
  reviews?: Array<{
    id: number;
    reviewer_name: string;
    review: string;
    rating: number;
    date_created: string;
    verified: boolean;
  }>;
}

const DescriptionTab: React.FC<TabContentProps> = ({ product }) => (
  <div className="prose max-w-none">
    <div dangerouslySetInnerHTML={{ __html: product.description }} />
  </div>
);

const AdditionalInfoTab: React.FC<TabContentProps> = ({ product }) => (
  <div className="space-y-4">
    {product.isbn && (
      <div className="grid grid-cols-2 gap-4">
        <span className="font-medium">ISBN</span>
        <span>{product.isbn}</span>
      </div>
    )}
    {product.publisher && (
      <div className="grid grid-cols-2 gap-4">
        <span className="font-medium">Publisher</span>
        <span>{product.publisher}</span>
      </div>
    )}
    {product.language && (
      <div className="grid grid-cols-2 gap-4">
        <span className="font-medium">Language</span>
        <span>{product.language}</span>
      </div>
    )}
    {product.pages && (
      <div className="grid grid-cols-2 gap-4">
        <span className="font-medium">Pages</span>
        <span>{product.pages}</span>
      </div>
    )}
    {product.binding && (
      <div className="grid grid-cols-2 gap-4">
        <span className="font-medium">Binding</span>
        <span>{product.binding}</span>
      </div>
    )}
  </div>
);

const ReviewsTab: React.FC<TabContentProps> = ({ reviews = [] }) => (
  <div className="space-y-6">
    {reviews.map((review) => (
      <motion.div
        key={review.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 rounded-lg shadow-sm"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-naaz-green">{review.reviewer_name}</span>
          <span className="text-sm text-gray-500">
            {new Date(review.date_created).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
              ⭐
            </span>
          ))}
          {review.verified && (
            <span className="ml-2 text-xs text-green-600">Verified Purchase</span>
          )}
        </div>
        <p className="text-gray-700">{review.review}</p>
      </motion.div>
    ))}
  </div>
);

const ProductPage: React.FC = () => {
  const { productId } = useParams();
  const [activeTab, setActiveTab] = useState("description");
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Product Content */}
            <div className="lg:col-span-2">
              <ProductDisplay 
                product={mockProduct}
                relatedProducts={mockRelatedProducts}
                reviews={mockReviews}
              />
              
              {/* Product Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 bg-white rounded-lg shadow-md p-6"
              >
                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="additional">Additional Info</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews ({mockReviews.length})</TabsTrigger>
                  </TabsList>
                  <div className="mt-6">
                    <TabsContent value="description">
                      <DescriptionTab product={mockProduct} />
                    </TabsContent>
                    <TabsContent value="additional">
                      <AdditionalInfoTab product={mockProduct} />
                    </TabsContent>
                    <TabsContent value="reviews">
                      <ReviewsTab product={mockProduct} reviews={mockReviews} />
                    </TabsContent>
                  </div>
                </Tabs>
              </motion.div>
            </div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-playfair font-semibold text-naaz-green mb-4">
                  Recommended Books
                </h2>
                <div className="space-y-4">
                  {mockRelatedProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex gap-3 p-2 rounded-lg hover:bg-naaz-cream/20 transition-colors"
                    >
                      <img
                        src={product.images[0].src}
                        alt={product.name}
                        className="w-20 h-24 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-medium text-naaz-green text-sm line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{product.author}</p>
                        <p className="text-naaz-gold font-semibold mt-1">₹{product.price}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductPage;

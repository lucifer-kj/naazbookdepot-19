
import React from 'react';
import { useParams } from 'react-router-dom';
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

const ProductPage: React.FC = () => {
  const { productId } = useParams();
  
  // In a real app, you would fetch the product based on productId
  // For demo purposes, we're using mock data
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <ProductDisplay 
          product={mockProduct}
          relatedProducts={mockRelatedProducts}
          reviews={mockReviews}
        />
      </main>
      <Footer />
    </div>
  );
};

export default ProductPage;

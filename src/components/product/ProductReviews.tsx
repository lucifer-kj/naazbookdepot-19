
import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
  id: number;
  reviewer_name: string;
  review: string;
  rating: number;
  date_created: string;
  verified: boolean;
}

interface ProductReviewsProps {
  productId: number;
  reviews: Review[];
  rating: number;
}

const ProductReviews = ({ productId, reviews, rating }: ProductReviewsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="mt-16">
      <div 
        className="border-t border-b border-gray-200 py-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-playfair font-bold text-naaz-green">
            Customer Reviews ({reviews.length})
          </h2>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="py-8"
          >
            {reviews.length > 0 ? (
              <div className="space-y-8">
                {/* Overall Rating */}
                <div className="flex items-center gap-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={24} 
                        className={star <= rating 
                          ? "text-naaz-gold fill-naaz-gold" 
                          : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">{rating.toFixed(1)} out of 5</span>
                </div>
                
                {/* Individual Reviews */}
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <motion.div 
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="border-b border-gray-200 pb-6"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-naaz-green">
                          {review.reviewer_name}
                          {review.verified && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Verified Purchase
                            </span>
                          )}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.date_created)}
                        </span>
                      </div>
                      
                      <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={16} 
                            className={star <= review.rating 
                              ? "text-naaz-gold fill-naaz-gold" 
                              : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      
                      <p className="text-gray-700">{review.review}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductReviews;

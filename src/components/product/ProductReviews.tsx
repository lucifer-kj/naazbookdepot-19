
import React, { useState } from 'react';
import { Star, Edit, Trash2 } from 'lucide-react';
import { useProductReviews, useCreateReview, useUpdateReview, useDeleteReview } from '@/lib/hooks/useReviews';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user, isAuthenticated } = useAuth();
  const { data: reviews = [], isLoading } = useProductReviews(productId);
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const userHasReview = reviews.find(review => review.user_id === user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingReview) {
        await updateReview.mutateAsync({
          reviewId: editingReview.id,
          rating,
          comment,
        });
        setEditingReview(null);
      } else {
        await createReview.mutateAsync({
          productId,
          rating,
          comment,
        });
      }
      
      setShowForm(false);
      setRating(5);
      setComment('');
    } catch (error) {
      console.error('Error saving review:', error);
    }
  };

  const handleEdit = (review: any) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment || '');
    setShowForm(true);
  };

  const handleDelete = async (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview.mutateAsync(reviewId);
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  };

  const StarRating = ({ value, onChange, readonly = false }: { value: number; onChange?: (value: number) => void; readonly?: boolean }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${
            star <= value ? 'text-yellow-400' : 'text-gray-300'
          } ${readonly ? 'cursor-default' : 'hover:text-yellow-400 cursor-pointer'}`}
        >
          <Star className="h-5 w-5 fill-current" />
        </button>
      ))}
    </div>
  );

  if (isLoading) {
    return <div className="animate-pulse">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-playfair font-semibold text-naaz-green">
          Customer Reviews ({reviews.length})
        </h3>
        
        {isAuthenticated && !userHasReview && !showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-naaz-green hover:bg-naaz-green/90"
          >
            Write a Review
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">
            {editingReview ? 'Edit Your Review' : 'Write a Review'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                placeholder="Share your thoughts about this product..."
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-naaz-green hover:bg-naaz-green/90">
                {editingReview ? 'Update Review' : 'Submit Review'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingReview(null);
                  setRating(5);
                  setComment('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-naaz-green rounded-full flex items-center justify-center text-white font-medium">
                  {review.profiles?.name?.[0] || 'U'}
                </div>
                <div>
                  <p className="font-medium">{review.profiles?.name || 'Anonymous'}</p>
                  <StarRating value={review.rating} readonly />
                </div>
              </div>
              
              {review.user_id === user?.id && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(review)}
                    className="text-gray-500 hover:text-naaz-green"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            
            {review.comment && (
              <p className="text-gray-700 mt-2">{review.comment}</p>
            )}
            
            <p className="text-sm text-gray-500 mt-2">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
        
        {reviews.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No reviews yet. Be the first to review this product!
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;

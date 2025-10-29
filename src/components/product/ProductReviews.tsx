
import React, { useState } from 'react';
import { Star, Edit, Trash2, ThumbsUp, ThumbsDown, Flag, TrendingUp, Award } from 'lucide-react';
import { 
  useProductReviews, 
  useCreateReview, 
  useUpdateReview, 
  useDeleteReview,
  useProductReviewStats,
  useVoteHelpful,
  useReportReview
} from '@/lib/hooks/useReviews';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user, isAuthenticated } = useAuth();
  const { data: reviews = [], isLoading } = useProductReviews(productId, user?.id);
  const { data: reviewStats } = useProductReviewStats(productId);
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();
  const voteHelpful = useVoteHelpful();
  const reportReview = useReportReview();

  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(false);
  const [reportingReview, setReportingReview] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDescription, setReportDescription] = useState('');

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
          title,
          comment,
          wouldRecommend,
        });
      }
      
      setShowForm(false);
      setRating(5);
      setTitle('');
      setComment('');
      setWouldRecommend(false);
    } catch (error) {
      console.error('Error saving review:', error);
    }
  };

  const handleEdit = (review: any) => {
    setEditingReview(review);
    setRating(review.rating);
    setTitle(review.title || '');
    setComment(review.comment || '');
    setWouldRecommend(review.would_recommend || false);
    setShowForm(true);
  };

  const handleVoteHelpful = async (reviewId: number, isHelpful: boolean) => {
    try {
      await voteHelpful.mutateAsync({ reviewId, isHelpful });
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleReportReview = async () => {
    if (!reportingReview || !reportReason) return;
    
    try {
      await reportReview.mutateAsync({
        reviewId: reportingReview,
        reason: reportReason as any,
        description: reportDescription,
      });
      setReportingReview(null);
      setReportReason('');
      setReportDescription('');
    } catch (error) {
      console.error('Error reporting review:', error);
    }
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
      {/* Review Statistics */}
      {reviewStats && reviewStats.total_reviews > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-naaz-green">
                    {reviewStats.average_rating.toFixed(1)}
                  </div>
                  <StarRating value={Math.round(reviewStats.average_rating)} readonly />
                  <div className="text-sm text-gray-500 mt-1">
                    {reviewStats.total_reviews} reviews
                  </div>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center space-x-2 mb-1">
                      <span className="text-sm w-8">{stars}★</span>
                      <Progress 
                        value={(reviewStats.rating_distribution[stars.toString() as keyof typeof reviewStats.rating_distribution] / reviewStats.total_reviews) * 100} 
                        className="flex-1 h-2" 
                      />
                      <span className="text-sm text-gray-500 w-8">
                        {reviewStats.rating_distribution[stars.toString() as keyof typeof reviewStats.rating_distribution]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Sentiment Analysis</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-green-600">Positive</span>
                  <span className="font-medium">{reviewStats.sentiment_distribution.positive}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Neutral</span>
                  <span className="font-medium">{reviewStats.sentiment_distribution.neutral}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-red-600">Negative</span>
                  <span className="font-medium">{reviewStats.sentiment_distribution.negative}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                Rating *
              </label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your review in a few words"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review *
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share your detailed thoughts about this product..."
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="wouldRecommend"
                checked={wouldRecommend}
                onChange={(e) => setWouldRecommend(e.target.checked)}
                className="rounded border-gray-300 text-naaz-green focus:ring-naaz-green"
              />
              <label htmlFor="wouldRecommend" className="text-sm text-gray-700">
                I would recommend this product to others
              </label>
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
                  setTitle('');
                  setComment('');
                  setWouldRecommend(false);
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
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-naaz-green rounded-full flex items-center justify-center text-white font-medium">
                  {review.profiles?.name?.[0] || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium">{review.profiles?.name || 'Anonymous'}</p>
                    {review.verified_purchase && (
                      <Badge variant="secondary" className="text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        Verified Purchase
                      </Badge>
                    )}
                    {review.is_featured && (
                      <Badge variant="default" className="text-xs bg-naaz-gold">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <StarRating value={review.rating} readonly />
                    {review.analytics?.sentiment_label && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          review.analytics.sentiment_label === 'positive' ? 'text-green-600 border-green-200' :
                          review.analytics.sentiment_label === 'negative' ? 'text-red-600 border-red-200' :
                          'text-gray-600 border-gray-200'
                        }`}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {review.analytics.sentiment_label}
                      </Badge>
                    )}
                  </div>
                  {review.title && (
                    <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                {review.user_id === user?.id ? (
                  <>
                    <button
                      onClick={() => handleEdit(review)}
                      className="text-gray-500 hover:text-naaz-green"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id.toString())}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  isAuthenticated && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          onClick={() => setReportingReview(review.id)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <Flag className="h-4 w-4" />
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Report Review</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Select value={reportReason} onValueChange={setReportReason}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="spam">Spam</SelectItem>
                              <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                              <SelectItem value="fake">Fake review</SelectItem>
                              <SelectItem value="offensive">Offensive language</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <Textarea
                            value={reportDescription}
                            onChange={(e) => setReportDescription(e.target.value)}
                            placeholder="Additional details (optional)"
                            rows={3}
                          />
                          <Button 
                            onClick={handleReportReview}
                            disabled={!reportReason}
                            className="w-full"
                          >
                            Submit Report
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )
                )}
              </div>
            </div>
            
            {review.comment && (
              <p className="text-gray-700 mb-3">{review.comment}</p>
            )}

            {review.would_recommend && (
              <div className="flex items-center space-x-1 mb-3">
                <ThumbsUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Recommends this product</span>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{new Date(review.created_at).toLocaleDateString()}</span>
              
              {isAuthenticated && review.user_id !== user?.id && (
                <div className="flex items-center space-x-4">
                  <span>Was this helpful?</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleVoteHelpful(review.id, true)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded ${
                        review.user_helpful_vote === true 
                          ? 'bg-green-100 text-green-700' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Yes</span>
                    </button>
                    <button
                      onClick={() => handleVoteHelpful(review.id, false)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded ${
                        review.user_helpful_vote === false 
                          ? 'bg-red-100 text-red-700' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <ThumbsDown className="w-3 h-3" />
                      <span>No</span>
                    </button>
                  </div>
                  {review.helpful_count > 0 && (
                    <span className="text-xs">
                      {review.helpful_count} found this helpful
                    </span>
                  )}
                </div>
              )}
            </div>
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

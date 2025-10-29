import React, { useState } from 'react';
import { Star, Package, Truck, ThumbsUp } from 'lucide-react';
import { useCreateOrderFeedback, useOrderFeedback } from '@/lib/hooks/useReviews';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OrderFeedbackFormProps {
  orderId: number;
  orderNumber: string;
}

const OrderFeedbackForm: React.FC<OrderFeedbackFormProps> = ({ orderId, orderNumber }) => {
  const { data: existingFeedback } = useOrderFeedback(orderId);
  const createFeedback = useCreateOrderFeedback();
  
  const [overallRating, setOverallRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [packagingRating, setPackagingRating] = useState(5);
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [feedbackText, setFeedbackText] = useState('');
  const [improvementSuggestions, setImprovementSuggestions] = useState('');

  const StarRating = ({ 
    value, 
    onChange, 
    label, 
    icon: Icon 
  }: { 
    value: number; 
    onChange: (value: number) => void; 
    label: string;
    icon: React.ComponentType<any>;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Icon className="w-5 h-5 text-naaz-green" />
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 cursor-pointer`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createFeedback.mutateAsync({
        orderId,
        overallRating,
        deliveryRating,
        packagingRating,
        wouldRecommend,
        feedbackText,
        improvementSuggestions,
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  if (existingFeedback) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ThumbsUp className="w-5 h-5 text-green-600" />
            <span>Thank you for your feedback!</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-naaz-green">
                  {existingFeedback.overall_rating}
                </div>
                <div className="text-sm text-gray-600">Overall Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-naaz-green">
                  {existingFeedback.delivery_rating}
                </div>
                <div className="text-sm text-gray-600">Delivery</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-naaz-green">
                  {existingFeedback.packaging_rating}
                </div>
                <div className="text-sm text-gray-600">Packaging</div>
              </div>
            </div>
            
            {existingFeedback.would_recommend && (
              <Badge className="bg-green-100 text-green-800">
                Would recommend to others
              </Badge>
            )}
            
            {existingFeedback.feedback_text && (
              <div>
                <h4 className="font-medium mb-2">Your Feedback:</h4>
                <p className="text-gray-700">{existingFeedback.feedback_text}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Experience</CardTitle>
        <p className="text-gray-600">
          Help us improve by sharing your feedback for order #{orderNumber}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StarRating
              value={overallRating}
              onChange={setOverallRating}
              label="Overall Experience"
              icon={ThumbsUp}
            />
            <StarRating
              value={deliveryRating}
              onChange={setDeliveryRating}
              label="Delivery Service"
              icon={Truck}
            />
            <StarRating
              value={packagingRating}
              onChange={setPackagingRating}
              label="Packaging Quality"
              icon={Package}
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
              I would recommend Naaz Book Depot to others
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What did you like about your order?
            </label>
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={3}
              placeholder="Tell us what went well..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How can we improve? (Optional)
            </label>
            <Textarea
              value={improvementSuggestions}
              onChange={(e) => setImprovementSuggestions(e.target.value)}
              rows={3}
              placeholder="Share your suggestions for improvement..."
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-naaz-green hover:bg-naaz-green/90"
            disabled={createFeedback.isPending}
          >
            {createFeedback.isPending ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderFeedbackForm;
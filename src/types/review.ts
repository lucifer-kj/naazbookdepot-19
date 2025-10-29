import { Database } from './supabase';

export type Review = Database['public']['Tables']['reviews']['Row'];
export type ReviewReport = Database['public']['Tables']['review_reports']['Row'];
export type OrderFeedback = Database['public']['Tables']['order_feedback']['Row'];
export type ReviewAnalytics = Database['public']['Tables']['review_analytics']['Row'];
export type ReviewHelpfulVote = Database['public']['Tables']['review_helpful_votes']['Row'];

export interface EnhancedReview extends Review {
  profiles: {
    name: string | null;
    avatar_url: string | null;
  };
  analytics?: ReviewAnalytics;
  user_helpful_vote?: boolean;
  is_verified_purchase?: boolean;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    '5': number;
    '4': number;
    '3': number;
    '2': number;
    '1': number;
  };
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface ReviewModerationAction {
  reviewId: number;
  action: 'approve' | 'reject';
  notes?: string;
}

export interface ReviewReportData {
  reviewId: number;
  reason: 'spam' | 'inappropriate' | 'fake' | 'offensive' | 'other';
  description?: string;
}

export interface OrderFeedbackData {
  orderId: number;
  overallRating: number;
  deliveryRating: number;
  packagingRating: number;
  wouldRecommend: boolean;
  feedbackText?: string;
  improvementSuggestions?: string;
}

export interface SentimentAnalysisResult {
  score: number; // -1.00 to 1.00
  label: 'positive' | 'negative' | 'neutral';
  keywords: string[];
  readabilityScore: number;
  wordCount: number;
}
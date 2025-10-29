import { supabase } from '@/integrations/supabase/client';
import type { 
  EnhancedReview, 
  ReviewStats, 
  ReviewModerationAction, 
  ReviewReportData, 
  OrderFeedbackData,
  SentimentAnalysisResult 
} from '@/types/review';

export class ReviewService {
  // Get reviews for a product with enhanced data
  static async getProductReviews(
    productId: string, 
    options: {
      status?: 'pending' | 'approved' | 'rejected';
      limit?: number;
      offset?: number;
      userId?: string;
    } = {}
  ): Promise<EnhancedReview[]> {
    const { status = 'approved', limit = 50, offset = 0, userId } = options;
    
    let query = supabase
      .from('reviews')
      .select(`
        *,
        profiles!inner(name, avatar_url),
        review_analytics(sentiment_score, sentiment_label, keywords),
        ${userId ? `review_helpful_votes!left(is_helpful)` : ''}
      `)
      .eq('product_id', productId)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('review_helpful_votes.user_id', userId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data as any[]).map(review => ({
      ...review,
      user_helpful_vote: userId ? review.review_helpful_votes?.[0]?.is_helpful : undefined,
      is_verified_purchase: review.verified_purchase
    }));
  }

  // Get review statistics for a product
  static async getProductReviewStats(productId: string): Promise<ReviewStats> {
    const { data, error } = await supabase
      .rpc('get_product_review_stats', { product_uuid: parseInt(productId) });
    
    if (error) throw error;
    
    return data[0] || {
      total_reviews: 0,
      average_rating: 0,
      rating_distribution: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
      sentiment_distribution: { positive: 0, neutral: 0, negative: 0 }
    };
  }

  // Create a new review
  static async createReview(reviewData: {
    productId: string;
    userId: string;
    rating: number;
    title?: string;
    comment?: string;
    wouldRecommend?: boolean;
  }) {
    // Check if user has purchased the product
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('orders!inner(user_id, status)')
      .eq('product_id', reviewData.productId)
      .eq('orders.user_id', reviewData.userId)
      .in('orders.status', ['delivered', 'completed']);

    const verifiedPurchase = orderItems && orderItems.length > 0;

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: parseInt(reviewData.productId),
        user_id: reviewData.userId,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        would_recommend: reviewData.wouldRecommend || false,
        verified_purchase: verifiedPurchase,
        status: 'pending' // All reviews start as pending for moderation
      })
      .select()
      .single();

    if (error) throw error;

    // Analyze sentiment if comment exists
    if (reviewData.comment) {
      await this.analyzeSentiment(data.id, reviewData.comment);
    }

    return data;
  }

  // Update review helpful votes
  static async voteHelpful(reviewId: number, userId: string, isHelpful: boolean) {
    const { error } = await supabase
      .from('review_helpful_votes')
      .upsert({
        review_id: reviewId,
        user_id: userId,
        is_helpful: isHelpful
      });

    if (error) throw error;
  }

  // Report a review
  static async reportReview(reportData: ReviewReportData & { reporterId: string }) {
    const { error } = await supabase
      .from('review_reports')
      .insert({
        review_id: reportData.reviewId,
        reporter_id: reportData.reporterId,
        reason: reportData.reason,
        description: reportData.description
      });

    if (error) throw error;

    // Increment reported count
    const { data: currentReview } = await supabase
      .from('reviews')
      .select('reported_count')
      .eq('id', reportData.reviewId)
      .single();
    
    if (currentReview) {
      await supabase
        .from('reviews')
        .update({ 
          reported_count: (currentReview.reported_count || 0) + 1
        })
        .eq('id', reportData.reviewId);
    }
  }

  // Moderate review (admin only)
  static async moderateReview(moderationData: ReviewModerationAction & { moderatorId: string }) {
    const { error } = await supabase
      .from('reviews')
      .update({
        status: moderationData.action === 'approve' ? 'approved' : 'rejected',
        moderated_by: moderationData.moderatorId,
        moderated_at: new Date().toISOString(),
        moderation_notes: moderationData.notes
      })
      .eq('id', moderationData.reviewId);

    if (error) throw error;
  }

  // Get pending reviews for moderation
  static async getPendingReviews(limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles!inner(name, avatar_url),
        products!inner(title),
        review_reports(reason, description, created_at)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  // Create order feedback
  static async createOrderFeedback(feedbackData: OrderFeedbackData & { userId: string }) {
    const { error } = await supabase
      .from('order_feedback')
      .insert({
        order_id: feedbackData.orderId,
        user_id: feedbackData.userId,
        overall_rating: feedbackData.overallRating,
        delivery_rating: feedbackData.deliveryRating,
        packaging_rating: feedbackData.packagingRating,
        would_recommend: feedbackData.wouldRecommend,
        feedback_text: feedbackData.feedbackText,
        improvement_suggestions: feedbackData.improvementSuggestions
      });

    if (error) throw error;
  }

  // Get order feedback
  static async getOrderFeedback(orderId: number) {
    const { data, error } = await supabase
      .from('order_feedback')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Simple sentiment analysis (can be enhanced with external APIs)
  private static async analyzeSentiment(reviewId: number, comment: string): Promise<SentimentAnalysisResult> {
    // Basic sentiment analysis using keyword matching
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'wonderful', 'fantastic', 'awesome', 'best'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing', 'poor', 'useless'];
    
    const words = comment.toLowerCase().split(/\s+/);
    const wordCount = words.length;
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    const score = positiveCount > negativeCount ? 
      Math.min(0.8, positiveCount / wordCount * 5) : 
      Math.max(-0.8, -(negativeCount / wordCount * 5));
    
    const label = score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral';
    
    // Extract keywords (simple approach - can be enhanced)
    const keywords = words
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'been'].includes(word))
      .slice(0, 5);
    
    const readabilityScore = Math.min(1, wordCount / 50); // Simple readability metric
    
    const result: SentimentAnalysisResult = {
      score,
      label,
      keywords,
      readabilityScore,
      wordCount
    };
    
    // Store analytics
    await supabase
      .from('review_analytics')
      .insert({
        review_id: reviewId,
        sentiment_score: score,
        sentiment_label: label,
        keywords,
        readability_score: readabilityScore,
        word_count: wordCount
      });
    
    return result;
  }

  // Get review analytics dashboard data
  static async getReviewAnalytics(dateRange?: { from: string; to: string }) {
    let query = supabase
      .from('reviews')
      .select(`
        *,
        review_analytics(sentiment_label, sentiment_score),
        products(title, category)
      `);

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.from)
        .lte('created_at', dateRange.to);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Process analytics data
    const totalReviews = data.length;
    const averageRating = data.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    const sentimentCounts = data.reduce((acc, review) => {
      const sentiment = review.review_analytics?.[0]?.sentiment_label || 'neutral';
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryBreakdown = data.reduce((acc, review) => {
      const category = review.products?.category || 'Unknown';
      if (!acc[category]) {
        acc[category] = { count: 0, averageRating: 0, totalRating: 0 };
      }
      acc[category].count++;
      acc[category].totalRating += review.rating;
      acc[category].averageRating = acc[category].totalRating / acc[category].count;
      return acc;
    }, {} as Record<string, any>);

    return {
      totalReviews,
      averageRating,
      sentimentCounts,
      categoryBreakdown,
      reviewsOverTime: data.map(review => ({
        date: review.created_at,
        rating: review.rating,
        sentiment: review.review_analytics?.[0]?.sentiment_label
      }))
    };
  }
}
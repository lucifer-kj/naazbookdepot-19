-- Add review moderation and feedback fields
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES profiles(id);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS moderation_notes TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reported_count INTEGER DEFAULT 0;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create review reports table for handling inappropriate content
CREATE TABLE IF NOT EXISTS review_reports (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES profiles(id),
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'fake', 'offensive', 'other')),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order feedback table for post-purchase feedback
CREATE TABLE IF NOT EXISTS order_feedback (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  packaging_rating INTEGER CHECK (packaging_rating >= 1 AND packaging_rating <= 5),
  would_recommend BOOLEAN DEFAULT false,
  feedback_text TEXT,
  improvement_suggestions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_id, user_id)
);

-- Create review analytics table for sentiment analysis
CREATE TABLE IF NOT EXISTS review_analytics (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
  sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
  sentiment_label VARCHAR(20) CHECK (sentiment_label IN ('positive', 'negative', 'neutral')),
  keywords TEXT[], -- Array of extracted keywords
  readability_score DECIMAL(3,2),
  word_count INTEGER,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id)
);

-- Create helpful votes table for review helpfulness
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product_status ON reviews(product_id, status);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON review_reports(status);
CREATE INDEX IF NOT EXISTS idx_order_feedback_order_id ON order_feedback(order_id);
CREATE INDEX IF NOT EXISTS idx_review_analytics_sentiment ON review_analytics(sentiment_label);

-- Create function to update helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reviews 
  SET helpful_count = (
    SELECT COUNT(*) 
    FROM review_helpful_votes 
    WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
    AND is_helpful = true
  )
  WHERE id = COALESCE(NEW.review_id, OLD.review_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for helpful count updates
DROP TRIGGER IF EXISTS trigger_update_helpful_count ON review_helpful_votes;
CREATE TRIGGER trigger_update_helpful_count
  AFTER INSERT OR UPDATE OR DELETE ON review_helpful_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();

-- Create function to get product review statistics
CREATE OR REPLACE FUNCTION get_product_review_stats(product_uuid INTEGER)
RETURNS TABLE (
  total_reviews INTEGER,
  average_rating DECIMAL(3,2),
  rating_distribution JSON,
  sentiment_distribution JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_reviews,
    ROUND(AVG(r.rating), 2) as average_rating,
    JSON_BUILD_OBJECT(
      '5', COUNT(CASE WHEN r.rating = 5 THEN 1 END),
      '4', COUNT(CASE WHEN r.rating = 4 THEN 1 END),
      '3', COUNT(CASE WHEN r.rating = 3 THEN 1 END),
      '2', COUNT(CASE WHEN r.rating = 2 THEN 1 END),
      '1', COUNT(CASE WHEN r.rating = 1 THEN 1 END)
    ) as rating_distribution,
    JSON_BUILD_OBJECT(
      'positive', COUNT(CASE WHEN ra.sentiment_label = 'positive' THEN 1 END),
      'neutral', COUNT(CASE WHEN ra.sentiment_label = 'neutral' THEN 1 END),
      'negative', COUNT(CASE WHEN ra.sentiment_label = 'negative' THEN 1 END)
    ) as sentiment_distribution
  FROM reviews r
  LEFT JOIN review_analytics ra ON r.id = ra.review_id
  WHERE r.product_id = product_uuid AND r.status = 'approved';
END;
$$ LANGUAGE plpgsql;

-- Update existing reviews to approved status (for backward compatibility)
UPDATE reviews SET status = 'approved' WHERE status IS NULL;
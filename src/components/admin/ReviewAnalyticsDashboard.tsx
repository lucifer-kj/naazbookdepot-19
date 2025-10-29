import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  MessageSquare, 
  ThumbsUp,
  Calendar
} from 'lucide-react';
import { useReviewAnalytics } from '@/lib/hooks/useReviews';

const ReviewAnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>('30');
  
  const getDateRange = (days: string) => {
    const to = new Date().toISOString();
    const from = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000).toISOString();
    return { from, to };
  };

  const { data: analytics } = useReviewAnalytics(
    dateRange !== 'all' ? getDateRange(dateRange) : undefined
  );

  const COLORS = {
    positive: '#10B981',
    neutral: '#6B7280',
    negative: '#EF4444',
    primary: '#059669'
  };

  const sentimentData = analytics ? [
    { name: 'Positive', value: analytics.sentimentCounts.positive || 0, color: COLORS.positive },
    { name: 'Neutral', value: analytics.sentimentCounts.neutral || 0, color: COLORS.neutral },
    { name: 'Negative', value: analytics.sentimentCounts.negative || 0, color: COLORS.negative },
  ] : [];

  const categoryData = analytics ? Object.entries(analytics.categoryBreakdown).map(([category, data]) => ({
    category,
    count: data.count,
    averageRating: data.averageRating,
  })) : [];

  const reviewsOverTime = analytics ? 
    analytics.reviewsOverTime.reduce((acc: any[], review) => {
      const date = new Date(review.date).toLocaleDateString();
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.count += 1;
        existing.totalRating += review.rating;
        existing.averageRating = existing.totalRating / existing.count;
      } else {
        acc.push({
          date,
          count: 1,
          totalRating: review.rating,
          averageRating: review.rating
        });
      }
      return acc;
    }, []).slice(-30) : [];

  if (!analytics) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-naaz-green">Review Analytics</h2>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-3xl font-bold text-naaz-green">{analytics.totalReviews}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-naaz-green" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-3xl font-bold text-naaz-green">
                  {analytics.averageRating.toFixed(1)}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Positive Sentiment</p>
                <p className="text-3xl font-bold text-green-600">
                  {Math.round((analytics.sentimentCounts.positive / analytics.totalReviews) * 100)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Negative Sentiment</p>
                <p className="text-3xl font-bold text-red-600">
                  {Math.round((analytics.sentimentCounts.negative / analytics.totalReviews) * 100)}%
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reviews by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={reviewsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="count" fill={COLORS.primary} name="Review Count" />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="averageRating" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Average Rating"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.map((category) => (
              <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{category.category}</h4>
                  <p className="text-sm text-gray-600">{category.count} reviews</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{category.averageRating.toFixed(1)}</span>
                  </div>
                  <Badge 
                    variant={category.averageRating >= 4 ? 'default' : category.averageRating >= 3 ? 'secondary' : 'destructive'}
                  >
                    {category.averageRating >= 4 ? 'Excellent' : category.averageRating >= 3 ? 'Good' : 'Needs Improvement'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewAnalyticsDashboard;
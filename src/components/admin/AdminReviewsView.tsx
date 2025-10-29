import React, { useState } from 'react';

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import { 
  AlertTriangle, 
  MoreVertical, 
  Star, 
  Trash, 
  CheckCircle, 
  XCircle, 
  Flag,
  TrendingUp,
  Award
} from 'lucide-react';

// Utilities and Hooks
import { 
  useProductReviews, 
  useDeleteReview, 
  usePendingReviews,
  useModerateReview,
  useReviewAnalytics
} from '@/lib/hooks/useReviews';
import { formatDate } from '@/lib/utils/date';
import { toast } from 'sonner';

export function AdminReviewsView({ productId }: { productId?: string }) {
  const { data: reviews, isLoading } = useProductReviews(productId || '', undefined);
  const { data: pendingReviews, isLoading: pendingLoading } = usePendingReviews();
  const { data: analytics } = useReviewAnalytics();
  const [selectedReview, setSelectedReview] = useState<number | null>(null);
  const [moderationNotes, setModerationNotes] = useState('');
  const deleteReview = useDeleteReview();
  const moderateReview = useModerateReview();

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview.mutateAsync(reviewId);
      toast.success('Review deleted successfully');
    } catch (error) {
      toast.error('Failed to delete review');
      console.error('Error deleting review:', error);
    }
  };

  const handleModerateReview = async (reviewId: number, action: 'approve' | 'reject') => {
    try {
      await moderateReview.mutateAsync({
        reviewId,
        action,
        notes: moderationNotes,
      });
      setSelectedReview(null);
      setModerationNotes('');
    } catch (error) {
      toast.error('Failed to moderate review');
      console.error('Error moderating review:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-naaz-green">
                {analytics.totalReviews}
              </div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-naaz-green">
                {analytics.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {analytics.sentimentCounts.positive || 0}
              </div>
              <div className="text-sm text-gray-600">Positive Reviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {analytics.sentimentCounts.negative || 0}
              </div>
              <div className="text-sm text-gray-600">Negative Reviews</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Reviews ({pendingReviews?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="all">All Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Reviews Awaiting Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead>Sentiment</TableHead>
                      <TableHead>Reports</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingLoading ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <Skeleton className="w-full h-12" />
                        </TableCell>
                      </TableRow>
                    ) : pendingReviews?.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={review.profiles.avatar_url || ''} />
                              <AvatarFallback>
                                {review.profiles.name?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{review.profiles.name}</div>
                              {review.verified_purchase && (
                                <Badge variant="secondary" className="text-xs">
                                  <Award className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-32 truncate">
                            {review.products?.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{review.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div>
                            {review.title && (
                              <div className="font-medium text-sm mb-1">{review.title}</div>
                            )}
                            <p className="truncate text-sm text-gray-600">{review.comment}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {review.analytics?.[0] && (
                            <Badge 
                              variant="outline"
                              className={
                                review.analytics[0].sentiment_label === 'positive' ? 'text-green-600' :
                                review.analytics[0].sentiment_label === 'negative' ? 'text-red-600' :
                                'text-gray-600'
                              }
                            >
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {review.analytics[0].sentiment_label}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {review.review_reports && review.review_reports.length > 0 && (
                            <Badge variant="destructive">
                              <Flag className="w-3 h-3 mr-1" />
                              {review.review_reports.length}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleModerateReview(review.id, 'approve')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedReview(review.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Product Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Skeleton className="w-full h-12" />
                        </TableCell>
                      </TableRow>
                    ) : reviews?.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={review.profiles.avatar_url || ''} />
                              <AvatarFallback>
                                {review.profiles.name?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span>{review.profiles.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{review.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="truncate">{review.comment}</p>
                        </TableCell>
                        <TableCell>{formatDate(review.created_at)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              review.status === 'approved' ? 'default' :
                              review.status === 'rejected' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {review.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setSelectedReview(review.id)}
                              >
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteReview(review.id.toString())}
                                className="text-destructive"
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Delete Review
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Moderation Dialog */}
      {selectedReview && (
        <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Moderation</DialogTitle>
              <DialogDescription>
                Review the content and decide whether to approve or reject this review.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moderation Notes (Optional)
                </label>
                <Textarea
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes about your moderation decision..."
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleModerateReview(selectedReview, 'approve')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Review
                </Button>
                <Button
                  onClick={() => handleModerateReview(selectedReview, 'reject')}
                  variant="destructive"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Review
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


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

// Icons
import { AlertTriangle, MoreVertical, Star, Trash } from 'lucide-react';

// Utilities and Hooks
import { useProductReviews, useDeleteReview } from '@/lib/hooks/useReviews';
import { formatDate } from '@/lib/utils/date';
import { toast } from 'sonner';

export function AdminReviewsView({ productId }: { productId?: string }) {
  const { data: reviews, isLoading } = useProductReviews(productId || '');
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const deleteReview = useDeleteReview();

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview.mutateAsync(reviewId);
      toast.success('Review deleted successfully');
    } catch (error) {
      toast.error('Failed to delete review');
      console.error('Error deleting review:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Reviews</CardTitle>
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
                    <Badge variant="secondary">Pending</Badge>
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
                          onClick={() => handleDeleteReview(review.id)}
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

      {selectedReview && (
        <ReviewDetailsDialog
          reviewId={selectedReview}
          open={!!selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </Card>
  );
}

function ReviewDetailsDialog({
  reviewId,
  open,
  onClose,
}: {
  reviewId: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data: reviews } = useProductReviews(reviewId);
  const review = reviews?.find((r) => r.id === reviewId);

  if (!review) return null;

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review Details</DialogTitle>
          <DialogDescription>
            Review by {review.profiles.name} on{' '}
            {formatDate(review.created_at)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-lg font-semibold">{review.rating}</span>
            </div>
            <p className="text-sm text-muted-foreground">{review.comment}</p>
          </div>

          {/* Report count currently not supported */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { OrderWithItems } from '@/lib/hooks/useOrders';
import type { BadgeVariant } from '@/lib/utils';

interface AdminOrderDetailHeaderProps {
  order: OrderWithItems;
  selectedStatus: string;
  onStatusChange: (newStatus: string) => void;
  onUpdateStatus: () => Promise<void>;
  isUpdatingStatus: boolean;
  updateError: Error | null; // Or string message
  orderStatuses: string[];
  getStatusBadgeVariant: (status: string | null) => BadgeVariant;
  formatCurrency: (amount: number | null | undefined) => string;
}

const AdminOrderDetailHeader: React.FC<AdminOrderDetailHeaderProps> = ({
  order,
  selectedStatus,
  onStatusChange,
  onUpdateStatus,
  isUpdatingStatus,
  updateError,
  orderStatuses,
  getStatusBadgeVariant,
  formatCurrency,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-naaz-green">Order #{order.order_number}</h1>
          <p className="text-sm text-gray-500">
            Placed on: {format(new Date(order.created_at), "PPP p")}
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <Badge variant={getStatusBadgeVariant(order.status)} className="text-sm capitalize px-3 py-1">
            {order.status || 'Unknown'}
          </Badge>
          <p className="text-2xl font-semibold text-naaz-gold">{formatCurrency(order.total_amount)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <Label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700 mb-1">Update Order Status:</Label>
          <div className="flex gap-2">
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger id="orderStatus" className="flex-grow border rounded-lg px-3 py-2 focus:ring-2 focus:ring-naaz-green">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {orderStatuses.map(status => (
                  <SelectItem key={status} value={status} className="capitalize">
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={onUpdateStatus}
              disabled={isUpdatingStatus || selectedStatus === order.status}
              className="bg-naaz-green text-white hover:bg-naaz-green/90 px-6 min-w-[120px]"
            >
              {isUpdatingStatus ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update'}
            </Button>
          </div>
        </div>
      </div>
      {updateError && (
        <p className="text-sm text-red-500 mt-2">Error updating status: {(updateError as any)?.message || 'Unknown error'}</p>
      )}
    </div>
  );
};

export default AdminOrderDetailHeader;


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useOrderDetails, useAddOrderNote, useUpdateOrderItems } from '@/lib/hooks/admin/useOrderDetails';
import { useUpdateOrderStatus } from '@/lib/hooks/admin/useAdminOrders';
import { Package, User, MapPin, Clock, FileText, Edit, Save, X } from 'lucide-react';
import { format } from 'date-fns';

interface OrderDetailsModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal = ({ orderId, isOpen, onClose }: OrderDetailsModalProps) => {
  const { data, isLoading } = useOrderDetails(orderId);
  const addOrderNote = useAddOrderNote();
  const updateOrderStatus = useUpdateOrderStatus();
  const updateOrderItems = useUpdateOrderItems();

  const [newNote, setNewNote] = useState('');
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [editingItems, setEditingItems] = useState(false);
  const [itemUpdates, setItemUpdates] = useState<Record<string, { quantity: number; price: number }>>({});

  if (isLoading || !data) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-naaz-green"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { order, statusHistory, notes } = data;

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await addOrderNote.mutateAsync({
        orderId,
        note: newNote,
        isInternal: true
      });
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;

    try {
      await updateOrderStatus.mutateAsync({
        orderId,
        status: newStatus as any,
        trackingNumber: trackingNumber || undefined
      });
      setEditingStatus(false);
      setNewStatus('');
      setTrackingNumber('');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSaveItemUpdates = async () => {
    const updates = Object.entries(itemUpdates).map(([itemId, update]) => ({
      id: itemId,
      ...update
    }));

    if (updates.length === 0) {
      setEditingItems(false);
      return;
    }

    try {
      await updateOrderItems.mutateAsync({
        orderId,
        items: updates
      });
      setEditingItems(false);
      setItemUpdates({});
    } catch (error) {
      console.error('Error updating items:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Order #{order.order_number || order.id.slice(0, 8)}</span>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Order Items
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (editingItems) {
                      setEditingItems(false);
                      setItemUpdates({});
                    } else {
                      setEditingItems(true);
                      // Initialize item updates with current values
                      const initialUpdates: Record<string, { quantity: number; price: number }> = {};
                      order.order_items?.forEach(item => {
                        initialUpdates[item.id] = {
                          quantity: item.quantity,
                          price: item.price
                        };
                      });
                      setItemUpdates(initialUpdates);
                    }
                  }}
                >
                  {editingItems ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  {editingItems ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              <div className="space-y-3">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      {item.products?.images?.[0] && (
                        <img
                          src={item.products.images[0]}
                          alt={item.products?.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{item.products?.name}</h4>
                        <p className="text-sm text-gray-500">SKU: {item.product_id.slice(0, 8)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {editingItems ? (
                        <>
                          <div className="flex items-center space-x-2">
                            <label className="text-sm">Qty:</label>
                            <Input
                              type="number"
                              min="1"
                              value={itemUpdates[item.id]?.quantity || item.quantity}
                              onChange={(e) => setItemUpdates(prev => ({
                                ...prev,
                                [item.id]: {
                                  ...prev[item.id],
                                  quantity: parseInt(e.target.value) || 1
                                }
                              }))}
                              className="w-16"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="text-sm">₹</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={itemUpdates[item.id]?.price || item.price}
                              onChange={(e) => setItemUpdates(prev => ({
                                ...prev,
                                [item.id]: {
                                  ...prev[item.id],
                                  price: parseFloat(e.target.value) || 0
                                }
                              }))}
                              className="w-20"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-sm">Qty: {item.quantity}</span>
                          <span className="font-medium">₹{item.price}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {editingItems && (
                <div className="flex justify-end space-x-2 mt-4">
                  <Button onClick={handleSaveItemUpdates} disabled={updateOrderItems.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}

              <div className="text-right mt-4 pt-4 border-t">
                <span className="text-lg font-bold">Total: ₹{order.total}</span>
              </div>
            </div>

            {/* Customer & Shipping Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-lg font-semibold flex items-center mb-3">
                  <User className="h-4 w-4 mr-2" />
                  Customer Details
                </h3>
                <div className="space-y-2">
                  <p><strong>Order Date:</strong> {format(new Date(order.created_at!), 'PPp')}</p>
                  <p><strong>Payment Method:</strong> {order.payment_method?.toUpperCase()}</p>
                  <p><strong>Payment Status:</strong> {order.payment_status}</p>
                  {order.upi_reference_code && (
                    <p><strong>UPI Reference:</strong> {order.upi_reference_code}</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-lg font-semibold flex items-center mb-3">
                  <MapPin className="h-4 w-4 mr-2" />
                  Shipping Address
                </h3>
                {order.shipping_address && (
                  <div className="space-y-1 text-sm">
                    <p>{(order.shipping_address as any).name}</p>
                    <p>{(order.shipping_address as any).line1}</p>
                    {(order.shipping_address as any).line2 && <p>{(order.shipping_address as any).line2}</p>}
                    <p>{(order.shipping_address as any).city}, {(order.shipping_address as any).state}</p>
                    <p>{(order.shipping_address as any).postalCode}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-semibold mb-3">Status Management</h3>
              
              {editingStatus ? (
                <div className="space-y-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  
                  <Input
                    placeholder="Tracking Number (optional)"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                  
                  <div className="flex space-x-2">
                    <Button onClick={handleStatusUpdate} disabled={updateOrderStatus.isPending}>
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingStatus(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setEditingStatus(true)} className="w-full">
                  Update Status
                </Button>
              )}
            </div>

            {/* Status History */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-semibold flex items-center mb-3">
                <Clock className="h-4 w-4 mr-2" />
                Status History
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {statusHistory?.map((history) => (
                  <div key={history.id} className="text-sm border-l-2 border-gray-200 pl-3">
                    <div className="flex justify-between items-start">
                      <Badge className={getStatusColor(history.status)} variant="secondary">
                        {history.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {format(new Date(history.created_at), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    {history.notes && <p className="text-gray-600 mt-1">{history.notes}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-semibold flex items-center mb-3">
                <FileText className="h-4 w-4 mr-2" />
                Order Notes
              </h3>
              
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {notes?.map((note) => (
                  <div key={note.id} className="text-sm p-2 bg-gray-50 rounded border-l-4 border-blue-200">
                    <p>{note.note}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(note.created_at), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Add internal note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={handleAddNote} 
                  disabled={addOrderNote.isPending || !newNote.trim()}
                  size="sm"
                  className="w-full"
                >
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;

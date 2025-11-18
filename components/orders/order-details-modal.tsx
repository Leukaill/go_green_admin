'use client';

import { useState } from 'react';
import { X, Package, Truck, CheckCircle, Clock, XCircle, ChefHat, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { updateOrderStatus, type Order, type OrderStatus } from '@/lib/data/orders';
import { formatPrice } from '@/lib/utils';
import { format } from 'date-fns';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
  onUpdate: () => void;
}

export function OrderDetailsModal({ order, onClose, onUpdate }: OrderDetailsModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [note, setNote] = useState('');

  const statusOptions: Array<{ value: OrderStatus; label: string; icon: any; color: string }> = [
    { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-500' },
    { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'bg-blue-500' },
    { value: 'preparing', label: 'Preparing', icon: ChefHat, color: 'bg-purple-500' },
    { value: 'out-for-delivery', label: 'Out for Delivery', icon: Truck, color: 'bg-orange-500' },
    { value: 'delivered', label: 'Delivered', icon: Package, color: 'bg-green-500' },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-500' },
  ];

  const handleUpdateStatus = () => {
    if (selectedStatus === order.status && !note) {
      toast.error('No changes to save');
      return;
    }

    updateOrderStatus(order.id, selectedStatus, note);
    toast.success(`Order status updated to ${selectedStatus}!`);
    toast.success('Customer has been notified via email');
    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-1">Order Management</h2>
              <div className="flex items-center gap-3">
                <span className="text-white/90">Order ID:</span>
                <span className="font-mono font-bold text-lg bg-white/20 px-3 py-1 rounded">
                  {order.id}
                </span>
                <span className="text-white/70">•</span>
                <span className="text-white/90">
                  {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Customer & Delivery Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <h3 className="font-bold text-lg mb-4 text-blue-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  👤
                </div>
                Customer Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-blue-700 font-medium min-w-[60px]">Name:</span>
                  <span className="font-semibold text-gray-900">{order.customerName}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-700 font-medium min-w-[60px]">Email:</span>
                  <span className="text-gray-700">{order.customerEmail}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-700 font-medium min-w-[60px]">Phone:</span>
                  <span className="text-gray-700 font-mono">{order.customerPhone}</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-5">
              <h3 className="font-bold text-lg mb-4 text-orange-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">
                  🚚
                </div>
                Delivery Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-orange-700 font-medium min-w-[70px]">Address:</span>
                  <span className="text-gray-900 font-medium">{order.deliveryAddress}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-700 font-medium min-w-[70px]">Date:</span>
                  <span className="text-gray-700">{order.deliveryDate}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-700 font-medium min-w-[70px]">Time Slot:</span>
                  <span className="text-gray-700 capitalize">{order.deliverySlot}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
            <h3 className="font-bold text-lg mb-4 text-purple-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white">
                🛒
              </div>
              Order Items
            </h3>
            <div className="bg-white border border-purple-200 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold">Product</th>
                    <th className="text-center p-3 text-sm font-semibold">Quantity</th>
                    <th className="text-right p-3 text-sm font-semibold">Price</th>
                    <th className="text-right p-3 text-sm font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3">{item.productName}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">{formatPrice(item.price)}</td>
                      <td className="p-3 text-right font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t bg-muted/30">
                  <tr>
                    <td colSpan={3} className="p-3 text-right font-semibold">Subtotal:</td>
                    <td className="p-3 text-right font-semibold">{formatPrice(order.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="p-3 text-right">Delivery Fee:</td>
                    <td className="p-3 text-right">{formatPrice(order.deliveryFee)}</td>
                  </tr>
                  <tr className="border-t">
                    <td colSpan={3} className="p-3 text-right font-bold text-lg">Total:</td>
                    <td className="p-3 text-right font-bold text-lg text-primary">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
            <h3 className="font-bold text-xl mb-2 text-green-900 flex items-center gap-2">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-lg">
                ⚡
              </div>
              Update Order Status
            </h3>
            <p className="text-sm text-green-700 mb-5">Select a new status and notify the customer instantly</p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedStatus === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStatus(option.value)}
                    className={`p-5 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      isSelected
                        ? 'border-green-500 bg-white shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`p-3 rounded-full ${option.color} text-white shadow-md`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className={`text-sm font-semibold ${isSelected ? 'text-green-700' : 'text-gray-700'}`}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <div className="w-full h-1 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-white rounded-lg p-4 border-2 border-green-200">
              <label className="text-sm font-bold mb-2 block text-green-900 flex items-center gap-2">
                💬 Add Note for Customer (Optional)
              </label>
              <p className="text-xs text-green-700 mb-3">This message will be sent to the customer along with the status update</p>
              <Textarea
                placeholder="e.g., Your order will arrive between 9-10 AM. Our driver will call you 10 minutes before arrival."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="border-green-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Status History */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h3 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white">
                📋
              </div>
              Status History
            </h3>
            <div className="space-y-3">
              {order.statusHistory.map((history, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border-l-4 border-green-500 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold capitalize text-gray-900 text-sm">
                      {history.status.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {format(new Date(history.timestamp), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  {history.note && (
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded italic">
                      &ldquo;{history.note}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Current Status:</span>{' '}
            <span className="capitalize font-bold text-gray-900">{order.status.replace('-', ' ')}</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} size="lg">
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} size="lg" className="bg-green-600 hover:bg-green-700">
              <Send className="h-5 w-5 mr-2" />
              Update & Notify Customer
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

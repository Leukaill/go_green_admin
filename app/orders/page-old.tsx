'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Truck, CheckCircle, XCircle, Clock, Package, ChefHat, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { getOrders, type Order, type OrderStatus } from '@/lib/data/orders';
import { OrderDetailsModal } from '@/components/orders/order-details-modal';
import { format } from 'date-fns';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();

    // Listen for updates
    const handleUpdate = () => loadOrders();
    window.addEventListener('orders-updated', handleUpdate);
    return () => window.removeEventListener('orders-updated', handleUpdate);
  }, []);

  const loadOrders = () => {
    setOrders(getOrders());
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'preparing':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'out-for-delivery':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'preparing':
        return <ChefHat className="h-4 w-4" />;
      case 'out-for-delivery':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <Package className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusCount = (status: OrderStatus) => {
    return orders.filter(o => o.status === status).length;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground mt-1">Manage and track customer orders in real-time</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{orders.length}</div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{getStatusCount('pending')}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{getStatusCount('confirmed')}</div>
            <div className="text-sm text-muted-foreground">Confirmed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{getStatusCount('preparing')}</div>
            <div className="text-sm text-muted-foreground">Preparing</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{getStatusCount('out-for-delivery')}</div>
            <div className="text-sm text-muted-foreground">In Transit</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{getStatusCount('delivered')}</div>
            <div className="text-sm text-muted-foreground">Delivered</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                <Clock className="h-4 w-4 mr-1" />
                Pending
              </Button>
              <Button
                variant={statusFilter === 'confirmed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('confirmed')}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Confirmed
              </Button>
              <Button
                variant={statusFilter === 'preparing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('preparing')}
              >
                <ChefHat className="h-4 w-4 mr-1" />
                Preparing
              </Button>
              <Button
                variant={statusFilter === 'out-for-delivery' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('out-for-delivery')}
              >
                <Truck className="h-4 w-4 mr-1" />
                In Transit
              </Button>
              <Button
                variant={statusFilter === 'delivered' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('delivered')}
              >
                <Package className="h-4 w-4 mr-1" />
                Delivered
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">No orders found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No orders have been placed yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Order Info */}
                  <div className="flex-1 grid grid-cols-5 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Order ID</div>
                      <div className="font-mono font-bold">{order.id}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(order.createdAt), 'MMM d, h:mm a')}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Customer</div>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-sm text-muted-foreground">{order.customerPhone}</div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Items & Total</div>
                      <div className="font-medium">{order.items.length} items</div>
                      <div className="text-lg font-bold text-primary">{formatPrice(order.total)}</div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Delivery</div>
                      <div className="text-sm">{order.deliveryDate}</div>
                      <div className="text-sm text-muted-foreground capitalize">{order.deliverySlot}</div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Status</div>
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status.replace('-', ' ')}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Manage Order
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={loadOrders}
        />
      )}
    </div>
  );
}

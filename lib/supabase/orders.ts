import { supabase } from './client';

// ============================================
// TYPES
// ============================================

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cash_on_delivery' | 'mobile_money' | 'bank_transfer' | 'card';
export type DeliveryType = 'pickup' | 'delivery';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  product_sku?: string;
  product_image_url?: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  
  // Customer
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  
  // Order details
  status: OrderStatus;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  discount: number;
  total: number;
  
  // Payment
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_reference?: string;
  paid_at?: string;
  
  // Delivery
  delivery_type: DeliveryType;
  delivery_address?: string;
  delivery_city?: string;
  delivery_notes?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  
  // Notes
  customer_notes?: string;
  admin_notes?: string;
  
  // Tracking
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  
  // Admin
  assigned_to_id?: string;
  assigned_to_email?: string;
  
  // Relations
  order_items?: OrderItem[];
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  old_status?: OrderStatus;
  new_status: OrderStatus;
  changed_by_id?: string;
  changed_by_email?: string;
  changed_by_role: 'customer' | 'admin' | 'system';
  notes?: string;
  created_at: string;
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

/**
 * Get all orders (admin only)
 */
export async function getAllOrders(): Promise<{ orders: Order[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { orders: data || [] };
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return { orders: [], error: error.message };
  }
}

/**
 * Get orders by status (admin)
 */
export async function getOrdersByStatus(status: OrderStatus): Promise<{ orders: Order[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { orders: data || [] };
  } catch (error: any) {
    console.error('Error fetching orders by status:', error);
    return { orders: [], error: error.message };
  }
}

/**
 * Get single order with full details (admin)
 */
export async function getOrderById(orderId: string): Promise<{ order: Order | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return { order: data };
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return { order: null, error: error.message };
  }
}

/**
 * Update order status (admin only)
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        admin_notes: notes || undefined
      })
      .eq('id', orderId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update order details (admin)
 */
export async function updateOrder(
  orderId: string,
  updates: Partial<Order>
): Promise<{ order: Order | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return { order: data };
  } catch (error: any) {
    console.error('Error updating order:', error);
    return { order: null, error: error.message };
  }
}

/**
 * Get order status history
 */
export async function getOrderStatusHistory(orderId: string): Promise<{ history: OrderStatusHistory[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { history: data || [] };
  } catch (error: any) {
    console.error('Error fetching order history:', error);
    return { history: [], error: error.message };
  }
}

/**
 * Get order statistics (admin)
 */
export async function getOrderStats(): Promise<{
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    processing: number;
    delivered: number;
    cancelled: number;
    totalRevenue: number;
    pendingRevenue: number;
  };
  error?: string;
}> {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, total, payment_status');

    if (error) throw error;

    const stats = {
      total: orders?.length || 0,
      pending: orders?.filter(o => o.status === 'pending').length || 0,
      confirmed: orders?.filter(o => o.status === 'confirmed').length || 0,
      processing: orders?.filter(o => o.status === 'processing').length || 0,
      delivered: orders?.filter(o => o.status === 'delivered').length || 0,
      cancelled: orders?.filter(o => o.status === 'cancelled').length || 0,
      totalRevenue: orders?.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + Number(o.total), 0) || 0,
      pendingRevenue: orders?.filter(o => o.payment_status === 'pending').reduce((sum, o) => sum + Number(o.total), 0) || 0,
    };

    return { stats };
  } catch (error: any) {
    console.error('Error fetching order stats:', error);
    return {
      stats: {
        total: 0,
        pending: 0,
        confirmed: 0,
        processing: 0,
        delivered: 0,
        cancelled: 0,
        totalRevenue: 0,
        pendingRevenue: 0,
      },
      error: error.message
    };
  }
}

// ============================================
// CUSTOMER FUNCTIONS
// ============================================

/**
 * Get customer's own orders
 */
export async function getMyOrders(): Promise<{ orders: Order[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { orders: data || [] };
  } catch (error: any) {
    console.error('Error fetching my orders:', error);
    return { orders: [], error: error.message };
  }
}

/**
 * Get single order (customer's own)
 */
export async function getMyOrder(orderId: string): Promise<{ order: Order | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return { order: data };
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return { order: null, error: error.message };
  }
}

/**
 * Create new order
 */
export async function createOrder(orderData: {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: {
    product_id: string;
    product_name: string;
    product_sku?: string;
    product_image_url?: string;
    unit_price: number;
    quantity: number;
  }[];
  payment_method: PaymentMethod;
  delivery_type: DeliveryType;
  delivery_address?: string;
  delivery_city?: string;
  delivery_notes?: string;
  customer_notes?: string;
}): Promise<{ order: Order | null; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    // Calculate totals
    const subtotal = orderData.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const delivery_fee = orderData.delivery_type === 'delivery' ? 2000 : 0;
    const total = subtotal + delivery_fee;

    // Generate order number
    const { data: orderNumberData } = await supabase.rpc('generate_order_number');
    const order_number = orderNumberData || `ORD-${Date.now()}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number,
        customer_id: user?.id,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        subtotal,
        delivery_fee,
        total,
        payment_method: orderData.payment_method,
        delivery_type: orderData.delivery_type,
        delivery_address: orderData.delivery_address,
        delivery_city: orderData.delivery_city,
        delivery_notes: orderData.delivery_notes,
        customer_notes: orderData.customer_notes,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      product_image_url: item.product_image_url,
      unit_price: item.unit_price,
      quantity: item.quantity,
      subtotal: item.unit_price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return { order };
  } catch (error: any) {
    console.error('Error creating order:', error);
    return { order: null, error: error.message };
  }
}

/**
 * Cancel order (customer - only if pending)
 */
export async function cancelMyOrder(orderId: string, reason: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .eq('status', 'pending'); // Only allow cancelling pending orders

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribe to order status changes
 */
export function subscribeToOrderUpdates(
  orderId: string,
  callback: (order: Order) => void
) {
  const channel = supabase
    .channel(`order:${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        callback(payload.new as Order);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to all order changes (admin)
 */
export function subscribeToAllOrders(callback: (order: Order) => void) {
  const channel = supabase
    .channel('all-orders')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          callback(payload.new as Order);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

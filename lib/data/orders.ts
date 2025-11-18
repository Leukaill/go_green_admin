export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliverySlot: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

const STORAGE_KEY = 'orders';

// Initialize with mock data
const defaultOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Jean Uwimana',
    customerEmail: 'jean@example.com',
    customerPhone: '0788123456',
    deliveryAddress: 'KG 15 Ave, Kigali',
    deliveryDate: '2025-11-08',
    deliverySlot: 'morning',
    items: [
      { id: '1', productName: 'Fresh Tomatoes', quantity: 2, price: 2500 },
      { id: '2', productName: 'Organic Carrots', quantity: 3, price: 1800 },
    ],
    subtotal: 10400,
    deliveryFee: 3000,
    total: 13400,
    status: 'pending',
    statusHistory: [
      { status: 'pending', timestamp: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Load orders from localStorage
export function getOrders(): Order[] {
  if (typeof window === 'undefined') return defaultOrders;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    } else {
      // Initialize with default data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultOrders));
      return defaultOrders;
    }
  } catch (error) {
    console.error('Failed to load orders:', error);
    return defaultOrders;
  }
}

// Save orders to localStorage
export function saveOrders(orders: Order[]) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event('orders-updated'));
  } catch (error) {
    console.error('Failed to save orders:', error);
  }
}

// Get single order
export function getOrder(id: string): Order | undefined {
  return getOrders().find(order => order.id === id);
}

// Update order status
export function updateOrderStatus(
  orderId: string, 
  newStatus: OrderStatus, 
  note?: string
) {
  const orders = getOrders();
  const updated = orders.map(order => {
    if (order.id === orderId) {
      return {
        ...order,
        status: newStatus,
        statusHistory: [
          ...order.statusHistory,
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            note,
          }
        ],
        updatedAt: new Date().toISOString(),
      };
    }
    return order;
  });
  
  saveOrders(updated);
  
  // Send notification (you can implement email/SMS here)
  sendStatusNotification(orderId, newStatus);
}

// Send notification to customer
function sendStatusNotification(orderId: string, status: OrderStatus) {
  const order = getOrder(orderId);
  if (!order) return;
  
  // Store notification in localStorage for customer to see
  const notifications = JSON.parse(localStorage.getItem('order-notifications') || '[]');
  notifications.push({
    orderId,
    customerEmail: order.customerEmail,
    status,
    timestamp: new Date().toISOString(),
    message: getStatusMessage(status),
  });
  localStorage.setItem('order-notifications', JSON.stringify(notifications));
  
  console.log(`Notification sent to ${order.customerEmail}: Order ${orderId} is now ${status}`);
}

// Get status message for customer
function getStatusMessage(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'Your order has been received and is pending confirmation.';
    case 'confirmed':
      return 'Great news! Your order has been confirmed and will be prepared soon.';
    case 'preparing':
      return 'We are carefully preparing your fresh produce order!';
    case 'out-for-delivery':
      return 'Your order is on its way! Our delivery team will arrive soon.';
    case 'delivered':
      return 'Your order has been delivered! Enjoy your fresh produce!';
    case 'cancelled':
      return 'Your order has been cancelled. Please contact us if you have questions.';
    default:
      return 'Order status updated.';
  }
}

// Add note to order
export function addOrderNote(orderId: string, note: string) {
  const orders = getOrders();
  const updated = orders.map(order => {
    if (order.id === orderId) {
      return {
        ...order,
        notes: note,
        updatedAt: new Date().toISOString(),
      };
    }
    return order;
  });
  
  saveOrders(updated);
}

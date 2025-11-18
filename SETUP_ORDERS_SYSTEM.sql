-- ============================================
-- COMPREHENSIVE ORDERS SYSTEM
-- ============================================
-- Features:
-- - Order management with status tracking
-- - Order items with product details
-- - Customer information
-- - Payment tracking
-- - Delivery information
-- - Admin status updates
-- - Real-time notifications
-- - Audit logging
-- ============================================

-- Drop existing objects
DROP TRIGGER IF EXISTS orders_updated_at ON orders;
DROP TRIGGER IF EXISTS orders_status_change ON orders;
DROP TRIGGER IF EXISTS order_items_updated_at ON order_items;
DROP FUNCTION IF EXISTS update_orders_updated_at();
DROP FUNCTION IF EXISTS notify_order_status_change();
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;

-- Create enums
CREATE TYPE order_status AS ENUM (
  'pending',           -- Order placed, awaiting confirmation
  'confirmed',         -- Order confirmed by admin
  'processing',        -- Order being prepared
  'ready_for_pickup',  -- Ready for customer pickup
  'out_for_delivery',  -- Out for delivery
  'delivered',         -- Successfully delivered
  'cancelled',         -- Cancelled by customer or admin
  'refunded'          -- Payment refunded
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'paid',
  'failed',
  'refunded'
);

CREATE TYPE payment_method AS ENUM (
  'cash_on_delivery',
  'mobile_money',
  'bank_transfer',
  'card'
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  
  -- Customer Information
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  
  -- Order Details
  status order_status DEFAULT 'pending' NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Payment
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'pending' NOT NULL,
  payment_reference TEXT,
  paid_at TIMESTAMPTZ,
  
  -- Delivery
  delivery_type TEXT CHECK (delivery_type IN ('pickup', 'delivery')) DEFAULT 'delivery',
  delivery_address TEXT,
  delivery_city TEXT,
  delivery_notes TEXT,
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  
  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Admin tracking
  assigned_to_id UUID,
  assigned_to_email TEXT
);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  
  -- Product Information (snapshot at time of order)
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  product_image_url TEXT,
  
  -- Pricing
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10, 2) NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDER STATUS HISTORY TABLE
-- ============================================
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  
  -- Status Change
  old_status order_status,
  new_status order_status NOT NULL,
  
  -- Who changed it
  changed_by_id UUID,
  changed_by_email TEXT,
  changed_by_role TEXT CHECK (changed_by_role IN ('customer', 'admin', 'system')),
  
  -- Details
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update timestamp
CREATE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Log status changes
CREATE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  admin_email TEXT;
  admin_role TEXT;
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Try to get admin info
    SELECT email INTO admin_email
    FROM admins
    WHERE id = auth.uid()
    LIMIT 1;
    
    IF admin_email IS NOT NULL THEN
      admin_role := 'admin';
    ELSE
      admin_email := NEW.customer_email;
      admin_role := 'customer';
    END IF;
    
    -- Insert status history
    INSERT INTO order_status_history (
      order_id,
      old_status,
      new_status,
      changed_by_id,
      changed_by_email,
      changed_by_role,
      notes
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      admin_email,
      admin_role,
      CASE 
        WHEN NEW.status = 'confirmed' THEN 'Order confirmed by admin'
        WHEN NEW.status = 'processing' THEN 'Order is being prepared'
        WHEN NEW.status = 'ready_for_pickup' THEN 'Order ready for pickup'
        WHEN NEW.status = 'out_for_delivery' THEN 'Order out for delivery'
        WHEN NEW.status = 'delivered' THEN 'Order delivered successfully'
        WHEN NEW.status = 'cancelled' THEN 'Order cancelled'
        ELSE 'Status updated'
      END
    );
    
    -- Update timestamps
    IF NEW.status = 'confirmed' THEN
      NEW.confirmed_at = NOW();
    ELSIF NEW.status IN ('delivered', 'cancelled') THEN
      NEW.completed_at = NOW();
      IF NEW.status = 'cancelled' THEN
        NEW.cancelled_at = NOW();
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

CREATE TRIGGER orders_status_change
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

CREATE TRIGGER order_items_updated_at
  BEFORE UPDATE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Customers can view their own orders"
  ON orders FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update their pending orders"
  ON orders FOR UPDATE
  USING (customer_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE id = auth.uid()
    )
  );

-- Order items policies
CREATE POLICY "Customers can view their order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE id = auth.uid()
    )
  );

-- Status history policies
CREATE POLICY "Customers can view their order status history"
  ON order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_status_history.order_id 
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all status history"
  ON order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE id = auth.uid()
    )
  );

-- ============================================
-- HELPER FUNCTION: Generate Order Number
-- ============================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate format: ORD-YYYYMMDD-XXXX
    new_number := 'ORD-' || 
                  TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                  LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Check if exists
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = new_number) INTO exists_check;
    
    -- If doesn't exist, use it
    IF NOT exists_check THEN
      RETURN new_number;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment to add sample orders for testing

/*
INSERT INTO orders (
  order_number,
  customer_name,
  customer_email,
  customer_phone,
  status,
  subtotal,
  delivery_fee,
  total,
  payment_method,
  payment_status,
  delivery_type,
  delivery_address,
  delivery_city
) VALUES 
(
  generate_order_number(),
  'Test Customer',
  'test@example.com',
  '+250788123456',
  'pending',
  50000,
  2000,
  52000,
  'cash_on_delivery',
  'pending',
  'delivery',
  'KG 123 St, Kigali',
  'Kigali'
);
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify setup:

-- Check tables
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name LIKE 'order%';

-- Check order statuses
-- SELECT unnest(enum_range(NULL::order_status));

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename LIKE 'order%';

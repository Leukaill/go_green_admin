# 🚀 Supabase Integration Setup Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation Steps](#installation-steps)
4. [Environment Variables](#environment-variables)
5. [Database Schema](#database-schema)
6. [Client Configuration](#client-configuration)
7. [Usage Examples](#usage-examples)
8. [Security Best Practices](#security-best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This guide covers the complete integration of Supabase into the Go Green Rwanda Admin Dashboard. Supabase will handle:

- **Authentication** - Admin login/logout
- **Database** - All data storage (products, orders, customers, blogs, etc.)
- **Storage** - Image and file uploads
- **Real-time** - Live updates for orders and inventory
- **Row Level Security** - Data protection

---

## ✅ Prerequisites

Before starting, ensure you have:

- [x] Node.js 18+ installed
- [x] Next.js 15.5.6 project (already set up)
- [x] Supabase account (create at https://supabase.com)
- [x] Supabase project created
- [ ] Supabase API keys (you'll provide these)

---

## 📦 Installation Steps

### Step 1: Install Supabase Client Library

Run this command in your project directory:

```bash
cd C:\Users\LENOVO\CascadeProjects\go-green-admin
npm install @supabase/supabase-js
```

### Step 2: Install Additional Dependencies (if needed)

```bash
npm install @supabase/auth-helpers-nextjs
```

---

## 🔑 Environment Variables

### Step 1: Create Environment File

Create a `.env.local` file in the root directory:

```bash
# Location: C:\Users\LENOVO\CascadeProjects\go-green-admin\.env.local
```

### Step 2: Add Supabase Keys

Add these variables (you'll provide the actual values):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: For development
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Step 3: Add to .gitignore

Ensure `.env.local` is in `.gitignore`:

```gitignore
# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local
```

---

## 🗄️ Database Schema

### Tables to Create in Supabase

#### 1. **admins** - Admin Users
```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to read all admins
CREATE POLICY "Admins can view all admins" ON admins
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for super_admins to manage admins
CREATE POLICY "Super admins can manage admins" ON admins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
```

#### 2. **products** - Product Catalog
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  image_url TEXT,
  images TEXT[], -- Array of image URLs
  is_featured BOOLEAN DEFAULT FALSE,
  is_organic BOOLEAN DEFAULT FALSE,
  sku TEXT UNIQUE,
  weight DECIMAL(10, 2),
  dimensions JSONB, -- {length, width, height}
  tags TEXT[],
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can read active products
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (status = 'active');

-- Admins can manage products
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_slug ON products(slug);
```

#### 3. **customers** - Customer Accounts
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  address JSONB, -- {street, city, district, country, postal_code}
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_order_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Customers can view their own data
CREATE POLICY "Customers can view own data" ON customers
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all customers
CREATE POLICY "Admins can view all customers" ON customers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );
```

#### 4. **orders** - Customer Orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Order Details
  items JSONB NOT NULL, -- Array of {product_id, name, quantity, price}
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping_fee DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Delivery
  delivery_address JSONB NOT NULL,
  delivery_method TEXT NOT NULL,
  delivery_date DATE,
  delivery_time_slot TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
  ),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid', 'failed', 'refunded')
  ),
  payment_method TEXT,
  
  -- Tracking
  notes TEXT,
  admin_notes TEXT,
  tracking_number TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Customers can view their own orders
CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (customer_id = auth.uid());

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
```

#### 5. **blog_posts** - Blog Content
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  author_id UUID REFERENCES admins(id),
  author_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'published', 'archived')
  ),
  is_featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can view published posts
CREATE POLICY "Public can view published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Admins can manage posts
CREATE POLICY "Admins can manage posts" ON blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at DESC);
```

#### 6. **audit_logs** - Comprehensive Activity Tracking
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Actor Information
  actor_id UUID NOT NULL,
  actor_name TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('admin', 'customer', 'system')),
  
  -- Action Details
  action TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  
  -- Target Information
  target_type TEXT,
  target_id TEXT,
  target_name TEXT,
  
  -- Change Details
  changes JSONB,
  
  -- Device & Location
  device JSONB NOT NULL,
  location JSONB NOT NULL,
  
  -- Additional Context
  metadata JSONB,
  session_id TEXT NOT NULL,
  request_id TEXT,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  duration INTEGER -- in milliseconds
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_category ON audit_logs(category);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
```

#### 7. **categories** - Product Categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public can view active categories
CREATE POLICY "Public can view active categories" ON categories
  FOR SELECT USING (is_active = TRUE);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );
```

#### 8. **settings** - System Settings
```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  updated_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public can view public settings
CREATE POLICY "Public can view public settings" ON settings
  FOR SELECT USING (is_public = TRUE);

-- Admins can view all settings
CREATE POLICY "Admins can view all settings" ON settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Only super admins can modify settings
CREATE POLICY "Super admins can modify settings" ON settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
```

---

## 🔧 Client Configuration

### File Structure

```
go-green-admin/
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser client
│   │   ├── server.ts          # Server client
│   │   ├── middleware.ts      # Auth middleware
│   │   └── types.ts           # TypeScript types
│   └── hooks/
│       └── useSupabase.ts     # React hook
```

---

## 📝 Usage Examples

### Example 1: Fetching Products

```typescript
import { supabase } from '@/lib/supabase/client';

// Get all active products
const { data: products, error } = await supabase
  .from('products')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false });
```

### Example 2: Creating an Order

```typescript
const { data: order, error } = await supabase
  .from('orders')
  .insert({
    order_number: 'ORD-001',
    customer_id: customerId,
    items: orderItems,
    total: totalAmount,
    status: 'pending'
  })
  .select()
  .single();
```

### Example 3: Real-time Subscriptions

```typescript
// Subscribe to new orders
const subscription = supabase
  .channel('orders')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'orders' },
    (payload) => {
      console.log('New order:', payload.new);
    }
  )
  .subscribe();
```

---

## 🔒 Security Best Practices

### 1. Row Level Security (RLS)
- ✅ All tables have RLS enabled
- ✅ Policies restrict data access by role
- ✅ Service role key only used server-side

### 2. Environment Variables
- ✅ Never commit `.env.local` to git
- ✅ Use different keys for dev/prod
- ✅ Rotate keys regularly

### 3. API Keys
- ✅ `ANON_KEY` - Safe for client-side (public)
- ✅ `SERVICE_ROLE_KEY` - Server-side only (secret)

---

## 🐛 Troubleshooting

### Issue: "Invalid API key"
**Solution**: Check that your `.env.local` file has the correct keys

### Issue: "Row Level Security policy violation"
**Solution**: Verify RLS policies are correctly set up in Supabase dashboard

### Issue: "CORS error"
**Solution**: Add your domain to Supabase project settings → API → URL Configuration

---

## 📚 Next Steps

After setup:
1. ✅ Install dependencies
2. ✅ Add environment variables
3. ✅ Create database tables
4. ✅ Set up RLS policies
5. ✅ Create Supabase clients
6. ✅ Test connection
7. ✅ Integrate with existing pages

---

## 🎯 Status: READY FOR KEYS

**Waiting for you to provide:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Once you provide these, we'll complete the integration! 🚀

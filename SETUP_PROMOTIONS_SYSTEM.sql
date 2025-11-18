-- =============================================
-- PROMOTIONS SYSTEM - COMPLETE SETUP
-- =============================================
-- Creates promotions table with full functionality
-- Includes RLS policies, audit logging, and permissions
-- =============================================

-- Step 1: Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'buy_x_get_y')),
  discount_value DECIMAL(10, 2) NOT NULL,
  code TEXT UNIQUE,
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  applicable_to TEXT NOT NULL CHECK (applicable_to IN ('all', 'specific_products', 'specific_categories')),
  applicable_product_ids UUID[],
  applicable_category_ids UUID[],
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  banner_image_url TEXT,
  banner_text TEXT,
  show_on_homepage BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id UUID REFERENCES auth.users(id),
  updated_by_id UUID REFERENCES auth.users(id),
  created_by_email TEXT,
  updated_by_email TEXT
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code) WHERE code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_promotions_homepage ON promotions(show_on_homepage) WHERE show_on_homepage = true;
CREATE INDEX IF NOT EXISTS idx_promotions_priority ON promotions(priority DESC);
CREATE INDEX IF NOT EXISTS idx_promotions_created_by ON promotions(created_by_id);

-- Step 3: Create promotion_usage tracking table
CREATE TABLE IF NOT EXISTS promotion_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  order_id UUID,
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotion_usage_promotion ON promotion_usage(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_usage_user ON promotion_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_promotion_usage_order ON promotion_usage(order_id);

-- Step 4: Enable RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_usage ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active promotions" ON promotions;
DROP POLICY IF EXISTS "Authenticated users can view all promotions" ON promotions;
DROP POLICY IF EXISTS "Admins can insert promotions" ON promotions;
DROP POLICY IF EXISTS "Admins can update own promotions" ON promotions;
DROP POLICY IF EXISTS "Super admins can update all promotions" ON promotions;
DROP POLICY IF EXISTS "Admins can delete own promotions" ON promotions;
DROP POLICY IF EXISTS "Super admins can delete all promotions" ON promotions;

-- Step 6: Create RLS policies for promotions

-- Public can view active promotions
CREATE POLICY "Anyone can view active promotions"
  ON promotions FOR SELECT
  TO public
  USING (
    is_active = true 
    AND start_date <= NOW() 
    AND end_date >= NOW()
  );

-- Authenticated users (admins) can view all promotions
CREATE POLICY "Authenticated users can view all promotions"
  ON promotions FOR SELECT
  TO authenticated
  USING (true);

-- Admins can insert promotions
CREATE POLICY "Admins can insert promotions"
  ON promotions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- Admins can update their own promotions
CREATE POLICY "Admins can update own promotions"
  ON promotions FOR UPDATE
  TO authenticated
  USING (created_by_id = auth.uid())
  WITH CHECK (created_by_id = auth.uid());

-- Super admins can update all promotions
CREATE POLICY "Super admins can update all promotions"
  ON promotions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Admins can delete their own promotions
CREATE POLICY "Admins can delete own promotions"
  ON promotions FOR DELETE
  TO authenticated
  USING (created_by_id = auth.uid());

-- Super admins can delete all promotions
CREATE POLICY "Super admins can delete all promotions"
  ON promotions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Step 7: RLS policies for promotion_usage

-- Users can view their own usage
CREATE POLICY "Users can view own promotion usage"
  ON promotion_usage FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all usage
CREATE POLICY "Admins can view all promotion usage"
  ON promotion_usage FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE id = auth.uid()
    )
  );

-- System can insert usage records
CREATE POLICY "System can insert promotion usage"
  ON promotion_usage FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Step 8: Create function to update admin emails
CREATE OR REPLACE FUNCTION update_promotion_admin_emails()
RETURNS TRIGGER AS $$
DECLARE
  v_created_email TEXT;
  v_updated_email TEXT;
BEGIN
  -- Get creator email
  IF NEW.created_by_id IS NOT NULL THEN
    SELECT email INTO v_created_email FROM auth.users WHERE id = NEW.created_by_id;
    NEW.created_by_email := v_created_email;
  END IF;
  
  -- Get updater email
  IF NEW.updated_by_id IS NOT NULL THEN
    SELECT email INTO v_updated_email FROM auth.users WHERE id = NEW.updated_by_id;
    NEW.updated_by_email := v_updated_email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger for admin emails
DROP TRIGGER IF EXISTS promotions_admin_emails_trigger ON promotions;
CREATE TRIGGER promotions_admin_emails_trigger
  BEFORE INSERT OR UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_promotion_admin_emails();

-- Step 10: Create function for audit logging
CREATE OR REPLACE FUNCTION log_promotion_action()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_admin_email TEXT;
  v_admin_name TEXT;
  v_details JSONB;
BEGIN
  -- Get admin details
  SELECT email INTO v_admin_email FROM auth.users WHERE id = auth.uid();
  SELECT name INTO v_admin_name FROM admins WHERE id = auth.uid();
  
  -- Determine action
  IF (TG_OP = 'INSERT') THEN
    v_action := 'promotion_created';
    v_details := jsonb_build_object(
      'title', NEW.title,
      'discount_type', NEW.discount_type,
      'discount_value', NEW.discount_value,
      'code', NEW.code,
      'start_date', NEW.start_date,
      'end_date', NEW.end_date
    );
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.is_active = true AND NEW.is_active = false) THEN
      v_action := 'promotion_deactivated';
    ELSIF (OLD.is_active = false AND NEW.is_active = true) THEN
      v_action := 'promotion_activated';
    ELSE
      v_action := 'promotion_updated';
    END IF;
    
    v_details := jsonb_build_object(
      'title', NEW.title,
      'discount_type', NEW.discount_type,
      'discount_value', NEW.discount_value,
      'code', NEW.code,
      'changes', jsonb_build_object(
        'title_changed', OLD.title != NEW.title,
        'discount_changed', OLD.discount_value != NEW.discount_value,
        'status_changed', OLD.is_active != NEW.is_active
      )
    );
  ELSIF (TG_OP = 'DELETE') THEN
    v_action := 'promotion_deleted';
    v_details := jsonb_build_object(
      'title', OLD.title,
      'discount_type', OLD.discount_type,
      'code', OLD.code
    );
  END IF;
  
  -- Insert audit log
  INSERT INTO audit_logs (
    admin_id,
    admin_email,
    admin_name,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    auth.uid(),
    v_admin_email,
    v_admin_name,
    v_action,
    'promotion',
    COALESCE(NEW.id, OLD.id),
    v_details
  );
  
  -- Return appropriate value
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Create trigger for audit logging
DROP TRIGGER IF EXISTS promotions_audit_trigger ON promotions;
CREATE TRIGGER promotions_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION log_promotion_action();

-- Step 12: Create function to update updated_at
CREATE OR REPLACE FUNCTION update_promotions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS promotions_updated_at ON promotions;
CREATE TRIGGER promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_promotions_updated_at();

-- Step 13: Grant permissions
GRANT SELECT ON promotions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON promotions TO authenticated;
GRANT SELECT ON promotion_usage TO authenticated;
GRANT INSERT ON promotion_usage TO authenticated;

-- Step 14: Create helper function to check if promotion is valid
CREATE OR REPLACE FUNCTION is_promotion_valid(promotion_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_promotion promotions;
BEGIN
  SELECT * INTO v_promotion FROM promotions WHERE id = promotion_id;
  
  IF v_promotion IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if active
  IF NOT v_promotion.is_active THEN
    RETURN false;
  END IF;
  
  -- Check dates
  IF NOW() < v_promotion.start_date OR NOW() > v_promotion.end_date THEN
    RETURN false;
  END IF;
  
  -- Check usage limit
  IF v_promotion.usage_limit IS NOT NULL AND v_promotion.usage_count >= v_promotion.usage_limit THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Verification
SELECT '✅ Step 1: Promotions table created' as status;
SELECT '✅ Step 2: Indexes created' as status;
SELECT '✅ Step 3: Promotion usage table created' as status;
SELECT '✅ Step 4: RLS enabled' as status;
SELECT '✅ Step 5: Old policies dropped' as status;
SELECT '✅ Step 6: RLS policies created' as status;
SELECT '✅ Step 7: Promotion usage policies created' as status;
SELECT '✅ Step 8: Admin email function created' as status;
SELECT '✅ Step 9: Admin email trigger created' as status;
SELECT '✅ Step 10: Audit logging function created' as status;
SELECT '✅ Step 11: Audit trigger created' as status;
SELECT '✅ Step 12: Updated_at trigger created' as status;
SELECT '✅ Step 13: Permissions granted' as status;
SELECT '✅ Step 14: Helper functions created' as status;

SELECT '🎉 PROMOTIONS SYSTEM SETUP COMPLETE!' as status;
SELECT '✅ Ready for admin panel and website integration' as message;

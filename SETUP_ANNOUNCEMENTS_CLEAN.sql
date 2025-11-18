-- Clean setup for Announcements System
-- Run this if you're getting column errors

-- Drop existing objects if they exist
DROP TRIGGER IF EXISTS announcements_audit_trigger ON announcements;
DROP TRIGGER IF EXISTS announcements_admin_emails ON announcements;
DROP TRIGGER IF EXISTS announcements_updated_at ON announcements;
DROP FUNCTION IF EXISTS log_announcement_changes();
DROP FUNCTION IF EXISTS populate_announcement_admin_emails();
DROP FUNCTION IF EXISTS update_announcements_updated_at();
DROP TABLE IF EXISTS announcements_audit_log CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;

-- Create announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_type TEXT NOT NULL CHECK (announcement_type IN ('seasonal', 'info', 'alert')),
  
  -- Multilingual content
  title TEXT NOT NULL,
  title_rw TEXT,
  title_fr TEXT,
  message TEXT NOT NULL,
  message_rw TEXT,
  message_fr TEXT,
  
  -- Visual
  icon TEXT,
  banner_image_url TEXT,
  
  -- Link (optional)
  link_url TEXT,
  link_text TEXT,
  
  -- Scheduling
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  
  -- Display settings
  show_on_homepage BOOLEAN DEFAULT false,
  dismissible BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id UUID,
  updated_by_id UUID,
  created_by_email TEXT,
  updated_by_email TEXT
);

-- Create indexes
CREATE INDEX idx_announcements_type ON announcements(announcement_type);
CREATE INDEX idx_announcements_active ON announcements(is_active) WHERE is_active = true;
CREATE INDEX idx_announcements_homepage ON announcements(show_on_homepage) WHERE show_on_homepage = true;
CREATE INDEX idx_announcements_dates ON announcements(start_date, end_date);
CREATE INDEX idx_announcements_priority ON announcements(priority DESC);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view active announcements"
  ON announcements FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true 
    AND start_date <= NOW() 
    AND end_date >= NOW()
  );

CREATE POLICY "Admins can view all announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid() 
      AND admins.status = 'active'
    )
  );

CREATE POLICY "Admins can create announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid() 
      AND admins.status = 'active'
    )
  );

CREATE POLICY "Admins can update announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid() 
      AND admins.status = 'active'
      AND (admins.role = 'super_admin' OR created_by_id = auth.uid())
    )
  );

CREATE POLICY "Admins can delete announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid() 
      AND admins.status = 'active'
      AND (admins.role = 'super_admin' OR created_by_id = auth.uid())
    )
  );

-- Trigger to update updated_at
CREATE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();

-- Trigger to populate admin emails
CREATE FUNCTION populate_announcement_admin_emails()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT email INTO NEW.created_by_email
    FROM admins
    WHERE id = NEW.created_by_id;
    
    NEW.updated_by_email := NEW.created_by_email;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    SELECT email INTO NEW.updated_by_email
    FROM admins
    WHERE id = NEW.updated_by_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER announcements_admin_emails
  BEFORE INSERT OR UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION populate_announcement_admin_emails();

-- Audit logging
CREATE TABLE announcements_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'activated', 'deactivated')),
  performed_by_id UUID,
  performed_by_email TEXT,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  changes JSONB
);

CREATE FUNCTION log_announcement_changes()
RETURNS TRIGGER AS $$
DECLARE
  admin_email TEXT;
  action_type TEXT;
BEGIN
  SELECT email INTO admin_email
  FROM admins
  WHERE id = auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    action_type := 'created';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_active = false AND NEW.is_active = true THEN
      action_type := 'activated';
    ELSIF OLD.is_active = true AND NEW.is_active = false THEN
      action_type := 'deactivated';
    ELSE
      action_type := 'updated';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'deleted';
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    INSERT INTO announcements_audit_log (announcement_id, action, performed_by_id, performed_by_email, changes)
    VALUES (OLD.id, action_type, auth.uid(), admin_email, to_jsonb(OLD));
    RETURN OLD;
  ELSE
    INSERT INTO announcements_audit_log (announcement_id, action, performed_by_id, performed_by_email, changes)
    VALUES (NEW.id, action_type, auth.uid(), admin_email, to_jsonb(NEW));
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER announcements_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION log_announcement_changes();

-- Grant permissions
GRANT SELECT ON announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON announcements TO authenticated;
GRANT SELECT ON announcements_audit_log TO authenticated;

-- Comments
COMMENT ON TABLE announcements IS 'System announcements (info, alerts, seasonal) - separate from promotions/discounts';
COMMENT ON COLUMN announcements.announcement_type IS 'Type: seasonal, info, alert';

SELECT '✅ Announcements system created successfully!' as status;

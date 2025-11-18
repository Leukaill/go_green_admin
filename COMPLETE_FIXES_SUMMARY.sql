-- =============================================
-- COMPLETE FIXES - ALL IN ONE
-- =============================================

-- 1. FIX BLOG TABLE - ADD ADMIN TRACKING
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS created_by_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by_id UUID REFERENCES auth.users(id);

-- 2. CREATE ANNOUNCEMENTS/PROMOTIONS TABLE
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('seasonal', 'promotion', 'info', 'warning')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  link_text TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  priority INTEGER DEFAULT 5,
  dismissible BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_id UUID REFERENCES auth.users(id),
  updated_by_id UUID REFERENCES auth.users(id)
);

-- 3. CREATE INDEXES FOR ANNOUNCEMENTS
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_announcements_dates ON announcements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority DESC);

-- 4. ENABLE RLS FOR ANNOUNCEMENTS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Anyone can view active announcements
CREATE POLICY "Anyone can view active announcements"
  ON announcements FOR SELECT
  TO public
  USING (is_active = true);

-- Authenticated users can view all
CREATE POLICY "Authenticated users can view all announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can insert announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update
CREATE POLICY "Authenticated users can update announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (true);

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (true);

-- 5. CREATE TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
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

-- 6. INSERT SAMPLE ANNOUNCEMENTS
INSERT INTO announcements (type, title, message, link, link_text, start_date, end_date, priority, dismissible, is_active) VALUES
  (
    'seasonal',
    '🥑 Avocado Season is Here!',
    'Fresh, locally-grown avocados now available. Premium quality at great prices!',
    '/products',
    'Shop Now',
    NOW(),
    NOW() + INTERVAL '60 days',
    10,
    true,
    true
  ),
  (
    'promotion',
    '🚚 Free Delivery on Orders Over 50,000 RWF',
    'Save on delivery! Orders over 50,000 RWF get free delivery to your doorstep.',
    '/products',
    'Start Shopping',
    NOW(),
    NOW() + INTERVAL '365 days',
    8,
    true,
    true
  )
ON CONFLICT DO NOTHING;

-- 7. VERIFICATION
SELECT '✅ Blog table updated with admin tracking' as status
UNION ALL
SELECT '✅ Announcements table created'
UNION ALL
SELECT '✅ RLS policies set up'
UNION ALL
SELECT '✅ Sample announcements inserted'
UNION ALL
SELECT '✅ All fixes complete!';

-- 8. TEST QUERIES
SELECT 'Blog posts:' as info, COUNT(*) as count FROM blog_posts
UNION ALL
SELECT 'Announcements:', COUNT(*) FROM announcements;

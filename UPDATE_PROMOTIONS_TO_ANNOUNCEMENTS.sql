-- Update promotions table to support all announcement types
-- Rename to 'announcements' and add type field

-- Add announcement_type column
ALTER TABLE promotions 
ADD COLUMN IF NOT EXISTS announcement_type TEXT DEFAULT 'promotion' CHECK (announcement_type IN ('seasonal', 'promotion', 'info', 'alert'));

-- Add message field for non-discount announcements
ALTER TABLE promotions 
ADD COLUMN IF NOT EXISTS message TEXT;

-- Add multilingual support
ALTER TABLE promotions 
ADD COLUMN IF NOT EXISTS title_rw TEXT,
ADD COLUMN IF NOT EXISTS title_fr TEXT,
ADD COLUMN IF NOT EXISTS message_rw TEXT,
ADD COLUMN IF NOT EXISTS message_fr TEXT;

-- Add icon field
ALTER TABLE promotions 
ADD COLUMN IF NOT EXISTS icon TEXT;

-- Add dismissible field
ALTER TABLE promotions 
ADD COLUMN IF NOT EXISTS dismissible BOOLEAN DEFAULT true;

-- Add link_text field
ALTER TABLE promotions 
ADD COLUMN IF NOT EXISTS link_text TEXT;

-- Make discount fields optional (for info/warning types)
ALTER TABLE promotions 
ALTER COLUMN discount_type DROP NOT NULL,
ALTER COLUMN discount_value DROP NOT NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_promotions_announcement_type ON promotions(announcement_type);
CREATE INDEX IF NOT EXISTS idx_promotions_active_type ON promotions(is_active, announcement_type) WHERE is_active = true;

-- Update comments
COMMENT ON COLUMN promotions.announcement_type IS 'Type of announcement: seasonal, promotion, info, alert';
COMMENT ON COLUMN promotions.message IS 'Main message for info/alert announcements';
COMMENT ON COLUMN promotions.title_rw IS 'Title in Kinyarwanda';
COMMENT ON COLUMN promotions.title_fr IS 'Title in French';
COMMENT ON COLUMN promotions.message_rw IS 'Message in Kinyarwanda';
COMMENT ON COLUMN promotions.message_fr IS 'Message in French';
COMMENT ON COLUMN promotions.icon IS 'Icon name or emoji for the announcement';
COMMENT ON COLUMN promotions.dismissible IS 'Whether users can dismiss this announcement';
COMMENT ON COLUMN promotions.link_text IS 'Text for the link button';

SELECT '✅ Promotions table updated to support all announcement types' as status;

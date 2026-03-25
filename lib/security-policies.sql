-- ========================================
-- SECURITY POLICIES FOR THRIFTDROP
-- ========================================

-- Enable Row Level Security on all tables
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- ========================================
-- DROPS TABLE POLICIES
-- ========================================

-- Policy: Public can read all drops
CREATE POLICY "Drops are viewable by everyone"
  ON drops FOR SELECT
  USING (true);

-- Policy: Authenticated users can create drops
CREATE POLICY "Authenticated users can create drops"
  ON drops FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_name
  );

-- Policy: Users can update their own drops
CREATE POLICY "Users can update own drops"
  ON drops FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_name
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_name
  );

-- Policy: Users can delete their own drops
CREATE POLICY "Users can delete own drops"
  ON drops FOR DELETE
  USING (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_name
  );

-- ========================================
-- LISTINGS TABLE POLICIES
-- ========================================

-- Policy: Public can read active listings
CREATE POLICY "Active listings are viewable by everyone"
  ON listings FOR SELECT
  USING (
    status = 'active'
  );

-- Policy: Authenticated users can create listings
CREATE POLICY "Authenticated users can create listings"
  ON listings FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_id
  );

-- Policy: Users can update their own listings
CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_id
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_id
  );

-- Policy: Users can delete their own listings
CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE
  USING (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_id
  );

-- Policy: Users can view their own listings regardless of status
CREATE POLICY "Users can view all their own listings"
  ON listings FOR SELECT
  USING (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_id
  );

-- ========================================
-- ADDITIONAL SECURITY MEASURES
-- ========================================

-- Create function to check if user owns a listing
CREATE OR REPLACE FUNCTION owns_listing(listing_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM listings 
    WHERE id = listing_id 
    AND user_id = auth.uid()::text
    AND auth.role() = 'authenticated'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user owns a drop
CREATE OR REPLACE FUNCTION owns_drop(drop_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM drops 
    WHERE id = drop_id 
    AND user_name = auth.uid()::text
    AND auth.role() = 'authenticated'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger function for listings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at column to listings if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE listings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END
$$;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SECURITY AUDIT FUNCTIONS
-- ========================================

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  event_type TEXT,
  table_name TEXT,
  user_id TEXT,
  details JSONB
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO security_logs (event_type, table_name, user_id, details, created_at)
  VALUES (event_type, table_name, user_id, details, NOW());
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the main operation if logging fails
  NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create security_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  user_id TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on security_logs
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Only system can insert security logs
CREATE POLICY "Only system can insert security logs"
  ON security_logs FOR INSERT
  WITH CHECK (false);

-- Only authenticated users can view their own security logs
CREATE POLICY "Users can view own security logs"
  ON security_logs FOR SELECT
  USING (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_id
  );

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Create indexes for security checks
CREATE INDEX IF NOT EXISTS idx_drops_user_name ON drops(user_name);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);

-- ========================================
-- VALIDATION CONSTRAINTS
-- ========================================

-- Add check constraints for data integrity
DO $$
BEGIN
    -- Add price positive constraint to listings if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'listings' 
        AND constraint_name = 'listings_price_positive'
    ) THEN
        ALTER TABLE listings 
        ADD CONSTRAINT listings_price_positive 
        CHECK (price >= 0);
    END IF;

    -- Add status valid constraint to listings if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'listings' 
        AND constraint_name = 'listings_status_valid'
    ) THEN
        ALTER TABLE listings 
        ADD CONSTRAINT listings_status_valid 
        CHECK (status IN ('active', 'sold', 'removed'));
    END IF;

    -- Add price positive constraint to drops if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'drops' 
        AND constraint_name = 'drops_price_positive'
    ) THEN
        ALTER TABLE drops 
        ADD CONSTRAINT drops_price_positive 
        CHECK (price >= 0);
    END IF;
END $$;

-- ========================================
-- VIEWS FOR COMMON QUERIES
-- ========================================

-- Public view of active listings
CREATE OR REPLACE VIEW public_active_listings AS
SELECT 
  id,
  title,
  description,
  price,
  category,
  image_url,
  lat_lng,
  created_at,
  updated_at
FROM listings 
WHERE status = 'active';

-- User's personal listings view
CREATE OR REPLACE VIEW user_listings AS
SELECT 
  id,
  title,
  description,
  price,
  category,
  image_url,
  lat_lng,
  status,
  created_at,
  updated_at
FROM listings 
WHERE user_id = auth.uid()::text;

-- Grant appropriate permissions
GRANT SELECT ON public_active_listings TO authenticated;
GRANT SELECT ON public_active_listings TO anon;
GRANT SELECT ON user_listings TO authenticated;

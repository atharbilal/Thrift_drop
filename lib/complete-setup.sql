-- ========================================
-- COMPLETE THRIFTDROP DATABASE SETUP
-- ========================================
-- This script creates all necessary tables and applies security policies
-- Run this first, then run the security-policies.sql

-- ========================================
-- CREATE TABLES IF THEY DON'T EXIST
-- ========================================

-- Create drops table if it doesn't exist
CREATE TABLE IF NOT EXISTS drops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  store_name TEXT NOT NULL,
  location TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  store_badge TEXT DEFAULT 'Bargain Store',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create listings table if it doesn't exist
CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL CHECK (category IN ('electronics', 'clothing', 'furniture', 'books', 'toys', 'sports', 'home', 'beauty', 'automotive', 'other')),
  image_url TEXT,
  lat_lng TEXT, -- Stored as 'latitude,longitude'
  user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  username TEXT UNIQUE,
  bio TEXT,
  phone TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT profiles_username_length CHECK (LENGTH(COALESCE(username, '')) >= 3),
  CONSTRAINT profiles_username_format CHECK (username ~* '^[a-zA-Z0-9_]+$')
);

-- Create security_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  user_id TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CREATE INDEXES
-- ========================================

-- Indexes for drops table
CREATE INDEX IF NOT EXISTS idx_drops_created_at ON drops(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drops_store_name ON drops(store_name);
CREATE INDEX IF NOT EXISTS idx_drops_location ON drops(location);
CREATE INDEX IF NOT EXISTS idx_drops_user_name ON drops(user_name);

-- Indexes for listings table
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);

-- Indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Indexes for security_logs table
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);

-- ========================================
-- ENABLE ROW LEVEL SECURITY
-- ========================================

ALTER TABLE drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- ========================================
-- BASIC POLICIES (simplified version)
-- ========================================

-- Drops table policies
CREATE POLICY IF NOT EXISTS "Drops are viewable by everyone"
  ON drops FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can create drops"
  ON drops FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_name
  );

CREATE POLICY IF NOT EXISTS "Users can update own drops"
  ON drops FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_name
  );

CREATE POLICY IF NOT EXISTS "Users can delete own drops"
  ON drops FOR DELETE
  USING (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_name
  );

-- Listings table policies
CREATE POLICY IF NOT EXISTS "Active listings are viewable by everyone"
  ON listings FOR SELECT
  USING (
    status = 'active'
  );

CREATE POLICY IF NOT EXISTS "Authenticated users can create listings"
  ON listings FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_id
  );

CREATE POLICY IF NOT EXISTS "Users can update own listings"
  ON listings FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_id
  );

CREATE POLICY IF NOT EXISTS "Users can delete own listings"
  ON listings FOR DELETE
  USING (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_id
  );

-- Profiles table policies
CREATE POLICY IF NOT EXISTS "Users can view own profile"
  ON profiles FOR SELECT
  USING (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_id
  );

CREATE POLICY IF NOT EXISTS "Users can create own profile"
  ON profiles FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_id
  );

CREATE POLICY IF NOT EXISTS "Users can update own profile"
  ON profiles FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_id
  );

-- Security logs policies
CREATE POLICY IF NOT EXISTS "Only system can insert security logs"
  ON security_logs FOR INSERT
  WITH CHECK (false);

CREATE POLICY IF NOT EXISTS "Users can view own security logs"
  ON security_logs FOR SELECT
  USING (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_id
  );

-- ========================================
-- CREATE TRIGGERS FOR PROFILE MANAGEMENT
-- ========================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER IF NOT EXISTS on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- CREATE VIEWS
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

-- Grant permissions
GRANT SELECT ON public_active_listings TO authenticated;
GRANT SELECT ON public_active_listings TO anon;

-- ========================================
-- SETUP COMPLETE
-- ========================================

-- Verify tables exist
DO $$
BEGIN
    RAISE NOTICE 'ThriftDrop database setup complete!';
    RAISE NOTICE 'Tables created: drops, listings, profiles, security_logs';
    RAISE NOTICE 'Indexes created for performance';
    RAISE NOTICE 'Row Level Security enabled';
    RAISE NOTICE 'Basic policies applied';
    RAISE NOTICE 'Triggers for profile management created';
END $$;

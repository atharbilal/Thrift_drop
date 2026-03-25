-- ========================================
-- PROFILES TABLE FOR USER DATA
-- ========================================

-- Create profiles table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PROFILES TABLE RLS POLICIES
-- ========================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_id
  );

-- Policy: Users can view public profile information
CREATE POLICY "Public can view basic profile info"
  ON profiles FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    -- Only allow viewing basic public info of other users
    (id IN (
      SELECT user_id FROM listings WHERE status = 'active'
    ) OR auth.uid()::text = user_id)
  );

-- Policy: Users can insert their own profile
CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_id
  );

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_id
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_id
  );

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (
    auth.role() = 'authenticated' AND 
    auth.uid()::text = user_id
  );

-- ========================================
-- PROFILE FUNCTIONS AND TRIGGERS
-- ========================================

-- Function to create or update profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile for new user
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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update profile on user metadata changes
CREATE OR REPLACE FUNCTION public.update_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile when user metadata changes
  UPDATE public.profiles 
  SET 
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', old.full_name),
    avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', old.avatar_url),
    updated_at = NOW()
  WHERE user_id = OLD.id::text;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update profile on user metadata update
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_profile();

-- ========================================
-- PROFILE HELPER FUNCTIONS
-- ========================================

-- Function to get user profile
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid TEXT)
RETURNS TABLE (
  id UUID,
  user_id TEXT,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  username TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.username,
    p.bio,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = user_uuid
  AND (auth.uid()::text = user_uuid OR p.user_id IN (
    SELECT DISTINCT user_id FROM listings WHERE status = 'active'
  ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if username is available
CREATE OR REPLACE FUNCTION is_username_available(username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE username = LOWER(username)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user profile
CREATE OR REPLACE FUNCTION update_my_profile(
  new_full_name TEXT DEFAULT NULL,
  new_avatar_url TEXT DEFAULT NULL,
  new_username TEXT DEFAULT NULL,
  new_bio TEXT DEFAULT NULL,
  new_phone TEXT DEFAULT NULL,
  new_location TEXT DEFAULT NULL,
  new_website TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    full_name = COALESCE(new_full_name, full_name),
    avatar_url = COALESCE(new_avatar_url, avatar_url),
    username = COALESCE(new_username, username),
    bio = COALESCE(new_bio, bio),
    phone = COALESCE(new_phone, phone),
    location = COALESCE(new_location, location),
    website = COALESCE(new_website, website),
    updated_at = NOW()
  WHERE user_id = auth.uid()::text;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- VIEWS FOR COMMON QUERIES
-- ========================================

-- Public profile view (sanitized for public consumption)
CREATE OR REPLACE VIEW public_profiles AS
SELECT 
  p.id,
  p.user_id,
  p.full_name,
  p.avatar_url,
  p.username,
  p.bio,
  p.location,
  p.created_at,
  -- Count of active listings for this user
  (SELECT COUNT(*) FROM listings WHERE user_id = p.user_id AND status = 'active') as listing_count
FROM public.profiles p
WHERE p.user_id IN (
  SELECT DISTINCT user_id FROM listings WHERE status = 'active'
);

-- Grant permissions
GRANT SELECT ON public_profiles TO authenticated;
GRANT SELECT ON public_profiles TO anon;

-- ========================================
-- SAMPLE DATA (for development)
-- ========================================

-- Insert sample profile (remove in production)
-- This will be automatically handled by the trigger when users sign up
-- INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
-- VALUES ('demo-user', 'demo@example.com', 'Demo User', 'https://example.com/avatar.jpg');

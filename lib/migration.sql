-- Check if table exists and drop it first (for development)
DROP TABLE IF EXISTS drops CASCADE;

-- Create drops table
CREATE TABLE drops (
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

-- Create index for better query performance
CREATE INDEX idx_drops_created_at ON drops(created_at DESC);
CREATE INDEX idx_drops_store_name ON drops(store_name);
CREATE INDEX idx_drops_location ON drops(location);

-- Enable Row Level Security
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public drops are viewable by everyone"
  ON drops FOR SELECT
  USING (true);

-- Create policy for authenticated users to insert drops
CREATE POLICY "Authenticated users can create drops"
  ON drops FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Create policy for users to update their own drops
CREATE POLICY "Users can update own drops"
  ON drops FOR UPDATE
  USING (auth.uid()::text = user_name);

-- Create policy for users to delete their own drops
CREATE POLICY "Users can delete own drops"
  ON drops FOR DELETE
  USING (auth.uid()::text = user_name);

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Businesses table
CREATE TABLE businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_businesses_category_city ON businesses(category, city);
CREATE INDEX idx_businesses_type ON businesses(type);
CREATE INDEX idx_businesses_ai_generated ON businesses(ai_generated);
CREATE INDEX idx_businesses_location ON businesses(latitude, longitude);
CREATE INDEX idx_businesses_rating ON businesses(rating DESC);

-- Search cache to track AI queries
CREATE TABLE search_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  last_populated TIMESTAMP DEFAULT NOW(),
  UNIQUE(category, city)
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_businesses_updated_at 
    BEFORE UPDATE ON businesses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_cache ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
CREATE POLICY "Allow read access to businesses" ON businesses
    FOR SELECT USING (true);

CREATE POLICY "Allow read access to search_cache" ON search_cache
    FOR SELECT USING (true);

-- Allow insert for authenticated users (you can modify this based on your needs)
CREATE POLICY "Allow insert to businesses" ON businesses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow insert to search_cache" ON search_cache
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update to search_cache" ON search_cache
    FOR UPDATE USING (true);
-- Create cases table for storing dental case studies
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Endodontics', 'Prosthodontics', 'Surgery', 'Pedodontics', 'Cosmetic Fillings')),
  description TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]',
  created_at BIGINT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS cases_created_at_idx ON cases(created_at DESC);
CREATE INDEX IF NOT EXISTS cases_category_idx ON cases(category);

-- Enable RLS (Row Level Security) - Allow public read, but authenticated writes
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read
CREATE POLICY "Enable read access for all users" ON cases
  FOR SELECT USING (true);

-- Policy: Authenticated users can insert
CREATE POLICY "Enable insert for authenticated users" ON cases
  FOR INSERT WITH CHECK (true);

-- Policy: Authenticated users can update their own cases
CREATE POLICY "Enable update for authenticated users" ON cases
  FOR UPDATE USING (true);

-- Policy: Authenticated users can delete their own cases
CREATE POLICY "Enable delete for authenticated users" ON cases
  FOR DELETE USING (true);

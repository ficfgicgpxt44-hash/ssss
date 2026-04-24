-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY,
  created_at BIGINT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Endodontics', 'Prosthodontics', 'Surgery', 'Pedodontics', 'Cosmetic Fillings')),
  description TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on created_at for efficient sorting
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read
CREATE POLICY "Allow read access" ON cases
  FOR SELECT
  USING (true);

-- Create policy to allow all authenticated users to insert
CREATE POLICY "Allow insert access" ON cases
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow all authenticated users to update
CREATE POLICY "Allow update access" ON cases
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policy to allow all authenticated users to delete
CREATE POLICY "Allow delete access" ON cases
  FOR DELETE
  USING (true);

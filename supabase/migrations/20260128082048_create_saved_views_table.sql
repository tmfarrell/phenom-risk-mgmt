-- Create saved_views table for storing shared view configurations
-- Note: Currently views are shared across all users. In the future, 
-- an organization_id column can be added to scope views per organization.
CREATE TABLE saved_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  model_type TEXT NOT NULL,
  risk_type TEXT NOT NULL CHECK (risk_type IN ('relative', 'absolute')),
  timeframe TEXT NOT NULL,
  outcomes JSONB NOT NULL DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE saved_views ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view all saved views
CREATE POLICY "All users can view saved views"
  ON saved_views FOR SELECT
  TO authenticated
  USING (true);

-- Policy: All authenticated users can create saved views
CREATE POLICY "All users can create saved views"
  ON saved_views FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: All authenticated users can update saved views
CREATE POLICY "All users can update saved views"
  ON saved_views FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: All authenticated users can delete saved views
CREATE POLICY "All users can delete saved views"
  ON saved_views FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_saved_views_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER saved_views_updated_at
  BEFORE UPDATE ON saved_views
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_views_updated_at();

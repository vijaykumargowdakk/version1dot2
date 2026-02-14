-- Create user_inspections table for authenticated user scans (private)
CREATE TABLE public.user_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_url TEXT NOT NULL,
  vehicle_name TEXT,
  vin TEXT,
  thumbnail_url TEXT,
  image_urls TEXT[] NOT NULL,
  health_score INTEGER,
  inspection_data JSONB NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.user_inspections ENABLE ROW LEVEL SECURITY;

-- Users can only view their own inspections
CREATE POLICY "Users can view own inspections"
ON public.user_inspections
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own inspections
CREATE POLICY "Users can insert own inspections"
ON public.user_inspections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own inspections
CREATE POLICY "Users can update own inspections"
ON public.user_inspections
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own inspections
CREATE POLICY "Users can delete own inspections"
ON public.user_inspections
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for faster user lookups
CREATE INDEX idx_user_inspections_user_id ON public.user_inspections(user_id);
CREATE INDEX idx_user_inspections_created_at ON public.user_inspections(created_at DESC);
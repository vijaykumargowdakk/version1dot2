-- Create inspections table for storing vehicle scan history
CREATE TABLE public.inspections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  vehicle_url text NOT NULL,
  vehicle_name text,
  vin text,
  thumbnail_url text,
  image_urls text[] NOT NULL,
  health_score integer,
  inspection_data jsonb NOT NULL
);

-- Create unique index on vehicle_url to prevent duplicates
CREATE UNIQUE INDEX idx_inspections_vehicle_url ON public.inspections(vehicle_url);

-- Enable Row Level Security
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- Public read access for all users
CREATE POLICY "Enable read access for all users" 
ON public.inspections 
FOR SELECT 
USING (true);

-- Public insert access for all users (edge function needs this)
CREATE POLICY "Enable insert access for all users" 
ON public.inspections 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_inspections_created_at ON public.inspections(created_at DESC);
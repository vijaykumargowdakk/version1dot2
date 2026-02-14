
-- Create inspection_feedback table
CREATE TABLE public.inspection_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL,
  part_code TEXT NOT NULL,
  rating BOOLEAN NOT NULL,
  comment TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inspection_feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own feedback
CREATE POLICY "Users can insert own feedback"
ON public.inspection_feedback
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback"
ON public.inspection_feedback
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own feedback
CREATE POLICY "Users can update own feedback"
ON public.inspection_feedback
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own feedback
CREATE POLICY "Users can delete own feedback"
ON public.inspection_feedback
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_feedback_inspection ON public.inspection_feedback(inspection_id);
CREATE INDEX idx_feedback_user ON public.inspection_feedback(user_id);
CREATE UNIQUE INDEX idx_feedback_unique ON public.inspection_feedback(inspection_id, part_code, user_id);

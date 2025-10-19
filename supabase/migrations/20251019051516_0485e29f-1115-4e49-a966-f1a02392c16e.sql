-- Fix RLS recursion by creating SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.get_user_org_code(_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_code
  FROM profiles
  WHERE user_id = _user_id
  LIMIT 1;
$$;

-- Update mission_submissions policies to prevent recursion
DROP POLICY IF EXISTS "Organizations can view their students submissions" ON mission_submissions;
CREATE POLICY "Organizations can view their students submissions"
ON mission_submissions FOR SELECT
USING (
  auth.uid() = user_id OR
  (
    public.has_role(auth.uid(), 'organization') AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = mission_submissions.user_id
      AND organization_code = public.get_user_org_code(auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Organizations can update their students submissions" ON mission_submissions;
CREATE POLICY "Organizations can update their students submissions"
ON mission_submissions FOR UPDATE
USING (
  public.has_role(auth.uid(), 'organization') AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = mission_submissions.user_id
    AND organization_code = public.get_user_org_code(auth.uid())
  )
);

-- Update activity_log policies to use the helper function
DROP POLICY IF EXISTS "Organizations can view their activities" ON activity_log;
CREATE POLICY "Organizations can view their activities"
ON activity_log FOR SELECT
USING (
  public.has_role(auth.uid(), 'organization') AND
  organization_code = public.get_user_org_code(auth.uid())
);

-- Add storage validation for mission-videos bucket
-- Configure size limits (50MB max) and allowed MIME types
UPDATE storage.buckets
SET 
  file_size_limit = 52428800,  -- 50MB in bytes
  allowed_mime_types = ARRAY[
    'video/mp4',
    'video/webm', 
    'video/ogg',
    'video/quicktime',
    'image/jpeg',
    'image/png'
  ]
WHERE id = 'mission-videos';
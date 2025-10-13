-- ============================================================================
-- CRITICAL SECURITY FIX: Implement Proper Role-Based Access Control
-- ============================================================================

-- 1. Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('student', 'organization');

-- 2. Create secure user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role::app_role
FROM public.profiles
WHERE role IN ('student', 'organization')
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Create SECURITY DEFINER function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 5. Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1;
$$;

-- 6. Update profiles table RLS policies to prevent role modification
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile (except role)"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  -- Prevent role changes by ensuring new role matches old role
  role = (SELECT role FROM public.profiles WHERE user_id = auth.uid())
);

-- 7. Add RLS policy for user_roles (users can view their own roles)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- FIX: Add Input Validation for Mission Submissions (excluding video_url)
-- ============================================================================

-- Add length constraint for reviewer_notes
ALTER TABLE public.mission_submissions
ADD CONSTRAINT reviewer_notes_max_length
CHECK (reviewer_notes IS NULL OR length(reviewer_notes) <= 5000);

-- Add size limit for submission_data JSONB (100KB limit)
ALTER TABLE public.mission_submissions
ADD CONSTRAINT submission_data_size
CHECK (
  submission_data IS NULL OR 
  pg_column_size(submission_data) <= 100000
);

-- ============================================================================
-- FIX: Restrict Storage Access for Mission Videos
-- ============================================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view mission videos" ON storage.objects;

-- Create restricted policy: users can only view their own videos or their organization's students' videos
CREATE POLICY "Users can view own or org student videos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'mission-videos' AND (
    -- Users can view their own videos
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Organizations can view their students' videos
    (
      public.has_role(auth.uid(), 'organization') AND
      EXISTS (
        SELECT 1
        FROM public.profiles org
        JOIN public.profiles student ON student.organization_code = org.organization_code
        WHERE org.user_id = auth.uid()
          AND student.user_id::text = (storage.foldername(name))[1]
          AND student.role = 'student'
      )
    )
  )
);

-- Update INSERT policy to use proper folder structure
DROP POLICY IF EXISTS "Users can upload their own mission videos" ON storage.objects;

CREATE POLICY "Users can upload their own mission videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'mission-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Add UPDATE policy for metadata
CREATE POLICY "Users can update their own mission videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'mission-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Add DELETE policy
CREATE POLICY "Users can delete their own mission videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'mission-videos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- Update handle_new_user function to use user_roles table
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    org_code text := NULL;
    user_role app_role;
BEGIN
    -- Determine role
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student')::app_role;

    -- Generate organization code if role is organization
    IF user_role = 'organization' THEN
        org_code := generate_organization_code();
    END IF;

    -- Insert into user_roles table
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Insert into profiles (role field remains for backwards compatibility but is read-only)
    INSERT INTO public.profiles (
        user_id, 
        display_name, 
        role, 
        organization_name, 
        region_district, 
        region_state, 
        region_country, 
        gender,
        organization_code
    )
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        user_role::text,
        NEW.raw_user_meta_data->>'organization_name',
        NEW.raw_user_meta_data->>'region_district',
        NEW.raw_user_meta_data->>'region_state',
        COALESCE(NEW.raw_user_meta_data->>'region_country', 'India'),
        NEW.raw_user_meta_data->>'gender',
        CASE 
            WHEN user_role = 'organization' THEN org_code 
            ELSE NEW.raw_user_meta_data->>'organization_code'
        END
    );
    
    RETURN NEW;
END;
$function$;
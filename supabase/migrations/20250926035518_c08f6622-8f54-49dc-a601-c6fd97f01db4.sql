-- Fix infinite recursion in profiles RLS policy
-- Drop the problematic policy and create a corrected one

DROP POLICY IF EXISTS "Organizations can view their students" ON public.profiles;

-- Create a corrected policy that doesn't cause infinite recursion
-- This policy allows organizations to view profiles of users from the same organization
CREATE POLICY "Organizations can view their students" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'organization'
    AND auth.users.raw_user_meta_data->>'organization_name' IS NOT NULL
    AND auth.users.raw_user_meta_data->>'organization_name' = profiles.organization_name
  )
);
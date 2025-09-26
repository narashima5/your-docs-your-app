-- Allow organization users to view student profiles linked by organization_name
-- First drop the policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Organizations can view their students" ON public.profiles;

-- Create the correct policy
CREATE POLICY "Organizations can view their students"
ON public.profiles
FOR SELECT
USING (
  exists (
    select 1
    from public.profiles org
    where org.user_id = auth.uid()
      and org.role = 'organization'
      and org.organization_name is not null
      and org.organization_name = profiles.organization_name
  )
);
-- Ensure profiles are created for all users and on future signups
-- 1) Create trigger to auto-insert profile on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2) Backfill profiles for existing users without a profile
INSERT INTO public.profiles (
  user_id, display_name, role, organization_name, region_district, region_state, region_country, gender
)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'display_name', u.email),
  COALESCE(u.raw_user_meta_data->>'role', 'student'),
  u.raw_user_meta_data->>'organization_name',
  u.raw_user_meta_data->>'region_district',
  u.raw_user_meta_data->>'region_state',
  COALESCE(u.raw_user_meta_data->>'region_country', 'India'),
  u.raw_user_meta_data->>'gender'
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

-- 3) Helpful index for quick lookups by user_id
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

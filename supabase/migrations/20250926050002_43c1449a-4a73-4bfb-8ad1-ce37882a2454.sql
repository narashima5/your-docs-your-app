-- Ensure trigger to auto-create profile on signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Ensure a unique index on profiles.user_id for 1:1 mapping
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_id_unique
ON public.profiles (user_id);

-- Backfill profiles for existing users missing a profile
INSERT INTO public.profiles (
  user_id,
  display_name,
  role,
  organization_name,
  region_district,
  region_state,
  region_country,
  gender
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

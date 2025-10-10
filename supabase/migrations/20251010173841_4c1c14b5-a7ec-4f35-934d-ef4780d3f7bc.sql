-- Verify and update handle_new_user trigger to properly handle organization_code
-- This ensures organizations get auto-generated codes and students get linked via their provided code

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger to ensure it fires on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure sync_student_org_name trigger exists and fires before insert/update
DROP TRIGGER IF EXISTS sync_student_org_name_trigger ON public.profiles;

CREATE TRIGGER sync_student_org_name_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_student_org_name();

-- Ensure award_org_points_on_student_join trigger exists
DROP TRIGGER IF EXISTS award_org_points_on_student_join_trigger ON public.profiles;

CREATE TRIGGER award_org_points_on_student_join_trigger
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.award_org_points_on_student_join();

-- Add index on organization_code for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_organization_code ON public.profiles(organization_code);

-- Add index on organization_name for better query performance  
CREATE INDEX IF NOT EXISTS idx_profiles_organization_name ON public.profiles(organization_name);
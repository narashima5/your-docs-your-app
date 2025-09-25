-- Fix the security definer view issue by creating proper functions
-- Remove any problematic views first
DROP VIEW IF EXISTS public.organization_leaderboard CASCADE;

-- Create a proper view for organization leaderboard without SECURITY DEFINER
CREATE VIEW public.organization_leaderboard AS
SELECT 
  p.organization_name,
  p.region_district,
  p.region_state,
  p.region_country,
  COUNT(*) as student_count,
  SUM(p.eco_points) as total_eco_points,
  AVG(p.eco_points) as avg_eco_points,
  SUM(p.completed_lessons) as total_lessons_completed,
  SUM(p.completed_missions) as total_missions_completed
FROM public.profiles p
WHERE p.role = 'student' AND p.organization_name IS NOT NULL
GROUP BY p.organization_name, p.region_district, p.region_state, p.region_country;
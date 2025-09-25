-- Fix security definer view by recreating without SECURITY DEFINER
DROP VIEW IF EXISTS public.organization_leaderboard;

-- Recreate organization_leaderboard view without SECURITY DEFINER
CREATE VIEW public.organization_leaderboard AS
SELECT 
  organization_name,
  region_district,
  region_state,
  region_country,
  COUNT(*) as student_count,
  SUM(eco_points) as total_eco_points,
  AVG(eco_points) as avg_eco_points,
  SUM(completed_lessons) as total_lessons_completed,
  SUM(completed_missions) as total_missions_completed
FROM public.profiles 
WHERE role = 'student' AND organization_name IS NOT NULL
GROUP BY organization_name, region_district, region_state, region_country
ORDER BY student_count DESC, total_eco_points DESC;
-- Add role and gender fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role TEXT NOT NULL DEFAULT 'student',
ADD COLUMN gender TEXT,
ADD COLUMN organization_name TEXT;

-- Add constraint for valid roles
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('student', 'organization'));

-- Add constraint for valid genders
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_gender_check 
CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));

-- Create organization_leaderboard view for organizations
CREATE OR REPLACE VIEW public.organization_leaderboard AS
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

-- Create lesson_videos table to track video progress
CREATE TABLE public.lesson_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  video_position DECIMAL DEFAULT 0,
  duration DECIMAL DEFAULT 0,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS on lesson_videos
ALTER TABLE public.lesson_videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lesson_videos
CREATE POLICY "Users can view their own video progress" 
ON public.lesson_videos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own video progress" 
ON public.lesson_videos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video progress" 
ON public.lesson_videos 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for updating lesson_videos updated_at
CREATE TRIGGER update_lesson_videos_updated_at
BEFORE UPDATE ON public.lesson_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role, organization_name, region_district, region_state, region_country, gender)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'organization_name',
    NEW.raw_user_meta_data->>'region_district',
    NEW.raw_user_meta_data->>'region_state',
    COALESCE(NEW.raw_user_meta_data->>'region_country', 'India'),
    NEW.raw_user_meta_data->>'gender'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
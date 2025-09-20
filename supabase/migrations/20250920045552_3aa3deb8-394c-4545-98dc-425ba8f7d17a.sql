-- Add columns for file uploads in mission submissions
ALTER TABLE public.mission_submissions 
ADD COLUMN IF NOT EXISTS submission_files TEXT[] DEFAULT '{}';

-- Add leaderboard tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS region_district TEXT,
ADD COLUMN IF NOT EXISTS region_state TEXT,
ADD COLUMN IF NOT EXISTS region_country TEXT DEFAULT 'India';

-- Create badges table for lesson badges
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'lesson',
  requirements JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table to track earned badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS for new tables
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges (publicly readable)
CREATE POLICY "Anyone can view badges" 
ON public.badges 
FOR SELECT 
USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Users can view their own badges" 
ON public.user_badges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges" 
ON public.user_badges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_badges_updated_at
BEFORE UPDATE ON public.badges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample badges for lessons
INSERT INTO public.badges (name, description, image_url, lesson_id, category) VALUES
('Climate Champion', 'Completed Climate Change Fundamentals lesson', '/badge-climate.png', (SELECT id FROM public.lessons WHERE title = 'Climate Change Fundamentals'), 'lesson'),
('Water Guardian', 'Completed Water Conservation Strategies lesson', '/badge-water.png', (SELECT id FROM public.lessons WHERE title = 'Water Conservation Strategies'), 'lesson'),
('Energy Expert', 'Completed Renewable Energy Sources lesson', '/badge-energy.png', (SELECT id FROM public.lessons WHERE title = 'Renewable Energy Sources'), 'lesson'),
('Farming Friend', 'Completed Sustainable Agriculture lesson', '/badge-farming.png', (SELECT id FROM public.lessons WHERE title = 'Sustainable Agriculture'), 'lesson'),
('Plastic Protector', 'Completed Plastic Pollution Solutions lesson', '/badge-plastic.png', (SELECT id FROM public.lessons WHERE title = 'Plastic Pollution Solutions'), 'lesson'),
('Bio Defender', 'Completed Biodiversity Conservation lesson', '/badge-biodiversity.png', (SELECT id FROM public.lessons WHERE title = 'Biodiversity Conservation'), 'lesson');

-- Function to award badge when lesson is completed
CREATE OR REPLACE FUNCTION public.award_lesson_badge()
RETURNS TRIGGER AS $$
BEGIN
  -- Only award if lesson is now completed and wasn't completed before
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    -- Award the lesson badge
    INSERT INTO public.user_badges (user_id, badge_id)
    SELECT NEW.user_id, b.id
    FROM public.badges b
    WHERE b.lesson_id = NEW.lesson_id
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for badge awarding
CREATE TRIGGER award_badge_on_lesson_completion
AFTER UPDATE ON public.lesson_progress
FOR EACH ROW
EXECUTE FUNCTION public.award_lesson_badge();
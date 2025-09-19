-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  category TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  thumbnail_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create missions table
CREATE TABLE public.missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  category TEXT NOT NULL,
  estimated_time TEXT NOT NULL,
  requirements JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lesson_progress table to track user progress through lessons
CREATE TABLE public.lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create mission_submissions table to track user mission submissions
CREATE TABLE public.mission_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'approved', 'rejected')),
  submission_data JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT,
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_id)
);

-- Enable Row Level Security
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lessons (publicly readable)
CREATE POLICY "Anyone can view published lessons" 
ON public.lessons 
FOR SELECT 
USING (is_published = true);

-- RLS Policies for missions (publicly readable)
CREATE POLICY "Anyone can view active missions" 
ON public.missions 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for lesson_progress
CREATE POLICY "Users can view their own lesson progress" 
ON public.lesson_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lesson progress" 
ON public.lesson_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress" 
ON public.lesson_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for mission_submissions
CREATE POLICY "Users can view their own mission submissions" 
ON public.mission_submissions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mission submissions" 
ON public.mission_submissions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mission submissions" 
ON public.mission_submissions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_missions_updated_at
BEFORE UPDATE ON public.missions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at
BEFORE UPDATE ON public.lesson_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mission_submissions_updated_at
BEFORE UPDATE ON public.mission_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample lessons data
INSERT INTO public.lessons (title, description, content, difficulty, category, duration_minutes, order_index) VALUES
('Climate Change Fundamentals', 'Understanding the science behind global warming and its impacts on our planet.', '{"sections": [{"title": "Introduction", "content": "Climate change refers to long-term shifts in temperatures and weather patterns."}, {"title": "Causes", "content": "Human activities are the main driver of climate change, primarily fossil fuel burning."}, {"title": "Effects", "content": "Rising sea levels, extreme weather, and ecosystem disruption are key effects."}]}', 'Beginner', 'Climate Change', 45, 1),
('Water Conservation Strategies', 'Learn practical methods to conserve water in daily life and communities.', '{"sections": [{"title": "Home Conservation", "content": "Simple changes like fixing leaks and efficient appliances make a difference."}, {"title": "Community Action", "content": "Rainwater harvesting and greywater systems for larger impact."}, {"title": "Agricultural Water Use", "content": "Drip irrigation and drought-resistant crops reduce water consumption."}]}', 'Beginner', 'Water Conservation', 30, 2),
('Renewable Energy Sources', 'Explore solar, wind, and other renewable energy technologies.', '{"sections": [{"title": "Solar Power", "content": "Converting sunlight into electricity using photovoltaic cells."}, {"title": "Wind Energy", "content": "Harnessing wind currents to generate clean electricity."}, {"title": "Other Sources", "content": "Hydroelectric, geothermal, and biomass energy alternatives."}]}', 'Intermediate', 'Energy', 60, 3),
('Sustainable Agriculture', 'Modern farming techniques that protect the environment.', '{"sections": [{"title": "Organic Farming", "content": "Growing crops without synthetic pesticides and fertilizers."}, {"title": "Permaculture", "content": "Designing agricultural systems that mimic natural ecosystems."}, {"title": "Crop Rotation", "content": "Alternating crops to maintain soil health and reduce pests."}]}', 'Advanced', 'Agriculture', 75, 4),
('Plastic Pollution Solutions', 'Understanding plastic waste and innovative solutions to reduce it.', '{"sections": [{"title": "The Problem", "content": "Plastic pollution affects marine life and human health worldwide."}, {"title": "Reduction Strategies", "content": "Refusing single-use plastics and choosing alternatives."}, {"title": "Innovations", "content": "Biodegradable plastics and recycling technologies offer hope."}]}', 'Intermediate', 'Waste Management', 40, 5),
('Biodiversity Conservation', 'Protecting ecosystems and endangered species around the world.', '{"sections": [{"title": "Importance of Biodiversity", "content": "Diverse ecosystems are more resilient and provide essential services."}, {"title": "Threats", "content": "Habitat loss, climate change, and pollution endanger species."}, {"title": "Conservation Efforts", "content": "Protected areas, species recovery programs, and sustainable practices."}]}', 'Intermediate', 'Conservation', 50, 6);

-- Insert sample missions data
INSERT INTO public.missions (title, description, instructions, points, difficulty, category, estimated_time) VALUES
('Plant a Tree', 'Plant a native tree species in your locality and document its growth.', E'1. Choose appropriate location\n2. Dig proper sized hole\n3. Plant and water\n4. Take before/after photos', 150, 'Beginner', 'Conservation', '2 hours'),
('Plastic-Free Day Challenge', 'Go an entire day without using any single-use plastic items.', E'1. Plan plastic alternatives\n2. Document your day\n3. Share your experience\n4. Calculate plastic saved', 100, 'Intermediate', 'Waste Reduction', '1 day'),
('Community Clean-up Drive', 'Organize or participate in a local community cleaning activity.', E'1. Gather volunteers\n2. Collect cleaning supplies\n3. Clean designated area\n4. Properly dispose waste', 200, 'Intermediate', 'Community Action', '3 hours'),
('Energy Audit at Home', 'Conduct a comprehensive energy audit and implement conservation measures.', E'1. Check all appliances\n2. Measure energy consumption\n3. Identify inefficiencies\n4. Implement solutions', 120, 'Advanced', 'Energy Conservation', '4 hours'),
('Rain Water Harvesting Setup', 'Install a basic rainwater collection system for your home or school.', E'1. Design collection system\n2. Install gutters/pipes\n3. Set up storage tank\n4. Test and document', 250, 'Advanced', 'Water Conservation', '1 day'),
('Organic Composting Project', 'Start a composting system using kitchen waste and garden materials.', E'1. Set up compost bin\n2. Collect organic waste\n3. Maintain proper ratios\n4. Monitor decomposition', 180, 'Beginner', 'Waste Management', '30 minutes daily');

-- Create function to update user stats when lesson is completed
CREATE OR REPLACE FUNCTION public.update_user_stats_on_lesson_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if lesson is now completed and wasn't completed before
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    UPDATE public.profiles 
    SET 
      completed_lessons = completed_lessons + 1,
      eco_points = eco_points + 25, -- 25 points per lesson
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for lesson completion
CREATE TRIGGER update_stats_on_lesson_completion
AFTER UPDATE ON public.lesson_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_user_stats_on_lesson_completion();

-- Create function to update user stats when mission is approved
CREATE OR REPLACE FUNCTION public.update_user_stats_on_mission_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if mission is now approved and wasn't approved before
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE public.profiles 
    SET 
      completed_missions = completed_missions + 1,
      eco_points = eco_points + NEW.points_awarded,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for mission approval
CREATE TRIGGER update_stats_on_mission_approval
AFTER UPDATE ON public.mission_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_user_stats_on_mission_approval();
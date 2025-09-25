-- Add lesson_id to missions table to link missions with lessons
ALTER TABLE public.missions ADD COLUMN lesson_id uuid REFERENCES public.lessons(id);

-- Create an index for better performance
CREATE INDEX idx_missions_lesson_id ON public.missions(lesson_id);
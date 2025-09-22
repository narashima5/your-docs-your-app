-- Update the function to handle streak days and level calculation
CREATE OR REPLACE FUNCTION public.update_user_stats_on_lesson_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if lesson is now completed and wasn't completed before
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    -- Check if user completed a lesson today
    DECLARE
      today_date DATE := CURRENT_DATE;
      last_activity DATE;
      current_streak INTEGER;
      new_eco_points INTEGER;
      new_level INTEGER;
    BEGIN
      -- Get current profile data
      SELECT last_activity_date, streak_days, eco_points + 25 
      INTO last_activity, current_streak, new_eco_points
      FROM public.profiles 
      WHERE user_id = NEW.user_id;
      
      -- Calculate new level based on eco-points (every 200 points = 1 level)
      new_level := GREATEST(1, (new_eco_points / 200) + 1);
      
      -- Update streak logic
      IF last_activity IS NULL OR last_activity < today_date - INTERVAL '1 day' THEN
        -- Reset streak if more than 1 day gap
        IF last_activity = today_date - INTERVAL '1 day' THEN
          -- Consecutive day, increment streak
          current_streak := current_streak + 1;
        ELSE
          -- Gap in activity, reset streak to 1
          current_streak := 1;
        END IF;
      ELSIF last_activity = today_date THEN
        -- Already completed a lesson today, don't increment streak
        current_streak := current_streak;
      END IF;
      
      -- Update profile with new stats
      UPDATE public.profiles 
      SET 
        completed_lessons = completed_lessons + 1,
        eco_points = new_eco_points,
        level = new_level,
        streak_days = current_streak,
        last_activity_date = today_date,
        updated_at = now()
      WHERE user_id = NEW.user_id;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
-- Create function to update streak days
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_activity_date DATE;
  v_current_streak INTEGER;
  v_new_streak INTEGER;
BEGIN
  -- Get current profile data
  SELECT last_activity_date, streak_days
  INTO v_last_activity_date, v_current_streak
  FROM profiles
  WHERE user_id = NEW.user_id;

  -- If no last activity or it's a different day
  IF v_last_activity_date IS NULL THEN
    -- First activity ever
    v_new_streak := 1;
  ELSIF v_last_activity_date = CURRENT_DATE THEN
    -- Same day, keep current streak
    v_new_streak := v_current_streak;
  ELSIF v_last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    v_new_streak := v_current_streak + 1;
  ELSE
    -- Streak broken, reset to 1
    v_new_streak := 1;
  END IF;

  -- Update profile with new streak and last activity date
  UPDATE profiles
  SET 
    streak_days = v_new_streak,
    last_activity_date = CURRENT_DATE
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Create trigger for lesson progress updates
DROP TRIGGER IF EXISTS update_streak_on_lesson_progress ON lesson_progress;
CREATE TRIGGER update_streak_on_lesson_progress
  AFTER INSERT OR UPDATE ON lesson_progress
  FOR EACH ROW
  WHEN (NEW.is_completed = true)
  EXECUTE FUNCTION update_user_streak();

-- Create trigger for mission submission updates
DROP TRIGGER IF EXISTS update_streak_on_mission_submission ON mission_submissions;
CREATE TRIGGER update_streak_on_mission_submission
  AFTER INSERT OR UPDATE ON mission_submissions
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION update_user_streak();

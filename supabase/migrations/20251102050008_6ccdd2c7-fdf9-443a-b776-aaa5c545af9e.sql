-- Streak logic: count only student's first activity of the day (exclude logins) across lessons, videos, missions
-- 1) Replace unified streak trigger function to increment on first activity and ignore non-student actors
CREATE OR REPLACE FUNCTION public.update_user_streak()
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
  -- Only count when the student themself is the actor
  IF auth.uid() IS NULL OR auth.uid() <> NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT last_activity_date, streak_days
  INTO v_last_activity_date, v_current_streak
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  -- No change if already recorded activity today
  IF v_last_activity_date = CURRENT_DATE THEN
    RETURN NEW;
  ELSIF v_last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN
    v_new_streak := COALESCE(v_current_streak, 0) + 1;
  ELSE
    -- Gap or first ever activity => streak starts at 1 today
    v_new_streak := 1;
  END IF;

  UPDATE public.profiles
  SET 
    streak_days = v_new_streak,
    last_activity_date = CURRENT_DATE,
    updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- 2) Apply triggers to student activity tables (not on approvals done by orgs)
-- Lesson progress: any insert/update counts as activity
DROP TRIGGER IF EXISTS update_streak_on_lesson_progress ON public.lesson_progress;
CREATE TRIGGER update_streak_on_lesson_progress
  AFTER INSERT OR UPDATE ON public.lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_streak();

-- Lesson videos: watching/progress is activity
DROP TRIGGER IF EXISTS update_streak_on_lesson_video ON public.lesson_videos;
CREATE TRIGGER update_streak_on_lesson_video
  AFTER INSERT OR UPDATE ON public.lesson_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_streak();

-- Mission submissions: student starting/submitting is activity (function will ignore non-student actors)
DROP TRIGGER IF EXISTS update_streak_on_mission_submission ON public.mission_submissions;
CREATE TRIGGER update_streak_on_mission_submission
  AFTER INSERT OR UPDATE ON public.mission_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_streak();

-- 3) Ensure approval/completion functions don't manipulate streak (to avoid double counting and counting org actions)
CREATE OR REPLACE FUNCTION public.update_user_stats_on_lesson_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_eco_points integer;
  new_level integer;
BEGIN
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN
    SELECT p.eco_points + 25
    INTO new_eco_points
    FROM public.profiles p
    WHERE p.user_id = NEW.user_id;

    -- Level calculation: every 200 points for students
    new_level := GREATEST(1, (new_eco_points / 200) + 1);

    UPDATE public.profiles 
    SET 
      completed_lessons = completed_lessons + 1,
      eco_points = new_eco_points,
      level = new_level,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_stats_on_mission_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_eco_points integer;
  new_level integer;
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    SELECT p.eco_points + COALESCE(NEW.points_awarded, 0)
    INTO new_eco_points
    FROM public.profiles p
    WHERE p.user_id = NEW.user_id;

    -- Level calculation: every 200 points for students
    new_level := GREATEST(1, (new_eco_points / 200) + 1);

    UPDATE public.profiles 
    SET 
      completed_missions = completed_missions + 1,
      eco_points = new_eco_points,
      level = new_level,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$function$;

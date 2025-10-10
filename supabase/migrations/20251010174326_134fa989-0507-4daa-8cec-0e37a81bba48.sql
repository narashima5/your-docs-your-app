-- Update streak logic: reset to 0 if no activity, only increase once per day on activity
-- Also ensure organization levels increase every 2000 points (not 200)

-- Update the lesson completion trigger to handle streak correctly
CREATE OR REPLACE FUNCTION public.update_user_stats_on_lesson_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  today_date date := current_date;
  last_activity date;
  current_streak integer;
  new_eco_points integer;
  new_level integer;
begin
  if new.is_completed = true and (old.is_completed is null or old.is_completed = false) then
    select p.last_activity_date, p.streak_days, p.eco_points + 25
    into last_activity, current_streak, new_eco_points
    from public.profiles p
    where p.user_id = new.user_id;

    -- Streak update rules: only increase if activity on consecutive day
    if last_activity is null then
      current_streak := 1;  -- First activity ever
    elsif last_activity = today_date then
      current_streak := current_streak;  -- Already active today, no change
    elsif last_activity = (today_date - interval '1 day') then
      current_streak := current_streak + 1;  -- Consecutive day
    else
      current_streak := 1;  -- Gap in activity, reset to 1
    end if;

    -- Level calculation: every 200 points for students
    new_level := greatest(1, (new_eco_points / 200) + 1);

    update public.profiles 
    set 
      completed_lessons = completed_lessons + 1,
      eco_points = new_eco_points,
      level = new_level,
      streak_days = current_streak,
      last_activity_date = today_date,
      updated_at = now()
    where user_id = new.user_id;
  end if;
  return new;
end;
$function$;

-- Update the mission completion trigger to handle streak correctly
CREATE OR REPLACE FUNCTION public.update_user_stats_on_mission_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  today_date date := current_date;
  last_activity date;
  current_streak integer;
  new_eco_points integer;
  new_level integer;
begin
  if new.status = 'approved' and (old.status is null or old.status != 'approved') then
    select p.last_activity_date, p.streak_days, p.eco_points + coalesce(new.points_awarded,0)
    into last_activity, current_streak, new_eco_points
    from public.profiles p
    where p.user_id = new.user_id;

    -- Streak update rules: only increase if activity on consecutive day
    if last_activity is null then
      current_streak := 1;  -- First activity ever
    elsif last_activity = today_date then
      current_streak := current_streak;  -- Already active today, no change
    elsif last_activity = (today_date - interval '1 day') then
      current_streak := current_streak + 1;  -- Consecutive day
    else
      current_streak := 1;  -- Gap in activity, reset to 1
    end if;

    -- Level calculation: every 200 points for students
    new_level := greatest(1, (new_eco_points / 200) + 1);

    update public.profiles 
    set 
      completed_missions = completed_missions + 1,
      eco_points = new_eco_points,
      level = new_level,
      streak_days = current_streak,
      last_activity_date = today_date,
      updated_at = now()
    where user_id = new.user_id;
  end if;
  return new;
end;
$function$;

-- Update organization stats trigger to use 2000 points per level and add same points as student
CREATE OR REPLACE FUNCTION public.update_org_stats_on_mission_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  student_org_code text;
  student_name text;
  mission_title text;
  new_org_points integer;
  new_org_level integer;
BEGIN
  -- Only update if mission is now approved and wasn't approved before
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    -- Get student's organization code and name
    SELECT p.organization_code, p.display_name
    INTO student_org_code, student_name
    FROM public.profiles p
    WHERE p.user_id = NEW.user_id;
    
    -- Get mission title
    SELECT m.title INTO mission_title
    FROM public.missions m
    WHERE m.id = NEW.mission_id;
    
    -- Award points to organization (same points as student earned)
    IF student_org_code IS NOT NULL THEN
      -- Calculate new points and level
      SELECT 
        p.eco_points + NEW.points_awarded,
        GREATEST(1, ((p.eco_points + NEW.points_awarded) / 2000) + 1)
      INTO new_org_points, new_org_level
      FROM public.profiles p
      WHERE p.role = 'organization' AND p.organization_code = student_org_code;

      UPDATE public.profiles
      SET 
        eco_points = new_org_points,
        level = new_org_level,
        updated_at = now()
      WHERE role = 'organization' AND organization_code = student_org_code;
      
      -- Log activity
      INSERT INTO public.activity_log (organization_code, user_id, activity_type, activity_message, metadata)
      VALUES (
        student_org_code,
        NEW.user_id,
        'mission_approved',
        student_name || ' completed "' || mission_title || '" and earned ' || NEW.points_awarded || ' points',
        jsonb_build_object('mission_id', NEW.mission_id, 'points', NEW.points_awarded)
      );
    END IF;
  END IF;
  
  -- Log rejection
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    SELECT p.organization_code, p.display_name
    INTO student_org_code, student_name
    FROM public.profiles p
    WHERE p.user_id = NEW.user_id;
    
    SELECT m.title INTO mission_title
    FROM public.missions m
    WHERE m.id = NEW.mission_id;
    
    IF student_org_code IS NOT NULL THEN
      INSERT INTO public.activity_log (organization_code, user_id, activity_type, activity_message, metadata)
      VALUES (
        student_org_code,
        NEW.user_id,
        'mission_rejected',
        student_name || '''s submission for "' || mission_title || '" was rejected',
        jsonb_build_object('mission_id', NEW.mission_id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create a scheduled job to reset streaks at midnight (optional, requires pg_cron extension)
-- This ensures streaks are reset to 0 if no activity
-- Note: This is commented out as it requires pg_cron extension which may not be available
-- Users can manually enable it if needed
/*
-- Enable pg_cron extension first (requires superuser)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily streak check at midnight
SELECT cron.schedule(
  'reset-inactive-streaks',
  '0 0 * * *',  -- Every day at midnight
  $$
  UPDATE public.profiles
  SET streak_days = 0
  WHERE last_activity_date < CURRENT_DATE - INTERVAL '1 day'
    AND streak_days > 0;
  $$
);
*/
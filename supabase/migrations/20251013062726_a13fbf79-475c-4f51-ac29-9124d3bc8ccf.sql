-- ============================================================================
-- FIX 1: Remove organization_leaderboard view (security risk - no RLS possible)
-- ============================================================================

DROP VIEW IF EXISTS public.organization_leaderboard CASCADE;

-- ============================================================================
-- FIX 2: Normalize video_url data and add validation
-- ============================================================================

-- Step 1: Clean up existing video URLs - convert full URLs to storage keys
-- Handle signed URLs
UPDATE public.mission_submissions
SET video_url = regexp_replace(
  video_url,
  '^https://[^/]+/storage/v1/object/sign/mission-videos/([^?]+).*$',
  '\1'
)
WHERE video_url ~ '^https://.*storage/v1/object/sign/mission-videos/';

-- Handle public URLs
UPDATE public.mission_submissions
SET video_url = regexp_replace(
  video_url,
  '^https://[^/]+/storage/v1/object/public/mission-videos/(.+)$',
  '\1'
)
WHERE video_url ~ '^https://.*storage/v1/object/public/mission-videos/';

-- URL decode any percent-encoded characters
UPDATE public.mission_submissions
SET video_url = replace(video_url, '%20', ' ')
WHERE video_url LIKE '%20%';

-- Step 2: Add validation constraint for video_url
DO $$ BEGIN
  ALTER TABLE public.mission_submissions
  ADD CONSTRAINT video_url_storage_key_format
  CHECK (
    video_url IS NULL OR 
    -- Allow storage keys with alphanumeric, dots, underscores, hyphens, slashes, and spaces
    video_url ~ '^[a-zA-Z0-9._/ -]+$'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
-- Check for any SECURITY DEFINER functions that might be causing the issue
-- List all functions with SECURITY DEFINER
SELECT 
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_result(p.oid) as result_type,
  pg_get_function_arguments(p.oid) as arguments,
  CASE 
    WHEN p.prosecdef THEN 'DEFINER'
    ELSE 'INVOKER'
  END as security_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('public', 'auth', 'storage')
  AND p.prosecdef = true
ORDER BY n.nspname, p.proname;
-- Add org_admin role to enum (must be in separate transaction)
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'org_admin';
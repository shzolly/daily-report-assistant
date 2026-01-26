-- Remove the foreign key constraint to auth.users
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Make id a regular UUID primary key (not linked to auth.users)
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add last_login column for tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

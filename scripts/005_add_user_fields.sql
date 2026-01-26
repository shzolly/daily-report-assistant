-- Add full_name column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add is_active column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing users to have a default full_name based on username if null
UPDATE users SET full_name = username WHERE full_name IS NULL;

-- Add is_active column to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add is_active column to activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

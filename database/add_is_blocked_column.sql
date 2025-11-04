-- Adding is_blocked column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- Creating index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_is_blocked ON users(is_blocked);



-- Adding phone column (for healthcare provider communication)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Adding email_verified column (tracks if email is verified)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Adding email_verified_at column (timestamp of verification)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP;

-- Adding verification_token column (for email verification links)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);

-- Creating indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);



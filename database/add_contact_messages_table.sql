-- ADDING CONTACT MESSAGES TABLE

-- Dropping table if it exists
DROP TABLE IF EXISTS contact_messages CASCADE;

-- CREATING CONTACT MESSAGES TABLE
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  user_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creating indexes on contact_messages table
CREATE INDEX idx_contact_messages_email ON contact_messages(email);
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_user_type ON contact_messages(user_type);

-- ENABLING ROW LEVEL SECURITY (RLS)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- CREATING RLS POLICIES

-- Allowing anyone to insert contact messages (public form)
CREATE POLICY "Anyone can insert contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Allowing admins to view all contact messages
CREATE POLICY "Admins can view all contact messages" ON contact_messages
  FOR SELECT USING (true);

-- CREATING TRIGGER FOR UPDATED_AT
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON contact_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



-- WOMBGUARD DATABASE SETUP

-- STEP 1: DROPPING ALL EXISTING TABLES (CLEAN SLATE)

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS chat_history CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS predictions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Droping functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;


-- STEP 2: CREATING USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'pregnant_woman',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creating indexes on users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- STEP 3: CREATING PREDICTIONS TABLE
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255),
  predicted_risk VARCHAR(50),
  probability FLOAT,
  confidence_score FLOAT,
  age FLOAT,
  systolic_bp FLOAT,
  diastolic FLOAT,
  bs FLOAT,
  body_temp FLOAT,
  bmi FLOAT,
  heart_rate FLOAT,
  feature_importance JSONB,
  explanation TEXT,
  role VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Createing indexes on predictions table
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_user_email ON predictions(user_email);
CREATE INDEX idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX idx_predictions_risk ON predictions(predicted_risk);

-- STEP 4: CREATING CHAT HISTORY TABLE
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255),
  user_email VARCHAR(255),
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  conversation_id VARCHAR(255),
  message_type VARCHAR(50) DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creating indexes on chat_history table
CREATE INDEX idx_chat_user_id ON chat_history(user_id);
CREATE INDEX idx_chat_user_email ON chat_history(user_email);
CREATE INDEX idx_chat_conversation_id ON chat_history(conversation_id);
CREATE INDEX idx_chat_created_at ON chat_history(created_at DESC);

-- STEP 5: CREATING CONVERSATIONS TABLE
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(255),
  user_email VARCHAR(255),
  title VARCHAR(255),
  summary TEXT,
  message_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creating indexes on conversations table
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_user_email ON conversations(user_email);
CREATE INDEX idx_conversations_conversation_id ON conversations(conversation_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

-- STEP 6: CREATING AUDIT LOGS TABLE
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255),
  user_email VARCHAR(255),
  action VARCHAR(100),
  table_name VARCHAR(100),
  record_id VARCHAR(255),
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creating indexes on audit_logs table
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_user_email ON audit_logs(user_email);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- STEP 7: ENABLING ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- STEP 8: CREATING RLS POLICIES

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Predictions table policies
CREATE POLICY "Users can view own predictions" ON predictions
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert own predictions" ON predictions
  FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');

-- Chat history policies
CREATE POLICY "Users can view own chat history" ON chat_history
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert own chat messages" ON chat_history
  FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (user_email = auth.jwt() ->> 'email');

-- Audit logs policies
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (user_email = auth.jwt() ->> 'email');

-- STEP 9: CREATING FUNCTIONS

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 10: CREATING TRIGGERS

-- Triggering for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggering for conversations table
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();




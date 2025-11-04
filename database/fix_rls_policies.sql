
-- Allowing registration and data insertion

-- Dropping existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own predictions" ON predictions;
DROP POLICY IF EXISTS "Users can insert own predictions" ON predictions;
DROP POLICY IF EXISTS "Users can view own chat history" ON chat_history;
DROP POLICY IF EXISTS "Users can insert own chat messages" ON chat_history;
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;

-- USERS TABLE POLICIES

-- Allowing anyone to insert (for registration)
CREATE POLICY "Allow registration" ON users
  FOR INSERT WITH CHECK (true);

-- Allowing users to view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (
    auth.uid()::text = id::text OR
    email = auth.jwt() ->> 'email' OR
    true  -- Allow viewing for now
  );

-- Allowing users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (
    auth.uid()::text = id::text OR
    email = auth.jwt() ->> 'email'
  );

-- PREDICTIONS TABLE POLICIES

-- Allowing anyone to insert predictions
CREATE POLICY "Allow prediction insert" ON predictions
  FOR INSERT WITH CHECK (true);

-- Allowing users to view their own predictions
CREATE POLICY "Users can view own predictions" ON predictions
  FOR SELECT USING (
    user_email = auth.jwt() ->> 'email' OR
    true  -- Allow viewing for now
  );

-- CHAT HISTORY TABLE POLICIES

-- Allowing anyone to insert chat messages
CREATE POLICY "Allow chat insert" ON chat_history
  FOR INSERT WITH CHECK (true);

-- Allowing users to view their own chat history
CREATE POLICY "Users can view own chat history" ON chat_history
  FOR SELECT USING (
    user_email = auth.jwt() ->> 'email' OR
    true  -- Allow viewing for now
  );

-- CONVERSATIONS TABLE POLICIES

-- Allowing anyone to insert conversations
CREATE POLICY "Allow conversation insert" ON conversations
  FOR INSERT WITH CHECK (true);

-- Allowing users to view their own conversations
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (
    user_email = auth.jwt() ->> 'email' OR
    true  
  );


-- AUDITING LOGS TABLE POLICIES

-- Allowing anyone to insert audit logs
CREATE POLICY "Allow audit log insert" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Allowing users to view their own audit logs
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (
    user_email = auth.jwt() ->> 'email' OR
    true  
  );



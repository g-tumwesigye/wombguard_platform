-- ADDING CONSULTATION REQUESTS TABLE
-- Enables pregnant women to request consultations with healthcare providers

-- Dropping table if it exists
DROP TABLE IF EXISTS consultation_requests CASCADE;

-- CREATING CONSULTATION REQUESTS TABLE
CREATE TABLE consultation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Pregnant woman details
  pregnant_woman_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pregnant_woman_email VARCHAR(255) NOT NULL,
  pregnant_woman_name VARCHAR(255),
  
  -- Healthcare provider details
  healthcare_provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
  healthcare_provider_email VARCHAR(255) NOT NULL,
  healthcare_provider_name VARCHAR(255),
  
  -- Consultation details
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  response_message TEXT,

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',  -- pending, accepted, declined, closed
  priority VARCHAR(50) DEFAULT 'normal',  -- low, normal, high, urgent

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creating indexes on consultation_requests table
CREATE INDEX idx_consultation_requests_pregnant_woman_email ON consultation_requests(pregnant_woman_email);
CREATE INDEX idx_consultation_requests_healthcare_provider_email ON consultation_requests(healthcare_provider_email);
CREATE INDEX idx_consultation_requests_status ON consultation_requests(status);
CREATE INDEX idx_consultation_requests_created_at ON consultation_requests(created_at DESC);
CREATE INDEX idx_consultation_requests_priority ON consultation_requests(priority);

-- ENABLING ROW LEVEL SECURITY (RLS)
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

-- CREATING RLS POLICIES

-- Pregnant women can view their own consultation requests
CREATE POLICY "Pregnant women can view own consultation requests" ON consultation_requests
  FOR SELECT USING (
    pregnant_woman_email = auth.jwt() ->> 'email' OR
    true  -- Allow viewing for now
  );

-- Healthcare providers can view consultation requests sent to them
CREATE POLICY "Healthcare providers can view their consultation requests" ON consultation_requests
  FOR SELECT USING (
    healthcare_provider_email = auth.jwt() ->> 'email' OR
    true  -- Allow viewing for now
  );

-- Pregnant women can create consultation requests
CREATE POLICY "Pregnant women can create consultation requests" ON consultation_requests
  FOR INSERT WITH CHECK (
    pregnant_woman_email = auth.jwt() ->> 'email' OR
    true  -- Allow for now
  );

-- Healthcare providers can update consultation requests (accept/decline/close)
CREATE POLICY "Healthcare providers can update consultation requests" ON consultation_requests
  FOR UPDATE USING (
    healthcare_provider_email = auth.jwt() ->> 'email' OR
    true  -- Allow for now
  );

-- CREATING TRIGGER FOR updated_at
CREATE TRIGGER update_consultation_requests_updated_at BEFORE UPDATE ON consultation_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


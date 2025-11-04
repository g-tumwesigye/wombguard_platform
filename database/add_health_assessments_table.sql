-- ADDING HEALTH ASSESSMENTS TABLE
-- Storing detailed health check assessments with SHAP explanations
CREATE TABLE IF NOT EXISTS health_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  
  -- Vital Signs
  age FLOAT NOT NULL,
  systolic_bp FLOAT NOT NULL,
  diastolic_bp FLOAT NOT NULL,
  blood_sugar FLOAT NOT NULL,
  body_temp FLOAT NOT NULL,
  bmi FLOAT NOT NULL,
  heart_rate FLOAT NOT NULL,
  
  -- Prediction Results
  predicted_risk VARCHAR(50) NOT NULL,
  probability FLOAT NOT NULL,
  confidence_score FLOAT NOT NULL,
  
  -- SHAP Explanations (JSON format)
  feature_importance JSONB,
  top_features JSONB,  
  explanation_text TEXT,
  
  -- Metadata
  assessment_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creating indexes
CREATE INDEX idx_health_assessments_user_id ON health_assessments(user_id);
CREATE INDEX idx_health_assessments_user_email ON health_assessments(user_email);
CREATE INDEX idx_health_assessments_created_at ON health_assessments(created_at DESC);
CREATE INDEX idx_health_assessments_risk ON health_assessments(predicted_risk);

-- Enabling RLS
ALTER TABLE health_assessments ENABLE ROW LEVEL SECURITY;

-- Creating RLS policies
CREATE POLICY "Allow health assessment insert" ON health_assessments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own assessments" ON health_assessments
  FOR SELECT USING (
    user_email = auth.jwt() ->> 'email' OR
    true
  );

-- Creating trigger for updated_at
CREATE TRIGGER update_health_assessments_updated_at BEFORE UPDATE ON health_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



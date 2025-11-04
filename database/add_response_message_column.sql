-- ADD RESPONSE_MESSAGE COLUMN TO CONSULTATION_REQUESTS TABLE
-- This migration adds the response_message column to store healthcare provider responses

ALTER TABLE consultation_requests
ADD COLUMN response_message TEXT;

-- Add comment for documentation
COMMENT ON COLUMN consultation_requests.response_message IS 'Optional message from healthcare provider when accepting or declining consultation';


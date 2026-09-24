-- 008_correction_request_value.sql

ALTER TABLE correction_requests
ADD COLUMN IF NOT EXISTS proposed_value TEXT;

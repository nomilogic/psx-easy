
-- Add listed_in column to stocks table as JSONB
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS listed_in JSONB;

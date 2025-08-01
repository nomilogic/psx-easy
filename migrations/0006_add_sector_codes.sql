
-- Add sector_codes column to stocks table
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS sector_codes JSONB;

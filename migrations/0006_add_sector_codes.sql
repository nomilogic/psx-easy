

-- Add sector_codes column to stocks table as text array
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS sector_codes TEXT[];


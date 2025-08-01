

-- Add sector_code column to stocks table as text array
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS sector_code TEXT[];


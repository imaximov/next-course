-- Add is_deleted column to meals table with default value of false
ALTER TABLE meals ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Add an index on the is_deleted column for better query performance
CREATE INDEX IF NOT EXISTS idx_meals_is_deleted ON meals(is_deleted);

-- Update any existing meals to have is_deleted = false (in case they were set to null)
UPDATE meals SET is_deleted = false WHERE is_deleted IS NULL; 
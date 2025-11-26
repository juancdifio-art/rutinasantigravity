-- Migration: Add category column to exercises table
-- Run this script on your Neon database

-- Add category column with default value
ALTER TABLE exercises 
ADD COLUMN category VARCHAR(50) DEFAULT 'Otro';

-- Update existing exercises to have a default category
UPDATE exercises 
SET category = 'Otro' 
WHERE category IS NULL;

-- Optional: Create an index for faster filtering by category
CREATE INDEX idx_exercises_category ON exercises(category);

-- Verify the migration
SELECT id, name, category FROM exercises LIMIT 10;

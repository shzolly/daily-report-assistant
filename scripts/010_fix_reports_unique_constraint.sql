-- Fix reports table to allow one report per user per day
-- Run this in Supabase SQL Editor

-- Drop the existing unique constraint
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_user_id_week_start_date_key;

-- Add new unique constraint for user_id + report_date
ALTER TABLE public.reports ADD CONSTRAINT reports_user_id_report_date_key UNIQUE (user_id, report_date);

-- If the report_date column doesn't exist, add it
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS report_date date;

-- If week_end_date doesn't exist, add it
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS week_end_date date;

-- Update existing rows to set report_date if null (using report_date or derived from week_start_date)
UPDATE public.reports
SET report_date = report_date
WHERE report_date IS NOT NULL;

-- If you have existing data, you might need to set report_date based on your data structure
-- This assumes you have some way to determine the specific day for each report

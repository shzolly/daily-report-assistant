-- Add missing columns-- to reports table
 Run this in Supabase SQL Editor

-- Add report_date column (stores the specific date for this report entry)
alter table if exists public.reports
add column if not exists report_date date;

-- Add blockers column
alter table if exists public.reports
add column if not exists blockers text;

-- Add tomorrow_plan column
alter table if exists public.reports
add column if not exists tomorrow_plan text;

-- Add generated_report column
alter table if exists public.reports
add column if not exists generated_report text;

-- Add status column
alter table if exists public.reports
add column if not exists status text default 'draft';

-- Add day_of_week column for report_activities
alter table if exists public.report_activities
add column if not exists day_of_week integer;

-- Update existing report_activities with day_of_week if needed
-- (This assumes 1=Monday through 5=Friday based on the week_start_date)

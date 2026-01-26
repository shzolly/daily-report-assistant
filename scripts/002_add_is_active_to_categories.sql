-- Migration: Add is_active column to categories table
-- Run this SQL to fix the category status update issue

alter table if exists public.categories
add column if not exists is_active boolean default true;

-- Update existing categories to be active by default
update public.categories
set is_active = true
where is_active is null;

-- Enable RLS on the new column if not already enabled
alter table public.categories enable row level security;

-- Update RLS policy to check is_active for category visibility
create or replace policy "Everyone can view active categories"
  on public.categories for select
  using (is_active = true or exists (
    select 1 from public.users
    where id = auth.uid() and is_admin = true
  ));

-- Existing policies already allow admins to see all categories

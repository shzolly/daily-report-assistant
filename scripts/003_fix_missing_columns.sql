-- Migration: Add missing columns to users, categories, and activities tables

-- Add missing columns to users table
alter table if exists public.users
add column if not exists full_name text;

alter table if exists public.users
add column if not exists role text default 'user';

alter table if exists public.users
add column if not exists is_active boolean default true;

alter table if exists public.users
add column if not exists last_login timestamp with time zone;

-- Add missing columns to categories table
alter table if exists public.categories
add column if not exists is_active boolean default true;

-- Add missing columns to activities table
alter table if exists public.activities
add column if not exists is_active boolean default true;

-- Update null values
update public.users set is_active = true where is_active is null;
update public.categories set is_active = true where is_active is null;
update public.activities set is_active = true where is_active is null;

-- Set default role for existing users
update public.users set role = 'user' where role is null;
update public.users set is_admin = false where is_admin is null;

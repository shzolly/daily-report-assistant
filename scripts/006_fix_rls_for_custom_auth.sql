-- Create a table to track active sessions for custom auth
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone default (now() + interval '7 days')
);

-- Create index for faster session lookups
create index if not exists idx_sessions_user_id on public.sessions(user_id);
create index if not exists idx_sessions_expires on public.sessions(expires_at);

-- Function to get current user ID from request header
create or replace function current_user_id()
returns uuid
language plpgsql
security definer
as $$
declare
  user_id uuid;
  headers text;
begin
  headers := current_setting('request.headers', true);
  
  -- Extract user_id from headers (format: "x-user-id: <uuid>\n...")
  user_id := nullif(
    substring(
      headers from 
      'x-user-id[[:space:]]*:[[:space:]]*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'
    )::text,
    ''
  )::uuid;
  
  return user_id;
end;
$$;

-- Function to check if current user is admin
create or replace function is_admin()
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1 from public.users
    where id = current_user_id() and is_admin = true
  );
end;
$$;

-- Update users table RLS policies for custom auth
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Admins can view all users" on public.users;
drop policy if exists "Admins can update all users" on public.users;
drop policy if exists "Admins can delete users" on public.users;

create policy "Users can view their own profile"
  on public.users for select
  using (id = current_user_id());

create policy "Admins can view all users"
  on public.users for select
  using (is_admin() = true);

create policy "Admins can update all users"
  on public.users for update
  using (is_admin() = true);

create policy "Admins can delete users"
  on public.users for delete
  using (is_admin() = true);

-- Update categories RLS policies for custom auth
drop policy if exists "Admins can insert categories" on public.categories;
drop policy if exists "Admins can update categories" on public.categories;
drop policy if exists "Admins can delete categories" on public.categories;

create policy "Admins can insert categories"
  on public.categories for insert
  with check (is_admin() = true);

create policy "Admins can update categories"
  on public.categories for update
  using (is_admin() = true);

create policy "Admins can delete categories"
  on public.categories for delete
  using (is_admin() = true);

-- Update activities RLS policies for custom auth
drop policy if exists "Admins can insert activities" on public.activities;
drop policy if exists "Admins can update activities" on public.activities;
drop policy if exists "Admins can delete activities" on public.activities;

create policy "Admins can insert activities"
  on public.activities for insert
  with check (is_admin() = true);

create policy "Admins can update activities"
  on public.activities for update
  using (is_admin() = true);

create policy "Admins can delete activities"
  on public.activities for delete
  using (is_admin() = true);

-- Update reports RLS policies for custom auth
drop policy if exists "Admins can view all reports" on public.reports;
drop policy if exists "Admins can update all reports" on public.reports;
drop policy if exists "Admins can delete all reports" on public.reports;

create policy "Users can view their own reports"
  on public.reports for select
  using (user_id = current_user_id());

create policy "Admins can view all reports"
  on public.reports for select
  using (is_admin() = true);

create policy "Users can insert their own reports"
  on public.reports for insert
  with check (user_id = current_user_id());

create policy "Users can update their own reports"
  on public.reports for update
  using (user_id = current_user_id());

create policy "Admins can update all reports"
  on public.reports for update
  using (is_admin() = true);

create policy "Users can delete their own reports"
  on public.reports for delete
  using (user_id = current_user_id());

create policy "Admins can delete all reports"
  on public.reports for delete
  using (is_admin() = true);

-- Update report_activities RLS policies for custom auth
drop policy if exists "Admins can view all report activities" on public.report_activities;
drop policy if exists "Admins can update all report activities" on public.report_activities;
drop policy if exists "Admins can delete all report activities" on public.report_activities;

create policy "Users can view their own report activities"
  on public.report_activities for select
  using (
    exists (
      select 1 from public.reports
      where reports.id = report_activities.report_id
      and reports.user_id = current_user_id()
    )
  );

create policy "Admins can view all report activities"
  on public.report_activities for select
  using (is_admin() = true);

create policy "Users can insert their own report activities"
  on public.report_activities for insert
  with check (
    exists (
      select 1 from public.reports
      where reports.id = report_activities.report_id
      and reports.user_id = current_user_id()
    )
  );

create policy "Users can update their own report activities"
  on public.report_activities for update
  using (
    exists (
      select 1 from public.reports
      where reports.id = report_activities.report_id
      and reports.user_id = current_user_id()
    )
  );

create policy "Admins can update all report activities"
  on public.report_activities for update
  using (is_admin() = true);

create policy "Users can delete their own report activities"
  on public.report_activities for delete
  using (
    exists (
      select 1 from public.reports
      where reports.id = report_activities.report_id
      and reports.user_id = current_user_id()
    )
  );

create policy "Admins can delete all report activities"
  on public.report_activities for delete
  using (is_admin() = true);

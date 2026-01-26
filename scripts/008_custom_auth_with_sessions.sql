-- Custom authentication system using direct user_id cookie

-- Drop existing custom functions and tables
drop function if exists current_user_id() cascade;
drop function if exists is_admin() cascade;
drop table if exists public.sessions cascade;

-- Drop all existing RLS policies
alter table public.users drop policy if exists "Users can view their own profile";
alter table public.users drop policy if exists "Admins can view all users";
alter table public.users drop policy if exists "Admins can update all users";
alter table public.users drop policy if exists "Admins can delete users";

alter table public.categories drop policy if exists "Everyone can view categories";
alter table public.categories drop policy if exists "Admins can insert categories";
alter table public.categories drop policy if exists "Admins can update categories";
alter table public.categories drop policy if exists "Admins can delete categories";

alter table public.activities drop policy if exists "Everyone can view activities";
alter table public.activities drop policy if exists "Admins can insert activities";
alter table public.activities drop policy if exists "Admins can update activities";
alter table public.activities drop policy if exists "Admins can delete activities";

alter table public.reports drop policy if exists "Users can view their own reports";
alter table public.reports drop policy if exists "Admins can view all reports";
alter table public.reports drop policy if exists "Users can insert their own reports";
alter table public.reports drop policy if exists "Users can update their own reports";
alter table public.reports drop policy if exists "Admins can update all reports";
alter table public.reports drop policy if exists "Users can delete their own reports";
alter table public.reports drop policy if exists "Admins can delete all reports";

alter table public.report_activities drop policy if exists "Users can view their own report activities";
alter table public.report_activities drop policy if exists "Admins can view all report activities";
alter table public.report_activities drop policy if exists "Users can insert their own report activities";
alter table public.report_activities drop policy if exists "Users can update their own report activities";
alter table public.report_activities drop policy if exists "Admins can update all report activities";
alter table public.report_activities drop policy if exists "Users can delete their own report activities";
alter table public.report_activities drop policy if exists "Admins can delete all report activities";

-- Function to get current user ID from cookie
create or replace function current_user_id()
returns uuid
language plpgsql
security definer
as $$
declare
  user_id uuid;
  cookie_text text;
  user_id_pos int;
begin
  -- Get cookie text - try different approaches
  begin
    cookie_text := current_setting('request.cookie', true);
  exception
    when others then return null;
  end;
  
  if cookie_text is null or cookie_text = '' then
    return null;
  end if;

  -- Look for "user_id=" in the cookie string
  user_id_pos := position('user_id=' in cookie_text);
  
  if user_id_pos = 0 then
    return null;
  end if;

  -- Extract UUID after "user_id=" (36 characters for UUID)
  user_id := nullif(
    trim(substring(cookie_text from (user_id_pos + 8) for 36)),
    ''
  )::uuid;

  if user_id is null then
    return null;
  end if;

  -- Verify user exists and is active
  select id into user_id
  from public.users
  where id = user_id
    and is_active = true;

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

-- RLS Policies for users table
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

-- RLS Policies for categories
create policy "Everyone can view categories"
  on public.categories for select
  using (true);

create policy "Admins can insert categories"
  on public.categories for insert
  with check (is_admin() = true);

create policy "Admins can update categories"
  on public.categories for update
  using (is_admin() = true);

create policy "Admins can delete categories"
  on public.categories for delete
  using (is_admin() = true);

-- RLS Policies for activities
create policy "Everyone can view activities"
  on public.activities for select
  using (true);

create policy "Admins can insert activities"
  on public.activities for insert
  with check (is_admin() = true);

create policy "Admins can update activities"
  on public.activities for update
  using (is_admin() = true);

create policy "Admins can delete activities"
  on public.activities for delete
  using (is_admin() = true);

-- RLS Policies for reports
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

-- RLS Policies for report_activities
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

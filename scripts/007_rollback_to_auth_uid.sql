-- Rollback: Reconnect users table to auth.users and restore original RLS policies

-- Drop custom functions
drop function if exists current_user_id() cascade;
drop function if exists is_admin() cascade;
drop table if exists public.sessions cascade;

-- Reconnect users table to auth.users
alter table public.users add constraint users_id_fkey foreign key (id) references auth.users(id) on delete cascade;

-- Restore original RLS policies for users table
create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Admins can view all users"
  on public.users for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Admins can update all users"
  on public.users for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Admins can delete users"
  on public.users for delete
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

-- Restore categories RLS policies
create policy "Everyone can view categories"
  on public.categories for select
  using (true);

create policy "Admins can insert categories"
  on public.categories for insert
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Admins can update categories"
  on public.categories for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Admins can delete categories"
  on public.categories for delete
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

-- Restore activities RLS policies
create policy "Everyone can view activities"
  on public.activities for select
  using (true);

create policy "Admins can insert activities"
  on public.activities for insert
  with check (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Admins can update activities"
  on public.activities for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Admins can delete activities"
  on public.activities for delete
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

-- Restore reports RLS policies
create policy "Users can view their own reports"
  on public.reports for select
  using (auth.uid() = user_id);

create policy "Admins can view all reports"
  on public.reports for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Users can insert their own reports"
  on public.reports for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reports"
  on public.reports for update
  using (auth.uid() = user_id);

create policy "Admins can update all reports"
  on public.reports for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Users can delete their own reports"
  on public.reports for delete
  using (auth.uid() = user_id);

create policy "Admins can delete all reports"
  on public.reports for delete
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

-- Restore report_activities RLS policies
create policy "Users can view their own report activities"
  on public.report_activities for select
  using (
    exists (
      select 1 from public.reports
      where reports.id = report_activities.report_id
      and reports.user_id = auth.uid()
    )
  );

create policy "Admins can view all report activities"
  on public.report_activities for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Users can insert their own report activities"
  on public.report_activities for insert
  with check (
    exists (
      select 1 from public.reports
      where reports.id = report_activities.report_id
      and reports.user_id = auth.uid()
    )
  );

create policy "Users can update their own report activities"
  on public.report_activities for update
  using (
    exists (
      select 1 from public.reports
      where reports.id = report_activities.report_id
      and reports.user_id = auth.uid()
    )
  );

create policy "Admins can update all report activities"
  on public.report_activities for update
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Users can delete their own report activities"
  on public.report_activities for delete
  using (
    exists (
      select 1 from public.reports
      where reports.id = report_activities.report_id
      and reports.user_id = auth.uid()
    )
  );

create policy "Admins can delete all report activities"
  on public.report_activities for delete
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

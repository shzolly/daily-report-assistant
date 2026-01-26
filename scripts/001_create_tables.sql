-- Create users table (extends auth.users with username and PIN)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  pin text not null, -- hashed PIN
  is_admin boolean default false,
  full_name text,
  role text default 'user',
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  last_login timestamp with time zone
);

-- Create categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create activities table
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete cascade,
  name text not null,
  description text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create reports table (one report per week per user)
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  week_start_date date not null, -- Monday of the week
  week_end_date date not null, -- Friday of the week
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, week_start_date)
);

-- Create report_activities table (activities for each day in a report)
create table if not exists public.report_activities (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete cascade,
  activity_id uuid references public.activities(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 1 and 5), -- 1=Monday, 5=Friday
  notes text,
  hours_spent numeric(4,2), -- optional hours
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.activities enable row level security;
alter table public.reports enable row level security;
alter table public.report_activities enable row level security;

-- RLS Policies for users table
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

-- RLS Policies for categories (everyone can read, only admins can write)
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

-- RLS Policies for activities (everyone can read, only admins can write)
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

-- RLS Policies for reports
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

-- RLS Policies for report_activities
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

-- Create indexes for better performance
create index if not exists idx_reports_user_id on public.reports(user_id);
create index if not exists idx_reports_week_start on public.reports(week_start_date);
create index if not exists idx_report_activities_report_id on public.report_activities(report_id);
create index if not exists idx_activities_category_id on public.activities(category_id);

-- URL-based access model
-- Run this after moving away from PIN/password login.

-- User dashboards are addressed by username, for example /demo or /john.
-- The legacy pin column is no longer used by the application.
alter table if exists public.users
alter column pin drop not null;

comment on column public.users.username is 'Unique personalized dashboard URL slug, for example /demo.';
comment on column public.users.pin is 'Legacy field retained for older installs; no longer used for authentication.';

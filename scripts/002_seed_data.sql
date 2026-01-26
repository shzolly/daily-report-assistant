-- Insert default categories
insert into public.categories (id, name, description) values
  ('11111111-1111-1111-1111-111111111111', 'Communication', 'Email and phone communications'),
  ('22222222-2222-2222-2222-222222222222', 'Meetings', 'Team meetings and discussions'),
  ('33333333-3333-3333-3333-333333333333', 'Development', 'User stories and coding'),
  ('44444444-4444-4444-4444-444444444444', 'Support', 'Production support and bug fixes'),
  ('55555555-5555-5555-5555-555555555555', 'Planning', 'Sprint grooming and planning')
on conflict (name) do nothing;

-- Insert default activities
insert into public.activities (category_id, name, description) values
  ('11111111-1111-1111-1111-111111111111', 'Checking Emails', 'Reading and responding to Outlook emails'),
  ('11111111-1111-1111-1111-111111111111', 'Answering Phone Calls', 'Handling phone communications'),
  ('22222222-2222-2222-2222-222222222222', 'Team Meetings', 'Participating in team meetings'),
  ('22222222-2222-2222-2222-222222222222', 'Sprint Grooming', 'Sprint planning and grooming discussions'),
  ('33333333-3333-3333-3333-333333333333', 'Working on User Stories', 'Development work on user stories'),
  ('33333333-3333-3333-3333-333333333333', 'Code Reviews', 'Reviewing code from team members'),
  ('44444444-4444-4444-4444-444444444444', 'Production Support', 'Handling production issues'),
  ('44444444-4444-4444-4444-444444444444', 'Fixing Bugs', 'Bug fixes and troubleshooting'),
  ('55555555-5555-5555-5555-555555555555', 'Planning & Documentation', 'Planning and documentation work');

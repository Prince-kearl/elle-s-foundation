-- Optional social links for public team member profiles.
alter table if exists public.team_members
  add column if not exists linkedin_url text,
  add column if not exists instagram_url text,
  add column if not exists website_url text;

notify pgrst, 'reload schema';

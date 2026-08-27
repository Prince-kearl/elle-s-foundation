-- Ensure the social-link fields used by the Team CMS exist in production.
-- Safe to run repeatedly in the Supabase SQL Editor.
alter table if exists public.team_members
  add column if not exists linkedin_url text,
  add column if not exists instagram_url text,
  add column if not exists website_url text;

select pg_notify('pgrst', 'reload schema');

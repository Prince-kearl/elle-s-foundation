-- Preserve the source avatar URL so administrators can reset a crop.
-- Safe to run repeatedly.
alter table public.team_members
  add column if not exists avatar_original_url text;
alter table public.testimonials
  add column if not exists avatar_original_url text;

-- Existing avatars are treated as their own original source on first migration.
update public.team_members
set avatar_original_url = avatar_url
where avatar_original_url is null
  and avatar_url is not null;
update public.testimonials
set avatar_original_url = avatar_url
where avatar_original_url is null
  and avatar_url is not null;

select pg_notify('pgrst', 'reload schema');

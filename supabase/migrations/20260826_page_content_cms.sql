-- Elle's Foundation CMS page content
-- Run this in the Supabase SQL Editor if public.page_content is missing.
-- The script is idempotent and safe to run after the rest of the CMS schema.

create extension if not exists pgcrypto;

create table if not exists public.page_content (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  section text not null default 'main',
  key text not null,
  label text,
  content_type text not null default 'text',
  value text default '',
  draft_value text,
  position integer not null default 0,
  status text not null default 'published',
  published_at timestamptz,
  publish_at timestamptz,
  unpublish_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint page_content_page_section_key_unique unique (page, section, key),
  constraint page_content_status_check check (status in ('draft', 'published', 'scheduled', 'archived'))
);

alter table public.page_content
  alter column id set default gen_random_uuid();

alter table public.page_content
  add column if not exists draft_value text,
  add column if not exists status text not null default 'published',
  add column if not exists published_at timestamptz,
  add column if not exists publish_at timestamptz,
  add column if not exists unpublish_at timestamptz,
  add column if not exists updated_by uuid references auth.users(id) on delete set null;

update public.page_content
set draft_value = coalesce(draft_value, value),
    published_at = coalesce(published_at, updated_at)
where draft_value is null or published_at is null;

grant select on public.page_content to authenticated;
grant insert, update, delete on public.page_content to authenticated;
grant all on public.page_content to service_role;

alter table public.page_content enable row level security;
drop policy if exists "page_content staff read" on public.page_content;
create policy "page_content staff read" on public.page_content
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));
drop policy if exists "page_content staff write" on public.page_content;
create policy "page_content staff write" on public.page_content
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

create or replace view public.published_page_content as
select id, page, section, key, label, content_type, value, position, updated_at
from public.page_content
where status = 'published'
  and (published_at is null or published_at <= now())
  and (unpublish_at is null or unpublish_at > now());

grant select on public.published_page_content to anon, authenticated;

create or replace function public.publish_page(_page text, _publish_at timestamptz default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')) then
    raise exception 'forbidden';
  end if;

  if _publish_at is not null and _publish_at > now() then
    update public.page_content
    set status = 'scheduled', publish_at = _publish_at, updated_at = now(), updated_by = auth.uid()
    where page = _page;
  else
    update public.page_content
    set value = coalesce(draft_value, value),
        status = 'published',
        published_at = now(),
        publish_at = null,
        updated_at = now(),
        updated_by = auth.uid()
    where page = _page;
  end if;
end;
$$;

grant execute on function public.publish_page(text, timestamptz) to authenticated;

insert into public.page_content (page, section, key, label, content_type, value, draft_value, position)
values
  ('home', 'hero', 'image', 'Hero Image', 'image', '', '', 0),
  ('home', 'about', 'image', 'About Image', 'image', '', '', 1),
  ('home', 'past_event', 'image', 'Past Event Image', 'image', '', '', 2),
  ('home', 'volunteer', 'image', 'Volunteer Feature Image', 'image', '', '', 3),
  ('home', 'stories', 'image_1', 'Story Image 1', 'image', '', '', 4),
  ('home', 'stories', 'image_2', 'Story Image 2', 'image', '', '', 5),
  ('home', 'stories', 'image_3', 'Story Image 3', 'image', '', '', 6),
  ('about', 'hero', 'image', 'About Story Image', 'image', '', '', 0),
  ('about', 'cta', 'image', 'About Decade Card Image', 'image', '', '', 1),
  ('programs', 'header', 'image', 'Programs Header Image', 'image', '', '', 0)
on conflict (page, section, key) do nothing;

notify pgrst, 'reload schema';

-- After running this file, reload /admin/media. If Supabase still reports a
-- schema-cache error, wait a few seconds and reload once more.

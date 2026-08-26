-- Elle's Foundation CMS — missing admin dependency repair
-- Safe to run after the core CMS migration. Does not drop or truncate data.

-- ---------- ADMIN CONFIG ------------------------------------------------------
create table if not exists public.app_config (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  description text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
grant select on public.app_config to authenticated;
grant insert, update, delete on public.app_config to authenticated;
grant all on public.app_config to service_role;
alter table public.app_config enable row level security;
drop policy if exists "app_config admin access" on public.app_config;
create policy "app_config admin access" on public.app_config
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---------- PENDING INVITATIONS ----------------------------------------------
create table if not exists public.pending_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role public.app_role not null default 'editor',
  invited_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (email)
);
grant select, insert, update, delete on public.pending_invites to authenticated;
grant all on public.pending_invites to service_role;
alter table public.pending_invites enable row level security;
drop policy if exists "pending invites admin access" on public.pending_invites;
create policy "pending invites admin access" on public.pending_invites
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---------- PUBLISHED MEDIA COMPATIBILITY TABLE ------------------------------
create table if not exists public.published_media (
  id uuid primary key default gen_random_uuid(),
  media_asset_id uuid references public.media_assets(id) on delete set null,
  page text not null,
  section text not null,
  key text not null,
  url text not null,
  alt_text text not null default '',
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page, section, key)
);
grant select on public.published_media to anon, authenticated;
grant insert, update, delete on public.published_media to authenticated;
grant all on public.published_media to service_role;
alter table public.published_media enable row level security;
drop policy if exists "published media public read" on public.published_media;
create policy "published media public read" on public.published_media
  for select using (true);
drop policy if exists "published media admin write" on public.published_media;
create policy "published media admin write" on public.published_media
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

-- ---------- HEALTH-CHECK RPCS -------------------------------------------------
create or replace function public.recent_audit(_limit integer default 20)
returns setof public.audit_log
language sql stable security definer set search_path = public
as $$
  select * from public.audit_log
  where public.has_role(auth.uid(), 'admin')
  order by created_at desc
  limit greatest(1, least(coalesce(_limit, 20), 100));
$$;
grant execute on function public.recent_audit(integer) to authenticated;

create or replace function public.scheduled_items()
returns setof public.page_content
language sql stable security definer set search_path = public
as $$
  select * from public.page_content
  where public.has_role(auth.uid(), 'admin')
    and status = 'scheduled'
  order by publish_at asc nulls last, updated_at desc;
$$;
grant execute on function public.scheduled_items() to authenticated;

-- ---------- WHATSAPP QUEUE ---------------------------------------------------
create table if not exists public.whatsapp_welcome_queue (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('newsletter', 'donation')),
  source_id uuid,
  phone text not null,
  message text not null,
  status text not null default 'queued' check (status in ('queued', 'processing', 'sent', 'failed', 'needs_setup')),
  attempts integer not null default 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.whatsapp_welcome_queue to authenticated;
grant all on public.whatsapp_welcome_queue to service_role;
alter table public.whatsapp_welcome_queue enable row level security;
drop policy if exists "whatsapp queue admin read" on public.whatsapp_welcome_queue;
create policy "whatsapp queue admin read" on public.whatsapp_welcome_queue
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

insert into public.cms_schema_versions(version)
values ('2026-08-26-admin-dependency-repair')
on conflict (version) do nothing;

select pg_notify('pgrst', 'reload schema');

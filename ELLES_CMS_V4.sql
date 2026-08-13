-- ============================================================================
-- ELLE'S FOUNDATION CMS — V4 (user lifecycle, scheduling, SEO, storage config)
-- Run AFTER ELLES_CMS_CONSOLIDATED.sql. Idempotent — safe to re-run.
-- ============================================================================

-- ---------- 1. USER LIFECYCLE ----------------------------------------------
alter table public.profiles
  add column if not exists disabled_at timestamptz,
  add column if not exists last_active_at timestamptz;

create table if not exists public.pending_invites (
  email text primary key,
  role public.app_role not null default 'editor',
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);
grant select, insert, update, delete on public.pending_invites to authenticated;
grant all on public.pending_invites to service_role;
alter table public.pending_invites enable row level security;
drop policy if exists "admins manage invites" on public.pending_invites;
create policy "admins manage invites" on public.pending_invites for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- New signups: first user is admin, invited users get their invited role.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  admin_exists boolean;
  invited public.app_role;
begin
  select exists(select 1 from public.user_roles where role = 'admin') into admin_exists;
  select role into invited from public.pending_invites where lower(email) = lower(new.email) and accepted_at is null;

  insert into public.user_roles (user_id, role)
  values (new.id, case
    when not admin_exists then 'admin'::public.app_role
    when invited is not null then invited
    else 'user'::public.app_role end)
  on conflict do nothing;

  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;

  update public.pending_invites set accepted_at = now() where lower(email) = lower(new.email);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Audit writer callable by staff (audit_log has no direct insert grant).
create or replace function public.log_audit(_action text, _entity_type text, _entity_id text default null, _details jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor')) then
    raise exception 'forbidden';
  end if;
  insert into public.audit_log(actor_id, action, entity_type, entity_id, details)
  values (auth.uid(), _action, _entity_type, _entity_id, coalesce(_details,'{}'::jsonb));
end $$;
grant execute on function public.log_audit(text,text,text,jsonb) to authenticated;

create or replace function public.set_user_active(_user_id uuid, _active boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'forbidden'; end if;
  if _user_id = auth.uid() then raise exception 'You cannot deactivate your own account'; end if;
  insert into public.profiles(id) values(_user_id) on conflict (id) do nothing;
  update public.profiles set disabled_at = case when _active then null else now() end where id = _user_id;
  perform public.log_audit(case when _active then 'activate' else 'deactivate' end, 'user', _user_id::text, '{}'::jsonb);
end $$;
grant execute on function public.set_user_active(uuid, boolean) to authenticated;

-- Listing now includes activation state.
drop function if exists public.list_users_admin();
create or replace function public.list_users_admin()
returns table (
  id uuid, email text, role public.app_role, full_name text,
  created_at timestamptz, last_sign_in_at timestamptz, disabled_at timestamptz
)
language sql security definer set search_path = public as $$
  select u.id,
         u.email::text,
         coalesce((select ur.role from public.user_roles ur where ur.user_id = u.id order by
           case ur.role when 'admin' then 1 when 'editor' then 2 else 3 end limit 1), 'user'::public.app_role),
         p.full_name,
         u.created_at,
         u.last_sign_in_at,
         p.disabled_at
  from auth.users u
  left join public.profiles p on p.id = u.id
  where public.has_role(auth.uid(), 'admin')
  order by u.created_at desc
$$;
grant execute on function public.list_users_admin() to authenticated;

create or replace function public.invite_user(_email text, _role public.app_role default 'editor')
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'forbidden'; end if;
  insert into public.pending_invites(email, role, invited_by)
  values (lower(_email), _role, auth.uid())
  on conflict (email) do update set role = excluded.role, invited_by = excluded.invited_by, created_at = now(), accepted_at = null;
  perform public.log_audit('invite','user',lower(_email), jsonb_build_object('role',_role));
end $$;
grant execute on function public.invite_user(text, public.app_role) to authenticated;

-- Recent audit entries for the admin UI.
create or replace function public.recent_audit(_limit int default 50)
returns table (id uuid, action text, entity_type text, entity_id text, details jsonb, created_at timestamptz, actor_email text)
language sql security definer set search_path = public as $$
  select a.id, a.action, a.entity_type, a.entity_id, a.details, a.created_at, u.email::text
  from public.audit_log a
  left join auth.users u on u.id = a.actor_id
  where public.has_role(auth.uid(),'admin')
  order by a.created_at desc
  limit greatest(1, least(_limit, 200))
$$;
grant execute on function public.recent_audit(int) to authenticated;

-- ---------- 2. SCHEDULING (pages, sections, media) --------------------------
create or replace function public.schedule_page(_page text, _publish_at timestamptz, _unpublish_at timestamptz default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor')) then raise exception 'forbidden'; end if;
  update public.page_content
    set publish_at = _publish_at,
        unpublish_at = _unpublish_at,
        status = case when _publish_at is not null and _publish_at > now() then 'scheduled' else status end
  where page = _page;
  perform public.log_audit('schedule','page',_page, jsonb_build_object('publish_at',_publish_at,'unpublish_at',_unpublish_at));
end $$;
grant execute on function public.schedule_page(text,timestamptz,timestamptz) to authenticated;

create or replace function public.schedule_section(_page text, _section text, _publish_at timestamptz, _unpublish_at timestamptz default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor')) then raise exception 'forbidden'; end if;
  update public.page_content
    set publish_at = _publish_at,
        unpublish_at = _unpublish_at,
        status = case when _publish_at is not null and _publish_at > now() then 'scheduled' else status end
  where page = _page and section = _section;
  perform public.log_audit('schedule','section',_page || '/' || _section, jsonb_build_object('publish_at',_publish_at,'unpublish_at',_unpublish_at));
end $$;
grant execute on function public.schedule_section(text,text,timestamptz,timestamptz) to authenticated;

create or replace function public.publish_section(_page text, _section text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor')) then raise exception 'forbidden'; end if;
  update public.page_content
    set value = coalesce(draft_value, value), status = 'published', published_at = now(), publish_at = null, unpublish_at = null
  where page = _page and section = _section;
  perform public.log_audit('publish','section',_page || '/' || _section, '{}'::jsonb);
end $$;
grant execute on function public.publish_section(text,text) to authenticated;

create or replace function public.unpublish_section(_page text, _section text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'forbidden'; end if;
  update public.page_content set status = 'archived', unpublish_at = now()
  where page = _page and section = _section;
  perform public.log_audit('unpublish','section',_page || '/' || _section, '{}'::jsonb);
end $$;
grant execute on function public.unpublish_section(text,text) to authenticated;

-- Media scheduling
alter table public.media_assets
  add column if not exists publish_at timestamptz,
  add column if not exists unpublish_at timestamptz,
  add column if not exists status text not null default 'published';
do $$ begin
  alter table public.media_assets add constraint media_status_check check (status in ('draft','published','scheduled','archived'));
exception when duplicate_object then null; end $$;

create or replace view public.published_media as
  select id, url, path, filename, mime_type, size_bytes, alt_text, folder, kind, poster_url, created_at
  from public.media_assets
  where status in ('published','scheduled')
    and (publish_at is null or publish_at <= now())
    and (unpublish_at is null or unpublish_at > now());
grant select on public.published_media to anon, authenticated;

create or replace function public.schedule_media(_id uuid, _publish_at timestamptz, _unpublish_at timestamptz default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor')) then raise exception 'forbidden'; end if;
  update public.media_assets
    set publish_at = _publish_at,
        unpublish_at = _unpublish_at,
        status = case when _publish_at is not null and _publish_at > now() then 'scheduled' else 'published' end
  where id = _id;
  perform public.log_audit('schedule','media',_id::text, jsonb_build_object('publish_at',_publish_at,'unpublish_at',_unpublish_at));
end $$;
grant execute on function public.schedule_media(uuid,timestamptz,timestamptz) to authenticated;

-- Everything due right now (pages + media). Call from the admin UI or pg_cron.
create or replace function public.publish_due_content()
returns integer language plpgsql security definer set search_path = public as $$
declare affected integer; media_affected integer;
begin
  update public.page_content set value = coalesce(draft_value, value), status='published', published_at=now(), publish_at=null
  where status = 'scheduled' and publish_at <= now();
  get diagnostics affected = row_count;

  update public.page_content set status='archived'
  where status='published' and unpublish_at is not null and unpublish_at <= now();

  update public.media_assets set status='published', publish_at=null
  where status='scheduled' and publish_at <= now();
  get diagnostics media_affected = row_count;

  update public.media_assets set status='archived'
  where status='published' and unpublish_at is not null and unpublish_at <= now();

  return affected + media_affected;
end $$;
grant execute on function public.publish_due_content() to authenticated;

-- Combined schedule feed for the admin scheduling screen.
create or replace function public.scheduled_items()
returns table (kind text, id text, label text, page text, section text, status text, publish_at timestamptz, unpublish_at timestamptz)
language sql security definer set search_path = public as $$
  select 'section'::text, pc.page || '/' || pc.section, pc.page || ' — ' || pc.section, pc.page, pc.section,
         min(pc.status)::text, min(pc.publish_at), min(pc.unpublish_at)
  from public.page_content pc
  where public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor')
  group by pc.page, pc.section
  having min(pc.publish_at) is not null or min(pc.unpublish_at) is not null
  union all
  select 'media'::text, m.id::text, m.filename, null, null, m.status, m.publish_at, m.unpublish_at
  from public.media_assets m
  where (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
    and (m.publish_at is not null or m.unpublish_at is not null)
  order by 7 nulls last
$$;
grant execute on function public.scheduled_items() to authenticated;

-- ---------- 3. SEO ----------------------------------------------------------
alter table public.page_seo
  add column if not exists twitter_card text not null default 'summary_large_image',
  add column if not exists keywords text not null default '';

-- ---------- 4. APP CONFIG (non-secret storage settings) ---------------------
create table if not exists public.app_config (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
grant select on public.app_config to anon, authenticated;
grant insert, update, delete on public.app_config to authenticated;
grant all on public.app_config to service_role;
alter table public.app_config enable row level security;
drop policy if exists "config public read" on public.app_config;
create policy "config public read" on public.app_config for select using (true);
drop policy if exists "config admin write" on public.app_config;
create policy "config admin write" on public.app_config for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.app_config(key, value) values
  ('storage', jsonb_build_object('provider','supabase','r2_public_base_url','','r2_bucket',''))
on conflict (key) do nothing;

insert into public.cms_schema_versions(version) values ('v4') on conflict do nothing;

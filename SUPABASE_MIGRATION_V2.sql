-- ============================================================================
-- Elle's Foundation CMS — MIGRATION V2
-- Run AFTER SUPABASE_MIGRATION.sql. Safe to re-run.
-- Adds: media library, sponsorships, brand settings, page content,
--       GHS currency, storage bucket + policies, users listing RPC.
-- ============================================================================

-- ---------- STORAGE BUCKET (public) -----------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media admin write" on storage.objects;
create policy "media admin write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')));

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')));

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')));

-- ---------- MEDIA LIBRARY ---------------------------------------------------
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  path text not null,
  filename text not null,
  mime_type text,
  size_bytes bigint,
  alt_text text default '',
  folder text default 'general',
  show_in_gallery boolean not null default false,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select on public.media_assets to anon, authenticated;
grant insert, update, delete on public.media_assets to authenticated;
grant all on public.media_assets to service_role;
alter table public.media_assets enable row level security;
drop policy if exists "media_assets public read" on public.media_assets;
create policy "media_assets public read" on public.media_assets for select using (true);
drop policy if exists "media_assets admin write" on public.media_assets;
create policy "media_assets admin write" on public.media_assets
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

-- ---------- SPONSORSHIPS ----------------------------------------------------
create table if not exists public.sponsorships (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  amount numeric not null default 0,
  currency text not null default 'GHS',
  frequency text not null default 'monthly',
  icon text default 'HandHeart',
  image_url text,
  benefits text[] default '{}',
  featured boolean not null default false,
  position int not null default 0,
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);
grant select on public.sponsorships to anon, authenticated;
grant insert, update, delete on public.sponsorships to authenticated;
grant all on public.sponsorships to service_role;
alter table public.sponsorships enable row level security;
drop policy if exists "sponsorships public read" on public.sponsorships;
create policy "sponsorships public read" on public.sponsorships for select using (true);
drop policy if exists "sponsorships admin write" on public.sponsorships;
create policy "sponsorships admin write" on public.sponsorships
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

-- ---------- BRAND SETTINGS (single row) -------------------------------------
create table if not exists public.brand_settings (
  id int primary key default 1,
  primary_color text default '#44533D',
  forest_color text default '#566547',
  cream_color text default '#F5EFE5',
  sand_color text default '#E8DCC8',
  earth_color text default '#B48A58',
  gold_color text default '#C59B5C',
  ink_color text default '#2C2C2C',
  background_color text default '#FAF7F2',
  heading_font text default 'Playfair Display',
  body_font text default 'Inter',
  base_font_size text default '16px',
  heading_weight text default '600',
  radius text default '0.625rem',
  updated_at timestamptz not null default now(),
  constraint singleton check (id = 1)
);
grant select on public.brand_settings to anon, authenticated;
grant insert, update, delete on public.brand_settings to authenticated;
grant all on public.brand_settings to service_role;
alter table public.brand_settings enable row level security;
drop policy if exists "brand public read" on public.brand_settings;
create policy "brand public read" on public.brand_settings for select using (true);
drop policy if exists "brand admin write" on public.brand_settings;
create policy "brand admin write" on public.brand_settings
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into public.brand_settings (id) values (1) on conflict do nothing;

-- ---------- PAGE CONTENT (per-page key/value with type) ---------------------
create table if not exists public.page_content (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  section text not null default 'main',
  key text not null,
  label text,
  content_type text not null default 'text', -- text | textarea | image | url
  value text default '',
  position int not null default 0,
  updated_at timestamptz not null default now(),
  unique (page, section, key)
);
grant select on public.page_content to anon, authenticated;
grant insert, update, delete on public.page_content to authenticated;
grant all on public.page_content to service_role;
alter table public.page_content enable row level security;
drop policy if exists "page_content public read" on public.page_content;
create policy "page_content public read" on public.page_content for select using (true);
drop policy if exists "page_content admin write" on public.page_content;
create policy "page_content admin write" on public.page_content
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

-- ---------- DONATIONS — add currency + sponsorship link ---------------------
alter table public.donation_intents
  add column if not exists currency text not null default 'GHS',
  add column if not exists sponsorship_id uuid references public.sponsorships(id) on delete set null;

-- ---------- USER MANAGEMENT (admin-only listing) ---------------------------
create or replace function public.list_users_admin()
returns table (
  id uuid,
  email text,
  role public.app_role,
  full_name text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language sql security definer set search_path = public
as $$
  select u.id,
         u.email::text,
         coalesce((select ur.role from public.user_roles ur where ur.user_id = u.id order by
           case ur.role when 'admin' then 1 when 'editor' then 2 else 3 end limit 1), 'user'::public.app_role) as role,
         p.full_name,
         u.created_at,
         u.last_sign_in_at
  from auth.users u
  left join public.profiles p on p.id = u.id
  where public.has_role(auth.uid(), 'admin')
  order by u.created_at desc
$$;
grant execute on function public.list_users_admin() to authenticated;

create or replace function public.set_user_role(_user_id uuid, _role public.app_role)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'forbidden';
  end if;
  delete from public.user_roles where user_id = _user_id;
  insert into public.user_roles (user_id, role) values (_user_id, _role);
end;
$$;
grant execute on function public.set_user_role(uuid, public.app_role) to authenticated;

-- ---------- SEED SPONSORSHIPS ----------------------------------------------
insert into public.sponsorships (title, description, amount, currency, frequency, icon, benefits, position, featured) values
  ('Sponsor a Child''s Education', 'Cover one child''s school fees, books, and uniform for a month.', 150, 'GHS', 'monthly', 'GraduationCap', ARRAY['Monthly progress reports','School supplies','Uniform & books'], 0, true),
  ('Feed a Family', 'Provide weekly food packages to a family in need.', 250, 'GHS', 'monthly', 'Utensils', ARRAY['Weekly food package','Essential household items','Nutrition support'], 1, false),
  ('Shelter Support', 'Help rebuild or repair a family''s home.', 500, 'GHS', 'once', 'Home', ARRAY['Home repairs','Safe living space','Community follow-up'], 2, false),
  ('Community Well', 'Fund clean water access for an entire community.', 5000, 'GHS', 'once', 'TreePine', ARRAY['Clean water for 200+','Health improvement','Named plaque'], 3, false)
on conflict do nothing;

-- ---------- SEED PAGE CONTENT DEFAULTS -------------------------------------
insert into public.page_content (page, section, key, label, content_type, value, position) values
  ('home','hero','image','Hero Image','image','',0),
  ('home','about','image','About Image','image','',1),
  ('home','gallery','title','Gallery Title','text','Moments from our work',2),
  ('about','story','image','Story Image','image','',0),
  ('programs','header','image','Header Image','image','',0),
  ('sponsor','hero','title','Hero Title','text','Sponsor a life. Change a story.',0),
  ('sponsor','hero','description','Hero Description','textarea','Your monthly gift creates lasting change — from meals and schooling to safe homes and clean water.',1),
  ('sponsor','hero','image','Hero Image','image','',2),
  ('contact','info','momo_number','MoMo Number','text','+233 55 123 4567',0),
  ('contact','info','momo_name','MoMo Account Name','text','Elle''s Foundation',1),
  ('contact','info','bank_details','Bank Details','textarea','Bank: GCB Bank\nAccount: 1234567890\nBranch: Accra Main',2)
on conflict (page, section, key) do nothing;

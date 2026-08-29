-- ============================================================================
-- ELLE'S FOUNDATION CMS — CONSOLIDATED EXTERNAL DATABASE MIGRATION
-- Run once in the external database SQL editor. Safe to re-run.
-- Replaces SUPABASE_MIGRATION.sql, V2, and V3. Cloudflare R2 handles media.
-- ============================================================================

-- ============================================================================
-- Elle's Foundation CMS — full schema
-- Run this once in your Supabase SQL Editor (Dashboard → SQL Editor → New).
-- Safe to re-run; uses IF NOT EXISTS / drop-recreate policies where safe.
-- ============================================================================

-- ---------- ROLES ------------------------------------------------------------
do $$ begin
  create type public.app_role as enum ('admin', 'editor', 'user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

drop policy if exists "users read own roles" on public.user_roles;
create policy "users read own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid());

-- Security-definer role checker (avoids RLS recursion)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- First signup becomes admin, everyone else becomes 'user'
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  admin_exists boolean;
begin
  select exists(select 1 from public.user_roles where role = 'admin') into admin_exists;
  insert into public.user_roles (user_id, role)
  values (new.id, case when admin_exists then 'user'::public.app_role else 'admin'::public.app_role end)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- PROFILES ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
drop policy if exists "profiles readable by everyone" on public.profiles;
create policy "profiles readable by everyone" on public.profiles for select using (true);
drop policy if exists "users edit own profile" on public.profiles;
create policy "users edit own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile" on public.profiles
  for insert to authenticated with check (id = auth.uid());

-- ---------- CONTENT TABLES ---------------------------------------------------
-- Generic key/value site copy (hero text, section headings, etc.)
create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  section text not null,
  key text not null,
  value_text text,
  value_json jsonb,
  updated_at timestamptz not null default now(),
  unique (section, key)
);

create table if not exists public.site_settings (
  id int primary key default 1,
  org_name text default 'Elle''s Foundation',
  tagline text default 'Feeding Hope. Restoring Lives.',
  logo_url text,
  email text default 'info@ellefoundation.org',
  phone text default '+233 55 123 4567',
  address text default 'Accra, Ghana',
  facebook_url text default '#',
  instagram_url text default '#',
  twitter_url text default '#',
  linkedin_url text default '#',
  donate_url text default '/donate',
  newsletter_headline text default 'Stories of hope, delivered monthly.',
  updated_at timestamptz not null default now(),
  constraint singleton check (id = 1)
);

create table if not exists public.stats (
  id uuid primary key default gen_random_uuid(),
  value text not null,
  label text not null,
  position int not null default 0,
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon text default 'GraduationCap',
  image_url text,
  position int not null default 0,
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  tag text,
  title text not null,
  excerpt text,
  image_url text,
  position int not null default 0,
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  bio text,
  avatar_url text,
  position int not null default 0,
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  name text not null,
  role text,
  avatar_url text,
  position int not null default 0,
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'General',
  position int not null default 0,
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ---------- SUBMISSIONS (public writes, admin reads) ------------------------
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  interest text,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.donation_intents (
  id uuid primary key default gen_random_uuid(),
  amount numeric not null,
  frequency text not null default 'once',
  name text,
  email text,
  note text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- ---------- GRANTS + RLS -----------------------------------------------------
-- Public content: everyone reads visible rows; only admins write.
do $$
declare t text;
begin
  foreach t in array array[
    'site_content','site_settings','stats','programs','stories',
    'team_members','testimonials','faqs'
  ]
  loop
    execute format('grant select on public.%I to anon, authenticated;', t);
    execute format('grant insert, update, delete on public.%I to authenticated;', t);
    execute format('grant all on public.%I to service_role;', t);
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "public read" on public.%I;', t);
    execute format('create policy "public read" on public.%I for select using (true);', t);
    execute format('drop policy if exists "admin write" on public.%I;', t);
    execute format('create policy "admin write" on public.%I for all to authenticated using (public.has_role(auth.uid(), ''admin'')) with check (public.has_role(auth.uid(), ''admin''));', t);
  end loop;
end $$;

-- FAQ analytics: anonymous inserts, staff-only reads.
create table if not exists public.faq_interactions (
  id uuid primary key default gen_random_uuid(),
  faq_id uuid references public.faqs(id) on delete set null,
  event_type text not null check (event_type in ('view', 'search')),
  query_text text,
  source text not null default 'homepage',
  created_at timestamptz not null default now(),
  constraint faq_search_query_only_for_search check (event_type = 'search' or query_text is null),
  constraint faq_search_query_length check (query_text is null or char_length(query_text) between 2 and 80)
);
create index if not exists faq_interactions_faq_event_idx on public.faq_interactions (faq_id, event_type, created_at desc);
create index if not exists faq_interactions_search_idx on public.faq_interactions (event_type, query_text, created_at desc);
alter table public.faq_interactions enable row level security;
drop policy if exists "public can record faq interactions" on public.faq_interactions;
create policy "public can record faq interactions" on public.faq_interactions for insert to anon, authenticated with check (
  (faq_id is null or exists (select 1 from public.faqs f where f.id = faq_id and f.visible = true))
  and (event_type = 'view' or (event_type = 'search' and query_text is not null))
);
drop policy if exists "staff can read faq interactions" on public.faq_interactions;
create policy "staff can read faq interactions" on public.faq_interactions for select to authenticated using (
  public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')
);
grant insert on public.faq_interactions to anon, authenticated;
grant select on public.faq_interactions to authenticated;
grant all on public.faq_interactions to service_role;
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'faq_interactions') then
    execute 'alter publication supabase_realtime add table public.faq_interactions';
  end if;
end $$;

-- Submissions: anyone can insert, only admins read/update/delete.
grant insert on public.contact_submissions to anon, authenticated;
grant select, update, delete on public.contact_submissions to authenticated;
grant all on public.contact_submissions to service_role;
alter table public.contact_submissions enable row level security;
drop policy if exists "anyone can submit" on public.contact_submissions;
create policy "anyone can submit" on public.contact_submissions for insert with check (true);
drop policy if exists "admin reads" on public.contact_submissions;
create policy "admin reads" on public.contact_submissions
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "admin manages" on public.contact_submissions;
create policy "admin manages" on public.contact_submissions
  for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
drop policy if exists "admin deletes" on public.contact_submissions;
create policy "admin deletes" on public.contact_submissions
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

grant insert on public.donation_intents to anon, authenticated;
grant select, update, delete on public.donation_intents to authenticated;
grant all on public.donation_intents to service_role;
alter table public.donation_intents enable row level security;
drop policy if exists "anyone can submit" on public.donation_intents;
create policy "anyone can submit" on public.donation_intents for insert with check (true);
drop policy if exists "admin reads" on public.donation_intents;
create policy "admin reads" on public.donation_intents
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "admin manages" on public.donation_intents;
create policy "admin manages" on public.donation_intents
  for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
drop policy if exists "admin deletes" on public.donation_intents;
create policy "admin deletes" on public.donation_intents
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- ---------- SEED DEFAULTS ----------------------------------------------------
insert into public.site_settings (id) values (1) on conflict do nothing;

insert into public.site_content (section, key, value_text) values
  ('hero','eyebrow','Elle''s Foundation · Est. 2015'),
  ('hero','title_line_1','Feeding Hope.'),
  ('hero','title_line_2','Restoring Lives.'),
  ('hero','description','We believe every child deserves a chance, every family deserves support, and every community deserves the opportunity to thrive with dignity and hope.'),
  ('hero','cta_primary_label','Donate Now'),
  ('hero','cta_primary_href','/donate'),
  ('hero','cta_secondary_label','Become a Volunteer'),
  ('hero','cta_secondary_href','/contact'),
  ('hero','trust_line','Trusted by 3,200+ families across 9 countries.')
on conflict (section, key) do nothing;

insert into public.stats (value, label, position) values
  ('12,400+','Children Supported',0),
  ('3,200','Families Assisted',1),
  ('46','Communities Reached',2),
  ('148K','Meals Served',3),
  ('620','Volunteers',4),
  ('82','Projects Completed',5)
on conflict do nothing;

insert into public.programs (title, description, icon, position) values
  ('Education','Building brighter futures through learning and scholarships.','GraduationCap',0),
  ('Health','Promoting wellbeing with clinics, checkups, and clean water.','HeartPulse',1),
  ('Shelter & Support','Offering shelter and support to the underprivileged.','Home',2),
  ('Community Development','Creating opportunities that restore dignity and inspire growth.','TreePine',3)
on conflict do nothing;

insert into public.stories (tag, title, excerpt, position) values
  ('Education','Amina found her voice through school.','From a village without a classroom to top of her class — one scholarship changed everything.',0),
  ('Family','A home rebuilt, a mother renewed.','Grace and her son moved into permanent shelter after two years of uncertainty.',1),
  ('Youth','Two brothers, one graduation day.','Kwame and Kojo are the first in their family to finish secondary school.',2)
on conflict do nothing;

insert into public.team_members (name, role, position) values
  ('Elle Mensah','Founder & Executive Director',0),
  ('Samuel Osei','Director of Programs',1),
  ('Ama Owusu','Head of Community Health',2),
  ('Joseph Kamau','Partnerships Lead',3)
on conflict do nothing;

insert into public.testimonials (quote, name, role, position) values
  ('Volunteering with Elle''s Foundation was the most meaningful year of my life. Their team meets people with real dignity.','Amelia O.','Volunteer, Ghana',0),
  ('The scholarship program changed my daughter''s future. She now dreams of becoming a nurse.','Fatou D.','Parent, Senegal',1),
  ('A partner that keeps its word. Elle''s Foundation delivers where it matters — on the ground, with the people.','David M.','Corporate Partner',2)
on conflict do nothing;

insert into public.faqs (question, answer, position) values
  ('Where does my donation go?','98% of every donation directly funds our education, health, shelter and community programs. The remaining 2% covers essential operational costs.',0),
  ('How can I volunteer?','Reach out through our contact page and tell us about your skills and availability. We onboard volunteers monthly.',1),
  ('Are donations tax-deductible?','Yes. Elle''s Foundation is a registered nonprofit and every donation receives an official receipt.',2)
on conflict do nothing;


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


-- ============================================================================
-- Elle's Foundation CMS — MIGRATION V3
-- Run AFTER SUPABASE_MIGRATION_V2.sql. Safe to re-run.
-- Adds: video support in media library, per-page brand overrides,
--       typography scale + spacing tokens, full page_content seeds for
--       home / about / programs / footer / donate / contact.
-- ============================================================================

-- ---------- MEDIA: video support -------------------------------------------
alter table public.media_assets
  add column if not exists kind text not null default 'image',   -- image | video
  add column if not exists poster_url text,
  add column if not exists width int,
  add column if not exists height int;

update public.media_assets set kind = 'video' where mime_type like 'video/%' and kind <> 'video';

-- ---------- BRAND: typography scale + spacing -------------------------------
alter table public.brand_settings
  add column if not exists heading_scale numeric not null default 1,
  add column if not exists body_scale numeric not null default 1,
  add column if not exists letter_spacing text not null default '0em',
  add column if not exists line_height text not null default '1.6',
  add column if not exists section_spacing text not null default '6rem',
  add column if not exists container_width text not null default '1200px',
  add column if not exists muted_color text default '#6B7280';

-- ---------- PER-PAGE BRAND OVERRIDES ----------------------------------------
create table if not exists public.page_brand (
  page text primary key,
  enabled boolean not null default false,
  primary_color text,
  forest_color text,
  cream_color text,
  sand_color text,
  earth_color text,
  gold_color text,
  ink_color text,
  background_color text,
  heading_font text,
  body_font text,
  base_font_size text,
  heading_scale numeric,
  body_scale numeric,
  letter_spacing text,
  line_height text,
  section_spacing text,
  container_width text,
  radius text,
  updated_at timestamptz not null default now()
);
grant select on public.page_brand to anon, authenticated;
grant insert, update, delete on public.page_brand to authenticated;
grant all on public.page_brand to service_role;
alter table public.page_brand enable row level security;
drop policy if exists "page_brand public read" on public.page_brand;
create policy "page_brand public read" on public.page_brand for select using (true);
drop policy if exists "page_brand admin write" on public.page_brand;
create policy "page_brand admin write" on public.page_brand
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into public.page_brand (page) values
  ('home'),('about'),('programs'),('sponsor'),('donate'),('contact')
on conflict (page) do nothing;

-- ---------- PAGE CONTENT: video type + full seeds ---------------------------
insert into public.page_content (page, section, key, label, content_type, value, position) values
  -- HOME · hero
  ('home','hero','eyebrow','Eyebrow','text','Elle''s Foundation · Est. 2015',0),
  ('home','hero','title','Headline','text','Feeding Hope.',1),
  ('home','hero','title_accent','Headline Accent','text','Restoring Lives.',2),
  ('home','hero','description','Description','textarea','We believe every child deserves a chance, every family deserves support, and every community deserves the opportunity to thrive with dignity and hope.',3),
  ('home','hero','cta_primary','Primary Button','text','Donate Now',4),
  ('home','hero','cta_secondary','Secondary Button','text','Become a Volunteer',5),
  ('home','hero','trust_text','Trust Line','text','Trusted by 3,200+ families across Ghana and beyond.',6),
  ('home','hero','video','Hero Video (optional, replaces image)','video','',7),
  ('home','hero','badge_label','Floating Badge Label','text','Meals served',8),
  ('home','hero','badge_value','Floating Badge Value','text','148,720',9),
  -- HOME · about
  ('home','about','eyebrow','Eyebrow','text','About Elle''s Foundation',0),
  ('home','about','title','Title','text','A community-focused nonprofit built on compassion.',1),
  ('home','about','description','Description','textarea','Elle''s Foundation is dedicated to improving lives through education, health, and community development. We walk alongside the families we serve — with humility, integrity, and long-term commitment to real change.',2),
  ('home','about','quote','Quote Card','text','We feed hope, restore dignity, and empower lives.',3),
  ('home','about','video','About Video (optional)','video','',4),
  -- HOME · vision & mission
  ('home','vision','title','Vision Statement','textarea','A world where every child has access to education, every family has shelter, and every community is empowered with health, dignity and hope.',0),
  ('home','mission','title','Mission Title','text','Restoring dignity through practical, lasting change.',1),
  -- HOME · sections
  ('home','values','title','Values Section Title','text','Our Core Values',0),
  ('home','values','intro','Values Intro','textarea','The principles that shape every program, partnership, and promise we keep.',1),
  ('home','programs','title','Programs Section Title','text','Programs that change everything.',0),
  ('home','programs','intro','Programs Intro','textarea','Four focused pillars, one shared belief — that lasting change begins with people, not projects.',1),
  ('home','stories','title','Stories Section Title','text','Real people. Real change.',0),
  ('home','gallery','video','Gallery Video','video','',3),
  ('home','cta','title','CTA Title','text','Be the reason someone''s life changes.',0),
  ('home','cta','description','CTA Description','textarea','Volunteer. Donate. Partner with us. Together, we can make a lasting difference.',1),
  -- ABOUT
  ('about','hero','eyebrow','Eyebrow','text','About Us',0),
  ('about','hero','title','Title','text','Our story is their story.',1),
  ('about','hero','paragraph_1','Paragraph 1','textarea','Elle''s Foundation began in a small kitchen serving warm meals to children who walked hours to school on empty stomachs. A decade later, our work spans education, health, shelter, and community development — but the heart of it hasn''t changed.',2),
  ('about','hero','paragraph_2','Paragraph 2','textarea','We believe that lasting change is built with communities, not for them. Every project we take on is co-designed with the people it serves, and measured by the dignity it restores.',3),
  ('about','hero','image','Hero Image','image','',4),
  ('about','hero','video','Hero Video (optional)','video','',5),
  ('about','story','video','Story Video','video','',1),
  ('about','cta','title','Banner Title','text','Walk with us into the next decade.',0),
  ('about','cta','image','Banner Image','image','',1),
  ('about','cta','video','Banner Video (optional)','video','',2),
  -- PROGRAMS
  ('programs','header','eyebrow','Eyebrow','text','Our Programs',0),
  ('programs','header','title','Title','text','Four pillars. One promise.',1),
  ('programs','header','description','Description','textarea','Every program we run is designed with the community, delivered by local teams, and measured by the change it creates in real lives.',2),
  ('programs','header','video','Header Video (optional)','video','',3),
  ('programs','impact','title','Impact Section Title','text','Measured in lives, not slides.',0),
  -- FOOTER
  ('footer','about','description','About Text','textarea','Elle''s Foundation is a community-focused nonprofit dedicated to improving lives through education, health, and community development — because every child deserves a chance.',0),
  ('footer','contact','phone','Phone','text','+233 55 123 4567',0),
  ('footer','contact','email','Email','text','info@ellefoundation.org',1),
  ('footer','contact','address','Address','text','Accra, Ghana',2),
  ('footer','newsletter','title','Newsletter Title','text','Newsletter',0),
  ('footer','newsletter','description','Newsletter Text','text','Stories of hope, delivered monthly.',1),
  ('footer','social','facebook','Facebook URL','url','#',0),
  ('footer','social','instagram','Instagram URL','url','#',1),
  ('footer','social','twitter','Twitter URL','url','#',2),
  ('footer','social','linkedin','LinkedIn URL','url','#',3),
  ('footer','legal','copyright','Copyright Line','text','Elle''s Foundation. All rights reserved.',0)
on conflict (page, section, key) do nothing;

-- ---------- V3.1: image fields + program video + footer stats ---------------
alter table public.programs add column if not exists video_url text;

insert into public.page_content (page, section, key, label, content_type, value, position) values
  ('home','hero','image','Hero Image','image','',10),
  ('home','about','image','About Image','image','',5),
  ('programs','header','image','Header Image','image','',4),
  ('footer','stats','value_1','Stat 1 Value','text','12,400+',0),
  ('footer','stats','label_1','Stat 1 Label','text','Children supported',1),
  ('footer','stats','value_2','Stat 2 Value','text','3,200',2),
  ('footer','stats','label_2','Stat 2 Label','text','Families assisted',3),
  ('footer','stats','value_3','Stat 3 Value','text','46',4),
  ('footer','stats','label_3','Stat 3 Label','text','Communities reached',5),
  ('footer','stats','value_4','Stat 4 Value','text','9',6),
  ('footer','stats','label_4','Stat 4 Label','text','Countries impacted',7)
on conflict (page, section, key) do nothing;

alter table public.programs add column if not exists stat_value text;
alter table public.programs add column if not exists stat_label text;


-- ---------- ENTERPRISE PUBLISHING WORKFLOW ---------------------------------
alter table public.page_content
  add column if not exists draft_value text,
  add column if not exists status text not null default 'published',
  add column if not exists published_at timestamptz,
  add column if not exists publish_at timestamptz,
  add column if not exists unpublish_at timestamptz,
  add column if not exists updated_by uuid references auth.users(id) on delete set null;
update public.page_content
set draft_value = coalesce(draft_value, value), published_at = coalesce(published_at, updated_at)
where draft_value is null or published_at is null;
do $$ begin
  alter table public.page_content add constraint page_content_status_check
    check (status in ('draft','published','scheduled','archived'));
exception when duplicate_object then null; end $$;

drop policy if exists "page_content public read" on public.page_content;
revoke select on public.page_content from anon;
drop policy if exists "page_content staff read" on public.page_content;
create policy "page_content staff read" on public.page_content
  for select to authenticated using (
    public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')
  );

create or replace view public.published_page_content as
  select id,page,section,key,label,content_type,value,position,updated_at
  from public.page_content
  where status='published'
    and (published_at is null or published_at <= now())
    and (unpublish_at is null or unpublish_at > now());
grant select on public.published_page_content to anon, authenticated;

create table if not exists public.page_content_versions (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.page_content(id) on delete cascade,
  page text not null,
  section text not null,
  key text not null,
  value text,
  draft_value text,
  status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select, insert on public.page_content_versions to authenticated;
grant all on public.page_content_versions to service_role;
alter table public.page_content_versions enable row level security;
drop policy if exists "staff read versions" on public.page_content_versions;
create policy "staff read versions" on public.page_content_versions for select to authenticated
  using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));
drop policy if exists "staff create versions" on public.page_content_versions;
create policy "staff create versions" on public.page_content_versions for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

create or replace function public.capture_page_content_version()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if row(old.value, old.draft_value, old.status, old.publish_at, old.unpublish_at)
     is distinct from row(new.value, new.draft_value, new.status, new.publish_at, new.unpublish_at) then
    insert into public.page_content_versions(content_id,page,section,key,value,draft_value,status,changed_by)
    values(old.id,old.page,old.section,old.key,old.value,old.draft_value,old.status,auth.uid());
  end if;
  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists page_content_version_trigger on public.page_content;
create trigger page_content_version_trigger before update on public.page_content
for each row execute function public.capture_page_content_version();

create table if not exists public.page_seo (
  page text primary key,
  title text not null default '',
  description text not null default '',
  og_title text not null default '',
  og_description text not null default '',
  og_image text,
  canonical_path text,
  robots text not null default 'index,follow',
  draft jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
grant select on public.page_seo to anon, authenticated;
grant insert, update, delete on public.page_seo to authenticated;
grant all on public.page_seo to service_role;
alter table public.page_seo enable row level security;
drop policy if exists "seo public read" on public.page_seo;
create policy "seo public read" on public.page_seo for select using (true);
drop policy if exists "seo staff write" on public.page_seo;
create policy "seo staff write" on public.page_seo for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor'));

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select on public.audit_log to authenticated;
grant all on public.audit_log to service_role;
alter table public.audit_log enable row level security;
drop policy if exists "admins read audit" on public.audit_log;
create policy "admins read audit" on public.audit_log for select to authenticated
  using (public.has_role(auth.uid(),'admin'));

drop policy if exists "profiles readable by everyone" on public.profiles;
drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles for select to authenticated using (id=auth.uid() or public.has_role(auth.uid(),'admin'));
revoke select on public.profiles from anon;

alter table public.profiles
  add column if not exists disabled_at timestamptz,
  add column if not exists notification_email boolean not null default true,
  add column if not exists notification_browser boolean not null default true,
  add column if not exists last_active_at timestamptz;

create or replace function public.publish_page(_page text, _publish_at timestamptz default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'editor')) then raise exception 'forbidden'; end if;
  if _publish_at is not null and _publish_at > now() then
    update public.page_content set status='scheduled', publish_at=_publish_at where page=_page;
    insert into public.audit_log(actor_id,action,entity_type,entity_id,details)
      values(auth.uid(),'schedule','page',_page,jsonb_build_object('publish_at',_publish_at));
  else
    update public.page_content set value=coalesce(draft_value,value), status='published', published_at=now(), publish_at=null where page=_page;
    insert into public.audit_log(actor_id,action,entity_type,entity_id) values(auth.uid(),'publish','page',_page);
  end if;
end $$;
grant execute on function public.publish_page(text,timestamptz) to authenticated;

create or replace function public.unpublish_page(_page text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'forbidden'; end if;
  update public.page_content set status='archived', unpublish_at=now() where page=_page;
  insert into public.audit_log(actor_id,action,entity_type,entity_id) values(auth.uid(),'unpublish','page',_page);
end $$;
grant execute on function public.unpublish_page(text) to authenticated;

create or replace function public.publish_due_content()
returns integer language plpgsql security definer set search_path = public as $$
declare affected integer;
begin
  update public.page_content set value=coalesce(draft_value,value), status='published', published_at=now(), publish_at=null
  where status='scheduled' and publish_at <= now();
  get diagnostics affected = row_count;
  update public.page_content set status='archived' where status='published' and unpublish_at <= now();
  return affected;
end $$;

insert into public.page_seo(page,title,description,og_title,og_description,canonical_path) values
('home','Elle''s Foundation — Feeding Hope. Restoring Lives.','A community-focused nonprofit improving lives through education, health, shelter, and community development.','Elle''s Foundation — Feeding Hope. Restoring Lives.','Every child deserves a chance and every community deserves the opportunity to thrive.','/'),
('about','About — Elle''s Foundation','Learn about Elle''s Foundation, our mission, vision, values, and community-led work.','About Elle''s Foundation','Our story, mission, and commitment to restoring dignity.','/about'),
('programs','Programs — Elle''s Foundation','Explore education, health, shelter, and community development programs.','Programs — Elle''s Foundation','Four pillars creating practical, lasting change.','/programs'),
('sponsor','Sponsor — Elle''s Foundation','Sponsor education, food, shelter, or clean water in Ghana cedis.','Sponsor a life. Change a story.','Recurring gifts that create lasting change.','/sponsor'),
('donate','Donate — Elle''s Foundation','Give in Ghana cedis to fund education, meals, shelter, and community support.','Donate to Elle''s Foundation','Every cedi restores dignity and hope.','/donate'),
('contact','Contact — Elle''s Foundation','Contact Elle''s Foundation to volunteer, partner, donate, or ask a question.','Contact Elle''s Foundation','Volunteer, partner, or get in touch.','/contact')
on conflict(page) do nothing;

insert into public.page_content(page,section,key,label,content_type,value,draft_value,position) values
('contact','hero','eyebrow','Eyebrow','text','Contact Us','Contact Us',0),
('contact','hero','title','Title','text','Let''s build something lasting together.','Let''s build something lasting together.',1),
('contact','hero','description','Description','textarea','Volunteer, partner, or simply say hello. Our team responds within one business day.','Volunteer, partner, or simply say hello. Our team responds within one business day.',2),
('contact','info','email','Email','text','info@ellefoundation.org','info@ellefoundation.org',0),
('contact','info','phone','Phone','text','+233 55 123 4567','+233 55 123 4567',1),
('contact','info','office','Office','text','Accra, Ghana · Open Mon–Fri','Accra, Ghana · Open Mon–Fri',2),
('donate','hero','eyebrow','Eyebrow','text','Give with purpose','Give with purpose',0),
('donate','hero','title','Title','text','Every cedi becomes someone''s hope.','Every cedi becomes someone''s hope.',1),
('donate','hero','description','Description','textarea','98% of every donation goes directly to programs. All amounts are in Ghana Cedis (GH₵).','98% of every donation goes directly to programs. All amounts are in Ghana Cedis (GH₵).',2),
('sponsor','hero','eyebrow','Eyebrow','text','Sponsorship','Sponsorship',0)
on conflict(page,section,key) do nothing;

create table if not exists public.cms_schema_versions (
  version text primary key,
  applied_at timestamptz not null default now()
);
grant select on public.cms_schema_versions to authenticated;
grant all on public.cms_schema_versions to service_role;
insert into public.cms_schema_versions(version) values('2026-08-12-enterprise-cms') on conflict do nothing;
select pg_notify('pgrst','reload schema');

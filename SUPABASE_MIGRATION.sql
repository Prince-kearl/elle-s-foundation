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

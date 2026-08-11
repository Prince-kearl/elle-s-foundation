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

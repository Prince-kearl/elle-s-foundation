-- Elle's Foundation Brand & Theme CMS
-- Creates the tables used by /admin/brand and the public BrandStyle provider.
-- Safe to run after the core CMS authorization helper has been installed.

create table if not exists public.brand_settings (
  id integer primary key default 1,
  primary_color text not null default '#0F6848',
  forest_color text not null default '#084B35',
  cream_color text not null default '#F1FAE9',
  sand_color text not null default '#CDECA7',
  earth_color text not null default '#F26518',
  gold_color text not null default '#FF8A3D',
  ink_color text not null default '#124A3A',
  background_color text not null default '#FBFFF8',
  heading_font text not null default 'DM Sans',
  body_font text not null default 'Manrope',
  base_font_size text not null default '16px',
  heading_weight text not null default '600',
  heading_scale numeric not null default 1,
  body_scale numeric not null default 1,
  letter_spacing text not null default '0em',
  line_height text not null default '1.6',
  section_spacing text not null default '6rem',
  container_width text not null default '1200px',
  radius text not null default '0.625rem',
  muted_color text default '#6B7280',
  updated_at timestamptz not null default now(),
  constraint brand_settings_singleton check (id = 1)
);

grant select on public.brand_settings to anon, authenticated;
grant insert, update, delete on public.brand_settings to authenticated;
grant all on public.brand_settings to service_role;
alter table public.brand_settings enable row level security;

drop policy if exists "brand public read" on public.brand_settings;
create policy "brand public read"
  on public.brand_settings for select
  using (true);

drop policy if exists "brand admin write" on public.brand_settings;
create policy "brand admin write"
  on public.brand_settings for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into public.brand_settings (id)
values (1)
on conflict (id) do nothing;

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
create policy "page_brand public read"
  on public.page_brand for select
  using (true);

drop policy if exists "page_brand admin write" on public.page_brand;
create policy "page_brand admin write"
  on public.page_brand for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into public.page_brand (page)
values ('global'), ('home'), ('about'), ('programs'), ('sponsor'), ('donate'), ('contact')
on conflict (page) do nothing;

notify pgrst, 'reload schema';

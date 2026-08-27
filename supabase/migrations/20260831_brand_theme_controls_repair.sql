-- Ensure every Brand & Theme control has a matching production column.
-- Safe to run repeatedly in the Supabase SQL Editor.
alter table if exists public.brand_settings
  add column if not exists heading_weight text not null default '600',
  add column if not exists muted_color text default '#6B7280';

alter table if exists public.page_brand
  add column if not exists heading_weight text,
  add column if not exists muted_color text;

select pg_notify('pgrst', 'reload schema');

-- Persist optional custom font files alongside Google Fonts choices.
-- Safe to run repeatedly in the Supabase SQL Editor.
alter table if exists public.brand_settings
  add column if not exists custom_heading_font_url text,
  add column if not exists custom_body_font_url text;

alter table if exists public.page_brand
  add column if not exists custom_heading_font_url text,
  add column if not exists custom_body_font_url text;

select pg_notify('pgrst', 'reload schema');

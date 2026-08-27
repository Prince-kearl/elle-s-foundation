-- Persist custom font weight and style settings alongside uploaded font URLs.
-- Safe to run repeatedly in the Supabase SQL Editor.
alter table if exists public.brand_settings
  add column if not exists custom_heading_font_weight text default '600',
  add column if not exists custom_body_font_weight text default '400',
  add column if not exists custom_heading_font_style text default 'normal',
  add column if not exists custom_body_font_style text default 'normal';

alter table if exists public.page_brand
  add column if not exists custom_heading_font_weight text,
  add column if not exists custom_body_font_weight text,
  add column if not exists custom_heading_font_style text,
  add column if not exists custom_body_font_style text;

update public.brand_settings
set custom_heading_font_weight = coalesce(custom_heading_font_weight, '600'),
    custom_body_font_weight = coalesce(custom_body_font_weight, '400'),
    custom_heading_font_style = coalesce(custom_heading_font_style, 'normal'),
    custom_body_font_style = coalesce(custom_body_font_style, 'normal')
where id = 1;

select pg_notify('pgrst', 'reload schema');

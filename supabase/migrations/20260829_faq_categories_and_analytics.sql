-- FAQ categories and privacy-conscious anonymous engagement analytics
-- Safe to run after the existing faqs table migration.

alter table if exists public.faqs
  add column if not exists category text not null default 'General';

create index if not exists faqs_category_position_idx
  on public.faqs (category, position);

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

create index if not exists faq_interactions_faq_event_idx
  on public.faq_interactions (faq_id, event_type, created_at desc);
create index if not exists faq_interactions_search_idx
  on public.faq_interactions (event_type, query_text, created_at desc);

alter table public.faq_interactions enable row level security;

drop policy if exists "public can record faq interactions" on public.faq_interactions;
create policy "public can record faq interactions"
  on public.faq_interactions
  for insert
  to anon, authenticated
  with check (
    (faq_id is null or exists (
      select 1 from public.faqs f
      where f.id = faq_id and f.visible = true
    ))
    and (event_type = 'view' or (event_type = 'search' and query_text is not null))
  );

drop policy if exists "staff can read faq interactions" on public.faq_interactions;
create policy "staff can read faq interactions"
  on public.faq_interactions
  for select
  to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'editor')
  );

grant insert on public.faq_interactions to anon, authenticated;
grant select on public.faq_interactions to authenticated;
grant all on public.faq_interactions to service_role;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'faq_interactions'
  ) then
    execute 'alter publication supabase_realtime add table public.faq_interactions';
  end if;
end $$;

notify pgrst, 'reload schema';

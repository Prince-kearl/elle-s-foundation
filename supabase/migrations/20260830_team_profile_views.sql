-- Team profile engagement analytics
-- Records anonymous profile-card opens without storing visitor identity or contact data.

create table if not exists public.team_profile_views (
  id uuid primary key default gen_random_uuid(),
  team_member_id uuid not null references public.team_members(id) on delete cascade,
  source text not null default 'about',
  created_at timestamptz not null default now()
);

create index if not exists team_profile_views_member_created_idx
  on public.team_profile_views (team_member_id, created_at desc);

alter table public.team_profile_views enable row level security;

-- Public visitors may record a view only for a currently visible team member.
drop policy if exists "public can record visible team profile views" on public.team_profile_views;
create policy "public can record visible team profile views"
  on public.team_profile_views
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.team_members tm
      where tm.id = team_member_id
        and tm.visible = true
    )
  );

-- Only administrators and editors may inspect aggregate source rows.
drop policy if exists "staff can read team profile views" on public.team_profile_views;
create policy "staff can read team profile views"
  on public.team_profile_views
  for select
  to authenticated
  using (
    public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'editor')
  );

grant insert on public.team_profile_views to anon, authenticated;
grant select on public.team_profile_views to authenticated;

-- Enable live analytics refresh when public profile cards are opened.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'team_profile_views'
  ) then
    execute 'alter publication supabase_realtime add table public.team_profile_views';
  end if;
end $$;

notify pgrst, 'reload schema';

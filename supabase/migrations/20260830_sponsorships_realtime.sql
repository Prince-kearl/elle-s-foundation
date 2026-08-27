-- Keep public sponsorship tiers synchronized with admin edits.
do $$
begin
  if to_regclass('public.sponsorships') is not null
     and not exists (
       select 1
       from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'sponsorships'
     ) then
    execute 'alter publication supabase_realtime add table public.sponsorships';
  end if;
end
$$;

notify pgrst, 'reload schema';

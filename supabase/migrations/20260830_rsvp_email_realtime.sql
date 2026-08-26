-- Keep admin RSVP email-delivery status live across dashboard sessions.
do $$
begin
  if to_regclass('public.rsvp_email_confirmations') is not null
     and not exists (
       select 1
       from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'rsvp_email_confirmations'
     ) then
    alter publication supabase_realtime add table public.rsvp_email_confirmations;
  end if;
exception
  when undefined_object then
    raise notice 'supabase_realtime publication is unavailable; enable it before applying this migration';
end
$$;

notify pgrst, 'reload schema';

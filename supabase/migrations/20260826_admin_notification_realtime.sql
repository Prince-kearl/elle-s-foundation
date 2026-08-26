create table if not exists public.admin_notification_reads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_key text not null,
  read_at timestamptz not null default now(),
  unique (user_id, notification_key)
);

alter table public.admin_notification_reads enable row level security;

drop policy if exists "notification reads own rows" on public.admin_notification_reads;
create policy "notification reads own rows"
  on public.admin_notification_reads
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.admin_notification_reads to authenticated;

-- Enable Postgres Changes for every source used by the admin dashboard metrics.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'programs', 'stories', 'team_members', 'testimonials', 'faqs',
    'contact_submissions', 'donation_intents', 'events', 'event_rsvps',
    'admin_notification_reads'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end $$;

notify pgrst, 'reload schema';

-- Contact submissions repair
-- Safe to run repeatedly. Ensures public submissions persist and admins can read/manage them.

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  interest text,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

grant insert on public.contact_submissions to anon, authenticated;
grant select, update, delete on public.contact_submissions to authenticated;
grant all on public.contact_submissions to service_role;

alter table public.contact_submissions enable row level security;

drop policy if exists "anyone can submit" on public.contact_submissions;
create policy "anyone can submit"
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admin reads" on public.contact_submissions;
create policy "admin reads"
  on public.contact_submissions
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admin manages" on public.contact_submissions;
create policy "admin manages"
  on public.contact_submissions
  for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admin deletes" on public.contact_submissions;
create policy "admin deletes"
  on public.contact_submissions
  for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'contact_submissions'
  ) then
    execute 'alter publication supabase_realtime add table public.contact_submissions';
  end if;
exception
  when undefined_object then null;
end $$;

select pg_notify('pgrst', 'reload schema');

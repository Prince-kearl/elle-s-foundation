-- Durable confirmation records for RSVP email delivery.
create table if not exists public.rsvp_email_confirmations (
  id uuid primary key default gen_random_uuid(),
  rsvp_id uuid not null references public.event_rsvps(id) on delete cascade,
  recipient_email text not null,
  status text not null default 'queued' check (status in ('queued', 'sending', 'sent', 'failed', 'needs_setup')),
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rsvp_email_confirmations_rsvp_unique unique (rsvp_id)
);

create index if not exists rsvp_email_confirmations_status_idx
  on public.rsvp_email_confirmations (status, created_at desc);

alter table public.rsvp_email_confirmations enable row level security;

drop policy if exists "Admins and editors manage RSVP email confirmations" on public.rsvp_email_confirmations;
create policy "Admins and editors manage RSVP email confirmations"
on public.rsvp_email_confirmations
for all
using (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role in ('admin', 'editor')
  )
)
with check (
  exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role in ('admin', 'editor')
  )
);

create or replace function public.queue_rsvp_email_confirmation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.rsvp_email_confirmations (rsvp_id, recipient_email, status)
  values (new.id, new.email, 'queued')
  on conflict (rsvp_id) do update
    set recipient_email = excluded.recipient_email,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists event_rsvp_email_confirmation_trigger on public.event_rsvps;
create trigger event_rsvp_email_confirmation_trigger
after insert on public.event_rsvps
for each row execute function public.queue_rsvp_email_confirmation();

-- Backfill records for RSVPs created before this migration.
insert into public.rsvp_email_confirmations (rsvp_id, recipient_email, status)
select r.id, r.email, 'queued'
from public.event_rsvps r
where not exists (
  select 1
  from public.rsvp_email_confirmations c
  where c.rsvp_id = r.id
);

grant select on public.rsvp_email_confirmations to authenticated;
grant all on public.rsvp_email_confirmations to service_role;

notify pgrst, 'reload schema';

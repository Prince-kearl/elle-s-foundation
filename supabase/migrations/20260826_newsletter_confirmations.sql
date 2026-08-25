-- Confirmation records created automatically when a newsletter subscriber joins.
create table if not exists public.newsletter_confirmation_records (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.newsletter_subscribers(id) on delete cascade,
  channel text not null check (channel in ('database', 'whatsapp')),
  status text not null default 'recorded' check (status in ('recorded', 'queued', 'sent', 'failed', 'needs_setup')),
  message text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_confirmation_channel_unique unique (subscriber_id, channel)
);

create index if not exists newsletter_confirmation_subscriber_idx
  on public.newsletter_confirmation_records (subscriber_id, channel);

create index if not exists newsletter_confirmation_status_idx
  on public.newsletter_confirmation_records (status, created_at desc);

alter table public.newsletter_confirmation_records enable row level security;

-- Confirmation records are private to authenticated administrators and editors.
drop policy if exists "Admins and editors manage newsletter confirmations" on public.newsletter_confirmation_records;
create policy "Admins and editors manage newsletter confirmations" on public.newsletter_confirmation_records
  for all using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role in ('admin', 'editor')
    )
  ) with check (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role in ('admin', 'editor')
    )
  );

create or replace function public.create_newsletter_confirmation_records()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.newsletter_confirmation_records (subscriber_id, channel, status, message)
  values
    (
      new.id,
      'database',
      'recorded',
      'Welcome to Elle''s Foundation updates. Thank you for joining a community committed to feeding hope and restoring lives.'
    ),
    (
      new.id,
      'whatsapp',
      'needs_setup',
      'Welcome to Elle''s Foundation updates. Thank you for joining a community committed to feeding hope and restoring lives. We''re glad to have you with us.'
    )
  on conflict (subscriber_id, channel) do nothing;
  return new;
end;
$$;

drop trigger if exists newsletter_subscriber_confirmation_trigger on public.newsletter_subscribers;
create trigger newsletter_subscriber_confirmation_trigger
after insert on public.newsletter_subscribers
for each row execute function public.create_newsletter_confirmation_records();

-- Backfill confirmation records for subscribers created before this migration.
insert into public.newsletter_confirmation_records (subscriber_id, channel, status, message)
select s.id, 'database', 'recorded', 'Welcome to Elle''s Foundation updates. Thank you for joining a community committed to feeding hope and restoring lives.'
from public.newsletter_subscribers s
where not exists (
  select 1 from public.newsletter_confirmation_records r
  where r.subscriber_id = s.id and r.channel = 'database'
);

insert into public.newsletter_confirmation_records (subscriber_id, channel, status, message)
select s.id, 'whatsapp', 'needs_setup', 'Welcome to Elle''s Foundation updates. Thank you for joining a community committed to feeding hope and restoring lives. We''re glad to have you with us.'
from public.newsletter_subscribers s
where not exists (
  select 1 from public.newsletter_confirmation_records r
  where r.subscriber_id = s.id and r.channel = 'whatsapp'
);

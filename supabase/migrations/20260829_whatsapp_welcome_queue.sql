-- Provider-neutral queue for WhatsApp welcome messages.
create table if not exists public.whatsapp_welcome_queue (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('newsletter', 'donation')),
  source_id uuid not null,
  phone text not null,
  message text not null,
  status text not null default 'needs_setup' check (status in ('needs_setup', 'queued', 'sending', 'sent', 'failed')),
  provider_message_id text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  constraint whatsapp_welcome_source_unique unique (source_type, source_id)
);

create index if not exists whatsapp_welcome_queue_status_idx
  on public.whatsapp_welcome_queue (status, created_at desc);

create index if not exists whatsapp_welcome_queue_phone_idx
  on public.whatsapp_welcome_queue (phone);

alter table public.whatsapp_welcome_queue enable row level security;

drop policy if exists "Admins and editors manage WhatsApp welcome queue" on public.whatsapp_welcome_queue;
create policy "Admins and editors manage WhatsApp welcome queue" on public.whatsapp_welcome_queue
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

create or replace function public.queue_newsletter_whatsapp_welcome()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if nullif(trim(new.whatsapp_number), '') is not null then
    insert into public.whatsapp_welcome_queue (source_type, source_id, phone, message)
    values (
      'newsletter',
      new.id,
      trim(new.whatsapp_number),
      'Welcome to Elle''s Foundation updates. Thank you for joining a community committed to feeding hope and restoring lives.'
    )
    on conflict (source_type, source_id) do update
      set phone = excluded.phone,
          status = 'needs_setup',
          provider_message_id = null,
          error_message = null,
          sent_at = null,
          updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists newsletter_whatsapp_queue_trigger on public.newsletter_subscribers;
create trigger newsletter_whatsapp_queue_trigger
after insert or update of whatsapp_number on public.newsletter_subscribers
for each row execute function public.queue_newsletter_whatsapp_welcome();

create or replace function public.queue_donation_whatsapp_welcome()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if nullif(trim(new.phone), '') is not null then
    insert into public.whatsapp_welcome_queue (source_type, source_id, phone, message)
    values (
      'donation',
      new.id,
      trim(new.phone),
      'Thank you for your generous donation to Elle''s Foundation. We''ll follow up with the next steps and payment instructions.'
    )
    on conflict (source_type, source_id) do update
      set phone = excluded.phone, updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists donation_whatsapp_queue_trigger on public.donation_intents;
create trigger donation_whatsapp_queue_trigger
after insert on public.donation_intents
for each row execute function public.queue_donation_whatsapp_welcome();

-- Queue existing opted-in phone numbers after the migration is applied.
insert into public.whatsapp_welcome_queue (source_type, source_id, phone, message)
select 'newsletter', s.id, trim(s.whatsapp_number),
  'Welcome to Elle''s Foundation updates. Thank you for joining a community committed to feeding hope and restoring lives.'
from public.newsletter_subscribers s
where nullif(trim(s.whatsapp_number), '') is not null
on conflict (source_type, source_id) do nothing;

insert into public.whatsapp_welcome_queue (source_type, source_id, phone, message)
select 'donation', d.id, trim(d.phone),
  'Thank you for your generous donation to Elle''s Foundation. We''ll follow up with the next steps and payment instructions.'
from public.donation_intents d
where nullif(trim(d.phone), '') is not null
on conflict (source_type, source_id) do nothing;

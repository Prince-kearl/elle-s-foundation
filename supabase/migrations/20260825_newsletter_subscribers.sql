-- Newsletter subscribers collected from the public site footer.
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'website_footer',
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_format check (position('@' in email) > 1)
);

create unique index if not exists newsletter_subscribers_email_idx
  on public.newsletter_subscribers (lower(email));

create index if not exists newsletter_subscribers_status_idx
  on public.newsletter_subscribers (status, created_at desc);

alter table public.newsletter_subscribers enable row level security;

-- Visitors may subscribe, but cannot read or update the subscriber list.
drop policy if exists "Public can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Public can subscribe to newsletter" on public.newsletter_subscribers
  for insert with check (
    source = 'website_footer'
    and status = 'subscribed'
    and position('@' in email) > 1
  );

-- Admins and editors can review and manage the list from authenticated tools.
drop policy if exists "Admins and editors manage newsletter subscribers" on public.newsletter_subscribers;
create policy "Admins and editors manage newsletter subscribers" on public.newsletter_subscribers
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

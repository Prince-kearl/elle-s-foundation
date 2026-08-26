-- Repair the public newsletter subscription contract for production projects
-- where only the base newsletter migration was applied.

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'website_footer',
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_format check (position('@' in email) > 1)
);

alter table public.newsletter_subscribers
  add column if not exists whatsapp_number text;

create unique index if not exists newsletter_subscribers_email_idx
  on public.newsletter_subscribers (lower(email));

create index if not exists newsletter_subscribers_status_idx
  on public.newsletter_subscribers (status, created_at desc);

alter table public.newsletter_subscribers enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.newsletter_subscribers to anon, authenticated;
grant select, insert, update, delete on public.newsletter_subscribers to authenticated;

drop policy if exists "Public can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Public can subscribe to newsletter"
on public.newsletter_subscribers
for insert
to anon, authenticated
with check (
  source = 'website_footer'
  and status = 'subscribed'
  and position('@' in email) > 1
);

drop policy if exists "Admins and editors manage newsletter subscribers" on public.newsletter_subscribers;
create policy "Admins and editors manage newsletter subscribers"
on public.newsletter_subscribers
for all
to authenticated
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

notify pgrst, 'reload schema';

-- Built-in event management for the public calendar and admin portal.
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_type text not null default 'Community event',
  description text not null default '',
  event_date date not null,
  start_time time,
  end_time time,
  location text not null default 'Location to be announced',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  visible boolean not null default false,
  accent text not null default '#ff8a3d',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  guests integer not null default 1 check (guests between 1 and 20),
  note text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'attended', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists events_public_date_idx on public.events (visible, status, event_date, start_time);
create index if not exists event_rsvps_event_idx on public.event_rsvps (event_id, created_at desc);

alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;

-- Public visitors can only see published, visible future events.
drop policy if exists "Public can view published events" on public.events;
create policy "Public can view published events" on public.events
  for select using (visible = true and status = 'published');

-- Admins and editors manage the event calendar from the portal.
drop policy if exists "Admins and editors manage events" on public.events;
create policy "Admins and editors manage events" on public.events
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

-- Visitors can RSVP to a published event; the admin portal can review and update RSVP status.
drop policy if exists "Public can submit event RSVPs" on public.event_rsvps;
create policy "Public can submit event RSVPs" on public.event_rsvps
  for insert with check (
    exists (
      select 1 from public.events e
      where e.id = event_id and e.visible = true and e.status = 'published'
    )
  );

drop policy if exists "Admins and editors manage event RSVPs" on public.event_rsvps;
create policy "Admins and editors manage event RSVPs" on public.event_rsvps
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

-- Seed the flyer event once, without overwriting an existing admin-created record.
insert into public.events (title, event_type, description, event_date, location, status, visible, accent, position)
select 'The Smile Project', 'Featured community event', 'A day dedicated to bringing smiles, spreading love, and creating meaningful moments.', '2026-09-27', 'Dzowulu Special School', 'published', true, '#ff8a3d', 0
where not exists (select 1 from public.events where title = 'The Smile Project' and event_date = '2026-09-27');

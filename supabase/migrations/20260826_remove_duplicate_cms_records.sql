-- Remove exact duplicate public CMS records created by legacy/demo seed runs.
-- The row with the lowest position and then lowest UUID is retained for each
-- normalized content key. Distinct administrator-authored records are kept.

-- Statistics: same value and label.
with ranked as (
  select id,
         row_number() over (
           partition by lower(trim(value)), lower(trim(label))
           order by position asc, id asc
         ) as row_number
  from public.stats
)
delete from public.stats s
using ranked r
where s.id = r.id
  and r.row_number > 1;

-- Programs: same title, description, and icon.
with ranked as (
  select id,
         row_number() over (
           partition by lower(trim(title)), lower(trim(description)), coalesce(lower(trim(icon)), '')
           order by position asc, id asc
         ) as row_number
  from public.programs
)
delete from public.programs p
using ranked r
where p.id = r.id
  and r.row_number > 1;

-- Stories: same title, tag, and excerpt.
with ranked as (
  select id,
         row_number() over (
           partition by lower(trim(title)), coalesce(lower(trim(tag)), ''), coalesce(lower(trim(excerpt)), '')
           order by position asc, id asc
         ) as row_number
  from public.stories
)
delete from public.stories s
using ranked r
where s.id = r.id
  and r.row_number > 1;

-- Team members: same name and role.
with ranked as (
  select id,
         row_number() over (
           partition by lower(trim(name)), lower(trim(role))
           order by position asc, id asc
         ) as row_number
  from public.team_members
)
delete from public.team_members t
using ranked r
where t.id = r.id
  and r.row_number > 1;

-- Testimonials: same quote, name, and role.
with ranked as (
  select id,
         row_number() over (
           partition by lower(trim(quote)), lower(trim(name)), coalesce(lower(trim(role)), '')
           order by position asc, id asc
         ) as row_number
  from public.testimonials
)
delete from public.testimonials t
using ranked r
where t.id = r.id
  and r.row_number > 1;

-- Events: same title, date, and location.
with ranked as (
  select id,
         row_number() over (
           partition by lower(trim(title)), event_date, lower(trim(location))
           order by position asc, id asc
         ) as row_number
  from public.events
)
delete from public.events e
using ranked r
where e.id = r.id
  and r.row_number > 1;

notify pgrst, 'reload schema';

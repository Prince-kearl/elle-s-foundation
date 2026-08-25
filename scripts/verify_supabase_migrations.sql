-- Elle's Foundation Supabase migration verification
--
-- Run this script in the Supabase SQL Editor after applying migrations through
-- 20260829_whatsapp_welcome_queue.sql. It is read-only: it creates only a
-- transaction-local temporary result table and never changes public data.
--
-- Expected migration order:
--   20260825_events_and_rsvps.sql
--   20260825_newsletter_subscribers.sql
--   20260826_newsletter_confirmations.sql
--   20260827_newsletter_whatsapp_numbers.sql
--   20260828_donation_mobile.sql
--   20260829_whatsapp_welcome_queue.sql

begin;

create temp table migration_verification_results (
  check_id text primary key,
  category text not null,
  status text not null check (status in ('PASS', 'FAIL', 'WARN')),
  details text not null
) on commit drop;

-- ---------------------------------------------------------------------------
-- 1. Required relations and columns
-- ---------------------------------------------------------------------------
insert into migration_verification_results
select 'table.events', 'relations', case when to_regclass('public.events') is not null then 'PASS' else 'FAIL' end,
  coalesce(to_regclass('public.events')::text, 'Missing public.events');

insert into migration_verification_results
select 'table.event_rsvps', 'relations', case when to_regclass('public.event_rsvps') is not null then 'PASS' else 'FAIL' end,
  coalesce(to_regclass('public.event_rsvps')::text, 'Missing public.event_rsvps');

insert into migration_verification_results
select 'table.newsletter_subscribers', 'relations', case when to_regclass('public.newsletter_subscribers') is not null then 'PASS' else 'FAIL' end,
  coalesce(to_regclass('public.newsletter_subscribers')::text, 'Missing public.newsletter_subscribers');

insert into migration_verification_results
select 'table.newsletter_confirmation_records', 'relations', case when to_regclass('public.newsletter_confirmation_records') is not null then 'PASS' else 'FAIL' end,
  coalesce(to_regclass('public.newsletter_confirmation_records')::text, 'Missing public.newsletter_confirmation_records');

insert into migration_verification_results
select 'table.donation_intents', 'relations', case when to_regclass('public.donation_intents') is not null then 'PASS' else 'FAIL' end,
  coalesce(to_regclass('public.donation_intents')::text, 'Missing public.donation_intents');

insert into migration_verification_results
select 'table.whatsapp_welcome_queue', 'relations', case when to_regclass('public.whatsapp_welcome_queue') is not null then 'PASS' else 'FAIL' end,
  coalesce(to_regclass('public.whatsapp_welcome_queue')::text, 'Missing public.whatsapp_welcome_queue');

with expected(table_name, column_name, data_type, is_nullable) as (
  values
    ('newsletter_subscribers', 'id', 'uuid', 'NO'),
    ('newsletter_subscribers', 'email', 'text', 'NO'),
    ('newsletter_subscribers', 'whatsapp_number', 'text', 'YES'),
    ('newsletter_subscribers', 'status', 'text', 'NO'),
    ('newsletter_confirmation_records', 'subscriber_id', 'uuid', 'NO'),
    ('newsletter_confirmation_records', 'channel', 'text', 'NO'),
    ('donation_intents', 'phone', 'text', 'YES'),
    ('whatsapp_welcome_queue', 'source_type', 'text', 'NO'),
    ('whatsapp_welcome_queue', 'source_id', 'uuid', 'NO'),
    ('whatsapp_welcome_queue', 'phone', 'text', 'NO'),
    ('whatsapp_welcome_queue', 'status', 'text', 'NO')
), actual as (
  select table_name, column_name, data_type, is_nullable
  from information_schema.columns
  where table_schema = 'public'
)
insert into migration_verification_results
select 'column.' || e.table_name || '.' || e.column_name, 'columns',
  case when a.table_name is not null and a.data_type = e.data_type and a.is_nullable = e.is_nullable then 'PASS' else 'FAIL' end,
  case when a.table_name is null then 'Missing column public.' || e.table_name || '.' || e.column_name
       else format('Found %s %s NULLABLE=%s; expected %s NULLABLE=%s', a.table_name || '.' || a.column_name, a.data_type, a.is_nullable, e.data_type, e.is_nullable) end
from expected e
left join actual a using (table_name, column_name);

-- ---------------------------------------------------------------------------
-- 2. Foreign keys
-- ---------------------------------------------------------------------------
with expected(constraint_name, table_name, column_name, foreign_table, foreign_column) as (
  values
    ('event_rsvps_event_id_fkey', 'event_rsvps', 'event_id', 'events', 'id'),
    ('newsletter_confirmation_records_subscriber_id_fkey', 'newsletter_confirmation_records', 'subscriber_id', 'newsletter_subscribers', 'id')
), actual as (
  select
    c.conname,
    c.conrelid::regclass::text as table_name,
    a.attname as column_name,
    c.confrelid::regclass::text as foreign_table,
    af.attname as foreign_column
  from pg_constraint c
  join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
  join pg_attribute af on af.attrelid = c.confrelid and af.attnum = c.confkey[1]
  where c.contype = 'f' and c.connamespace = 'public'::regnamespace
)
insert into migration_verification_results
select 'fk.' || e.table_name || '.' || e.column_name, 'foreign_keys',
  case when a.conname is not null then 'PASS' else 'FAIL' end,
  case when a.conname is null then format('Missing FK %s: public.%s.%s -> public.%s.%s', e.constraint_name, e.table_name, e.column_name, e.foreign_table, e.foreign_column)
       else format('Found %s: %s.%s -> %s.%s', a.conname, a.table_name, a.column_name, a.foreign_table, a.foreign_column) end
from expected e
left join actual a on a.conname = e.constraint_name and a.table_name = 'public.' || e.table_name and a.column_name = e.column_name and a.foreign_table = 'public.' || e.foreign_table and a.foreign_column = e.foreign_column;

insert into migration_verification_results
select 'fk.whatsapp_welcome_queue.source_id', 'foreign_keys', 'WARN',
  'Intentional polymorphic source_id: it references newsletter_subscribers or donation_intents by source_type and is not a conventional FK.';

-- ---------------------------------------------------------------------------
-- 3. Check constraints
-- ---------------------------------------------------------------------------
with expected(table_name, constraint_name, definition_regex) as (
  values
    ('events', 'events_status_check', 'status.*draft.*published.*archived'),
    ('event_rsvps', 'event_rsvps_guests_check', 'guests.*1.*20'),
    ('event_rsvps', 'event_rsvps_status_check', 'status.*pending.*confirmed.*attended.*cancelled'),
    ('newsletter_subscribers', 'newsletter_subscribers_status_check', 'status.*subscribed.*unsubscribed'),
    ('newsletter_confirmation_records', 'newsletter_confirmation_records_channel_check', 'channel.*database.*whatsapp'),
    ('newsletter_confirmation_records', 'newsletter_confirmation_records_status_check', 'status.*recorded.*queued.*sent.*failed.*needs_setup'),
    ('whatsapp_welcome_queue', 'whatsapp_welcome_queue_source_type_check', 'source_type.*newsletter.*donation'),
    ('whatsapp_welcome_queue', 'whatsapp_welcome_queue_status_check', 'status.*needs_setup.*queued.*sending.*sent.*failed')
), actual as (
  select c.conrelid::regclass::text as table_name, c.conname as constraint_name, pg_get_constraintdef(c.oid) as definition
  from pg_constraint c
  where c.contype = 'c' and c.connamespace = 'public'::regnamespace
)
insert into migration_verification_results
select 'check.' || e.table_name || '.' || e.constraint_name, 'check_constraints',
  case when a.constraint_name is not null then 'PASS' else 'FAIL' end,
  case when a.constraint_name is null then format('Missing check constraint %s on public.%s', e.constraint_name, e.table_name)
       else format('Found %s: %s', a.constraint_name, a.definition) end
from expected e
left join actual a on a.table_name = 'public.' || e.table_name and a.constraint_name = e.constraint_name and a.definition ~* e.definition_regex;

-- ---------------------------------------------------------------------------
-- 4. Unique constraints and indexes
-- ---------------------------------------------------------------------------
with expected(table_name, object_name, definition_fragment) as (
  values
    ('newsletter_confirmation_records', 'newsletter_confirmation_channel_unique', 'unique (subscriber_id, channel)'),
    ('whatsapp_welcome_queue', 'whatsapp_welcome_source_unique', 'unique (source_type, source_id)')
), actual as (
  select c.conrelid::regclass::text as table_name, c.conname as object_name, pg_get_constraintdef(c.oid) as definition
  from pg_constraint c
  where c.contype in ('u', 'p') and c.connamespace = 'public'::regnamespace
)
insert into migration_verification_results
select 'unique.' || e.table_name || '.' || e.object_name, 'unique_constraints',
  case when a.object_name is not null then 'PASS' else 'FAIL' end,
  case when a.object_name is null then format('Missing unique constraint %s on public.%s', e.object_name, e.table_name)
       else format('Found %s: %s', a.object_name, a.definition) end
from expected e
left join actual a on a.table_name = 'public.' || e.table_name and a.object_name = e.object_name and lower(a.definition) like '%' || lower(e.definition_fragment) || '%';

insert into migration_verification_results
select 'index.newsletter_subscribers.email_lower_unique', 'unique_indexes',
  case when exists (
    select 1 from pg_indexes
    where schemaname = 'public' and tablename = 'newsletter_subscribers'
      and indexdef ilike '%unique%' and indexdef ilike '%lower(email)%'
  ) then 'PASS' else 'FAIL' end,
  'Case-insensitive uniqueness for newsletter subscriber email addresses.';

-- ---------------------------------------------------------------------------
-- 5. Row-level security and policies
-- ---------------------------------------------------------------------------
with expected(table_name) as (
  values ('events'), ('event_rsvps'), ('newsletter_subscribers'), ('newsletter_confirmation_records'), ('donation_intents'), ('whatsapp_welcome_queue')
), actual as (
  select c.relname as table_name, c.relrowsecurity as rls_enabled
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
)
insert into migration_verification_results
select 'rls.' || e.table_name, 'row_level_security',
  case when a.rls_enabled then 'PASS' when a.table_name is null then 'FAIL' else 'FAIL' end,
  case when a.table_name is null then 'Table is missing' when a.rls_enabled then 'RLS enabled' else 'RLS is disabled' end
from expected e left join actual a using (table_name);

with expected(policy_name, table_name) as (
  values
    ('Public can view published events', 'events'),
    ('Public can submit event RSVPs', 'event_rsvps'),
    ('Admins and editors manage events', 'events'),
    ('Admins and editors manage event RSVPs', 'event_rsvps'),
    ('Public can subscribe to newsletter', 'newsletter_subscribers'),
    ('Admins and editors manage newsletter subscribers', 'newsletter_subscribers'),
    ('Admins and editors manage newsletter confirmations', 'newsletter_confirmation_records'),
    ('Admins and editors manage donation intents', 'donation_intents'),
    ('Admins and editors manage WhatsApp welcome queue', 'whatsapp_welcome_queue')
)
insert into migration_verification_results
select 'policy.' || e.table_name || '.' || e.policy_name, 'rls_policies',
  case when exists (
    select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = e.table_name and p.policyname = e.policy_name
  ) then 'PASS' else 'FAIL' end,
  case when exists (
    select 1 from pg_policies p where p.schemaname = 'public' and p.tablename = e.table_name and p.policyname = e.policy_name
  ) then 'Policy exists' else 'Missing policy' end
from expected e;

-- ---------------------------------------------------------------------------
-- 6. Triggers and trigger functions
-- ---------------------------------------------------------------------------
with expected(trigger_name, table_name, function_name) as (
  values
    ('newsletter_subscriber_confirmation_trigger', 'newsletter_subscribers', 'create_newsletter_confirmation_records'),
    ('newsletter_whatsapp_queue_trigger', 'newsletter_subscribers', 'queue_newsletter_whatsapp_welcome'),
    ('donation_whatsapp_queue_trigger', 'donation_intents', 'queue_donation_whatsapp_welcome')
), actual as (
  select t.tgname as trigger_name, t.tgrelid::regclass::text as table_name, p.proname as function_name
  from pg_trigger t
  join pg_proc p on p.oid = t.tgfoid
  where not t.tgisinternal and t.tgnamespace = 'public'::regnamespace
)
insert into migration_verification_results
select 'trigger.' || e.table_name || '.' || e.trigger_name, 'triggers',
  case when a.trigger_name is not null then 'PASS' else 'FAIL' end,
  case when a.trigger_name is null then format('Missing trigger %s on public.%s', e.trigger_name, e.table_name)
       else format('Found %s using %s()', a.trigger_name, a.function_name) end
from expected e
left join actual a on a.trigger_name = e.trigger_name and a.table_name = 'public.' || e.table_name and a.function_name = e.function_name;

with expected(function_name) as (
  values ('create_newsletter_confirmation_records'), ('queue_newsletter_whatsapp_welcome'), ('queue_donation_whatsapp_welcome')
)
insert into migration_verification_results
select 'function.' || e.function_name, 'trigger_functions',
  case when exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = e.function_name and p.prosecdef = true
  ) then 'PASS' else 'FAIL' end,
  case when exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = e.function_name and p.prosecdef = true
  ) then 'SECURITY DEFINER function exists' else 'Missing SECURITY DEFINER trigger function' end
from expected e;

-- ---------------------------------------------------------------------------
-- 7. Data-integrity probes (read-only)
-- ---------------------------------------------------------------------------
insert into migration_verification_results
select 'data.event_rsvps.orphans', 'data_integrity',
  case when not exists (select 1 from public.event_rsvps r left join public.events e on e.id = r.event_id where e.id is null) then 'PASS' else 'FAIL' end,
  'No event RSVP may reference a missing event.';

insert into migration_verification_results
select 'data.newsletter_confirmations.orphans', 'data_integrity',
  case when not exists (select 1 from public.newsletter_confirmation_records r left join public.newsletter_subscribers s on s.id = r.subscriber_id where s.id is null) then 'PASS' else 'FAIL' end,
  'No newsletter confirmation may reference a missing subscriber.';

insert into migration_verification_results
select 'data.whatsapp_queue.source_integrity', 'data_integrity',
  case when not exists (
    select 1 from public.whatsapp_welcome_queue q
    left join public.newsletter_subscribers s on q.source_type = 'newsletter' and q.source_id = s.id
    left join public.donation_intents d on q.source_type = 'donation' and q.source_id = d.id
    where (q.source_type = 'newsletter' and s.id is null) or (q.source_type = 'donation' and d.id is null)
  ) then 'PASS' else 'FAIL' end,
  'Every WhatsApp queue row must resolve to its source record according to source_type.';

-- ---------------------------------------------------------------------------
-- 8. Summary
-- ---------------------------------------------------------------------------
select category, status, count(*) as checks
from migration_verification_results
group by category, status
order by category, status;

select check_id, category, status, details
from migration_verification_results
where status <> 'PASS'
order by case status when 'FAIL' then 1 else 2 end, category, check_id;

select
  count(*) filter (where status = 'PASS') as passed,
  count(*) filter (where status = 'WARN') as warnings,
  count(*) filter (where status = 'FAIL') as failed,
  case when count(*) filter (where status = 'FAIL') = 0 then 'READY' else 'ACTION_REQUIRED' end as overall_status
from migration_verification_results;

rollback;

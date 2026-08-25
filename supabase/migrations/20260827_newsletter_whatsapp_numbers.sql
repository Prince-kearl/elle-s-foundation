-- Optional WhatsApp recipient details for newsletter welcome-message delivery.
alter table public.newsletter_subscribers
  add column if not exists whatsapp_number text;

create index if not exists newsletter_subscribers_whatsapp_idx
  on public.newsletter_subscribers (whatsapp_number)
  where whatsapp_number is not null;

-- The public insert policy continues to permit an optional number without
-- granting public read access to subscriber details.

-- Optional donor mobile contact for follow-up payment instructions.
alter table public.donation_intents
  add column if not exists phone text;

create index if not exists donation_intents_phone_idx
  on public.donation_intents (phone)
  where phone is not null;

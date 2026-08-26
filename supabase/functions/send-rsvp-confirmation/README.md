# Send RSVP confirmation

This Edge Function sends a transactional RSVP confirmation through Resend after a public RSVP is saved. The RSVP insert trigger creates one durable row in `public.rsvp_email_confirmations`; the function updates it to `sending`, `sent`, `failed`, or `needs_setup`.

## Required Supabase secrets

Configure these secrets in the Supabase project:

- `RESEND_API_KEY`: the Resend API key.
- `RESEND_FROM_EMAIL`: a verified sender, for example `Elle's Foundation <hello@example.org>`.
- `PUBLIC_SITE_URL`: the public website URL used in the email event link.

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided by Supabase Edge Functions.

## Deploy

Apply `20260830_rsvp_email_confirmations.sql`, then deploy:

```sh
supabase functions deploy send-rsvp-confirmation --no-verify-jwt
```

The public RSVP form invokes the function after the database insert. Email delivery is non-blocking, so a successful RSVP remains successful even if Resend is unavailable. Delivery status and provider IDs remain available to the admin portal through `rsvp_email_confirmations`.

## Test

Create a published, visible event and submit the public RSVP form with a real test email address. Confirm that an `rsvp_email_confirmations` row is created, that the status becomes `sent`, and that the Resend dashboard shows the delivery. If the provider secrets are missing, the record is marked `needs_setup` rather than silently disappearing.

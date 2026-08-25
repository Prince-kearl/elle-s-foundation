# Send WhatsApp welcome

This Edge Function processes one row from `public.whatsapp_welcome_queue` and sends an approved Meta WhatsApp template message. It supports `source_type = newsletter` and `source_type = donation`.

## Required Supabase secrets

Set these with the Supabase CLI or project dashboard secrets manager:

- `META_WHATSAPP_ACCESS_TOKEN`
- `META_WHATSAPP_PHONE_NUMBER_ID`
- `META_WHATSAPP_NEWSLETTER_TEMPLATE_NAME`
- `META_WHATSAPP_DONATION_TEMPLATE_NAME`
- `META_WHATSAPP_TEMPLATE_LANGUAGE` (default: `en_US`)
- `META_WHATSAPP_API_VERSION` (default: `v23.0`)
- `WHATSAPP_QUEUE_WEBHOOK_SECRET`

The function also requires the platform-provided `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` values. Never add these values to the React app or commit them to GitHub.

## Deploy

Apply migrations through `20260829_whatsapp_welcome_queue.sql` in order, deploy the function, and configure the database webhook for `public.whatsapp_welcome_queue` on `INSERT`. The webhook should POST the provider record JSON to this function URL and include the header `x-webhook-secret` with the exact value of `WHATSAPP_QUEUE_WEBHOOK_SECRET`.

The function accepts a direct test body of `{ "queue_id": "<queue-row-id>" }` when the same secret header is supplied. It is idempotent for rows already marked `sent`.

## Message-template requirements

Create and approve separate utility templates for newsletter and donation welcomes. The templates currently use no variables; if variables are later added, update the request body in `index.ts` and approve the changed template before sending.

## Test sequence

1. Send one internal newsletter signup with a valid E.164 WhatsApp number.
2. Confirm a `whatsapp_welcome_queue` row is created with `status = needs_setup`.
3. Confirm the database webhook invokes the function with the secret header.
4. Verify Meta returns a provider message ID and the row moves to `sent`.
5. Verify Meta status webhooks are added separately if delivery/read analytics are required.
6. Test a donation intent with a valid mobile number and confirm a second queue row uses the donation template.

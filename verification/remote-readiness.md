# Remote readiness verification

Date: 2026-08-25

The configured Supabase project host is `ufojdlmzprqiteysjppa.supabase.co`.

| Check | Result |
|---|---|
| Public `site_settings` REST query | HTTP 200; CMS endpoint is reachable |
| `newsletter_subscribers` relation | HTTP 200; relation is present remotely |
| `newsletter_confirmation_records` relation | HTTP 200; relation is present remotely |
| `donation_intents` relation | HTTP 200; relation is present remotely |
| `whatsapp_welcome_queue` relation | HTTP 404; queue migration is not present remotely |
| `send-whatsapp-welcome` Edge Function | HTTP 404 `NOT_FOUND`; function is not deployed remotely |

The Supabase CLI is not installed in the sandbox and no local project-linkage files were found. The queue migration must therefore be applied through the Supabase SQL Editor or after the user links a local Supabase CLI checkout. The Edge Function must then be deployed and its Meta/webhook secrets configured in Supabase.

The Supabase REST root endpoint returned HTTP 401 because the endpoint requires a secret API key, but the public CMS table query returned HTTP 200 using the configured publishable key; this confirms the application’s public data path rather than the administrative root endpoint.

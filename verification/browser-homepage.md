# Browser verification — public homepage

Date: 2026-08-25
URL: http://127.0.0.1:8081/

The homepage loaded successfully in Chromium with the expected title, public navigation, Search control, Support Us CTA, community calendar RSVP controls, live-section fallbacks, real community image assets, footer newsletter inputs, and the admin-managed logo shell. No fatal client-rendering error was observed.

The active Vite server selected port 8081 because port 8080 was already in use.

The build’s browser bundle completed, but the subsequent Nitro/cloudflare SSR build did not finish within the validation timeout and was stopped; this is recorded separately from the successful TypeScript check and browser load.

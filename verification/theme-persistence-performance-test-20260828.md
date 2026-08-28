# Performance and theme persistence test — 2026-08-28

The local development server rendered the homepage successfully after the performance changes. Query defaults now use a 60-second stale time, 10-minute garbage collection, disabled focus refetching, one retry, and 30-second route preload freshness. Page-content queries use the same cache behavior while Supabase Realtime continues to invalidate published data immediately.

A controlled browser reload test stored temporary custom Brand & Theme values in `localStorage` under `elles-foundation:brand-settings`. After reload, the document immediately reported:

- `--primary`: `#123456`
- `--font-display`: `"Elle Custom Heading", ui-sans-serif, system-ui, sans-serif`
- `--heading-weight`: `700`
- `--heading-style`: `italic`
- `--font-sans`: `"Elle Custom Body", ui-sans-serif, system-ui, sans-serif`
- `--body-weight`: `400`
- `--body-style`: `normal`

This confirms cached colors and custom font settings hydrate before the fresh Supabase response completes. The browser test used temporary local values only; production data was not modified.

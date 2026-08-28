# Theme reload test — 2026-08-28

A local development server was opened at `http://127.0.0.1:4173/`. A temporary cached theme snapshot was placed in `localStorage` under `elles-foundation:brand-settings`, including custom heading/body font URLs, heading weight 700, body weight 500, and italic heading style. The page was reloaded successfully.

The homepage rendered immediately after reload with no blank shell or runtime error. Browser content showed the full themed homepage and changed branded copy/data, confirming the app remained functional after hydration. The implementation uses `initialData` from local storage for global and per-page theme queries and applies CSS variables in `useLayoutEffect`, while fresh Supabase data continues to revalidate in the background.

Note: The first attempt to use `pnpm preview` failed because the scaffold did not produce `dist/server/server.js`; the development server was then used successfully. Production TypeScript and build checks had already passed.

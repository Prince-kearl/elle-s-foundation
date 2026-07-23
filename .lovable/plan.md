
# Full CMS Expansion Plan

Working against your external Supabase project. Everything below runs in sequence across several turns; I'll ship each phase end-to-end before moving on.

## Phase A — Foundation (this turn)

**SQL migration v2** (you'll run in Supabase SQL Editor):
- Create public `media` bucket + RLS (public read, admin write).
- New tables: `media_assets` (library), `brand_settings` (colors/fonts/radius per scope), `page_content` (per-page/per-key text + image rows), `sponsorships` (funding tiers).
- Add `currency` default `GHS` + `sponsorship_id` to `donation_intents`.
- Seed brand defaults + page keys for home/about/programs/donate/contact.

**Design system**
- Soften radii globally: `--radius: 0.625rem` (buttons/cards) with a `--radius-pill` for chips only. Audit `rounded-3xl/2xl` → `rounded-xl/lg`.
- Brand tokens driven by `brand_settings` via a runtime `<BrandStyle/>` injector in `__root.tsx` so admin edits recolor the live site immediately.

**Media library**
- `src/lib/storage.ts`: upload helper (`uploadImage(file, folder)`) → returns public URL + registers row in `media_assets`.
- `src/components/admin/ImageField.tsx`: drop-in replacement for URL inputs. Tabs: **Upload** / **Library** / **URL**. Preview + remove.
- Wire into all existing `CollectionEditor` fields typed `image`/`avatar`.
- New route `/admin/media` — grid of assets, upload, delete, copy-URL.

**Uploaded photos as defaults**
- Push all 10 WhatsApp photos to Storage via `lovable-assets` locally, then a one-time seed script in admin `/admin/media` "Import defaults" button (or I upload them directly via SQL after storage upload). They'll appear in the library and I'll assign a subset to hero/stories/programs.

**Ghana Cedis + Sponsorship**
- Donate page: switch to `GH₵`, quick amounts `50 / 100 / 250 / 500 / 1000`.
- New public route `/sponsor` with tiered sponsor cards (Child Education, Family Meals, Shelter, Community Well) sourced from `sponsorships` table.
- Header + Footer: add **Sponsor** button next to Donate.
- Both forms still write to `donation_intents` (no payment integration — you chose "capture intents"). Admin donations page shows currency + sponsorship link.

## Phase B — Page & Brand Customizer

**`/admin/pages`** — one editor per public page (Home, About, Programs, Donate, Contact, Sponsor).
- Renders a form built from `page_content` rows for that page.
- Every text uses `<TextField>`, every image uses `<ImageField>`.
- Sections can be reordered / hidden.
- Public pages read via `usePageContent(page)` hook → single query, cached, invalidated on save.

**`/admin/brand`** — visual theme editor:
- Color pickers for primary/forest/cream/sand/earth/gold/ink/background.
- Font family selector (Google Fonts subset: Playfair, Cormorant, Inter, Poppins, DM Sans, etc.) for headings & body.
- Base font size, heading weight, corner radius slider.
- Live preview panel; "Publish" writes to `brand_settings` and site re-themes on next paint.

## Phase C — User Management

**`/admin/users`** — list all users from `auth.users` via an RPC (`public.list_users()` security-definer, admin-only).
- Columns: email, name, role, created, last sign-in.
- Actions: change role (admin/editor/user), disable, delete (via `supabaseAdmin` edge function or RPC using service role).
- Invite by email (magic link).
- Editor role → can edit content but not brand/users.

Access control refined in RLS: `has_role(uid, 'admin' | 'editor')` on content tables.

## Phase D — Polish

- Replace all remaining placeholder AI images with uploaded WhatsApp photos on hero/stories/gallery.
- New `/gallery` public page pulling from `media_assets` where `show_in_gallery = true`.
- Success toasts, form validation with Zod, image size guardrails (2MB, jpg/png/webp).

## Technical notes

- **No payment integration** per your choice — sponsor/donate capture intents only. Add a small "How to complete your donation" info card with MoMo/bank details editable in `/admin/settings`.
- Image storage uses your Supabase `media` bucket (public). RLS: anyone SELECT, only `has_role(uid,'admin'|'editor')` INSERT/UPDATE/DELETE.
- Brand tokens are stored as JSON in `brand_settings` (single-row table) and injected as CSS variables at runtime — no rebuild required for theme changes.

---

Reply **go** and I'll start with Phase A: SQL migration v2, storage helpers, ImageField, softer corners, GHS switch, Sponsor page/button, and uploading your WhatsApp photos as the new default imagery.

# Enterprise CMS Recovery and Upgrade

## Goal
Make the existing Elle's Foundation CMS reliable first, then complete the requested enterprise editing, media, user, reporting, and visual customization workflows without replacing the current public-site design.

## 1. Repair the data foundation
- Replace the three fragmented SQL files with one idempotent, ordered migration for the external database.
- Include every table, column, grant, RLS policy, seed row, trigger, and RPC the current app uses, eliminating the missing `brand_settings`, `page_brand`, `page_content`, and `list_users_admin` errors.
- Keep public reads limited to published content; keep drafts, versions, audit events, user data, and admin controls protected by role checks.
- Add a schema-cache reload notification at the end of the migration and a small admin diagnostics view so missing prerequisites are reported clearly instead of leaving pages loading forever.

## 2. Publishing workflow, preview, and history
- Extend page content and collection content with draft/published state, publish timestamps, scheduled publish/unpublish times, author/editor metadata, and SEO fields.
- Add admin-only preview routes that render draft values and draft media using the same public components.
- Add version snapshots and a change log for create, edit, publish, unpublish, restore, role change, and media actions.
- Add side-by-side version comparison and one-click rollback, with the rollback itself recorded as a new version.

## 3. Complete page editing and public synchronization
- Finish dynamic wiring for contact, donate, sponsor, header/navigation, footer, global settings, and any remaining hardcoded homepage/secondary-page copy, statistics, images, and videos.
- Upgrade the page editor with draft save, preview, publish now, schedule, unpublish, media replacement, and per-page SEO controls.
- Invalidate and refresh the relevant public queries immediately after successful publishing so website changes appear without a manual reload.

## 4. Cloudflare R2 media pipeline
- Replace direct database-storage uploads with signed uploads to Cloudflare R2 through authenticated server functions.
- Store only media metadata and stable CDN URLs in the database; support images, videos, and common downloadable files with validation, progress, alt text, folders, and safe deletion checks.
- Keep the existing uploaded community photos as CDN-hosted site defaults and add the user-provided logo as the admin/public logo and favicon.
- Load public media through the shared media renderer with responsive images, video posters, lazy loading, and clear upload/render errors.

## 5. User lifecycle and account controls
- Move user listing, role changes, invitations, activation/deactivation, and password-reset actions behind authenticated admin server functions.
- Support admin/editor/user roles, status, last activity, invite state, and audit history while preventing the last active admin from being demoted or disabled.
- Make the header profile control open the profile/account menu; make notification preferences persist per user.

## 6. Dashboard analytics and reports
- Add usable charts for donation totals, donor activity, submissions, content publishing, and media usage with date-range filters.
- Add recent activity and scheduled-content panels backed by audit/version data.
- Export filtered donation, contact, content, and activity reports as CSV.
- Display all monetary values consistently as Ghana cedis (`GH₵` / `GHS`).

## 7. Visual customization and admin polish
- Expand global and per-page brand controls for colors, font family, font weight/style, type scale, text colors, spacing, container width, and corner radius.
- Load every selectable font dynamically in both the editor preview and public page before applying it; show loading/error feedback and a realistic live section preview.
- Replace inactive notification chrome with a real notifications panel derived from new submissions, donations, scheduled publishing, and system diagnostics.
- Reduce oversized card/button radii and preserve the established earthy Elle's Foundation design language.

## 8. Verification and handoff
- Verify public pages as a signed-out visitor and all admin workflows with an authenticated admin session.
- Test draft isolation, preview access, publish/schedule/unpublish, rollback, R2 uploads and playback, user actions, currency formatting, font switching, charts, exports, and responsive layouts.
- Deliver the consolidated SQL migration plus a short setup checklist for the external database and Cloudflare R2 credentials/domain.

## Technical notes
- TanStack Start server functions will handle protected admin and R2 operations; private credentials remain server-side.
- Existing public URL and content fallbacks remain available until the consolidated migration is applied, but admin diagnostics will surface the incomplete setup explicitly.
- The current database is external, so the SQL migration must be run once in its SQL editor before database-dependent features can be verified end-to-end.

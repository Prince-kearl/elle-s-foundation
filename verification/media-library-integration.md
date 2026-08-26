# Media Library integration verification

- The redesigned `/admin/media` route is protected by authentication and correctly redirects to `/auth` when no local admin session is present.
- The public homepage loads successfully after the new CMS image-slot wiring.
- The homepage hero resolves through `home.hero.image` with the existing SVG fallback.
- The homepage past-event card resolves through `home.past_event.image` with the hero fallback.
- The homepage About image resolves through `home.about.image` with the existing outreach fallback.
- Homepage program fallback images resolve through `home.programs.image_1` through `home.programs.image_4`.
- Homepage story fallback images resolve through `home.stories.image_1` through `home.stories.image_3`.
- The volunteer feature resolves through `home.volunteer.image`.
- Public image-slot values are read from published page content; the admin editor writes draft values and publishes via the existing `publish_page` RPC.
- No uploads, deletions, draft saves, or publish actions were submitted during this verification.

## Remaining verification limitation

The authenticated Media Library visual workflow was not opened in the local browser because no local admin session was active. Route protection was verified successfully; the editor should be visually checked after signing in with an authorized admin account.

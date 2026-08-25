# Hero CTA pill verification

Date: 2026-08-25
URL: http://127.0.0.1:8080/

Both homepage hero CTAs are rendered with `border-radius: 9999px` in the browser:

- Donate Now — 56px high, 189.84px wide
- Become a Volunteer — 50px high, 202.66px wide

The global sharp-corner rule remains in place for the rest of the site; only the two hero CTA anchors use the targeted `hero-pill` exception.

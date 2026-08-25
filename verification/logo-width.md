# Navbar logo width measurement

Date: 2026-08-25
URL: http://127.0.0.1:8080/
Viewport: 1280px wide

The shared logo container currently expands to 408.66px because of the long tagline. Actual text bounds measured with a DOM Range were:

- Organization name: 164.14px at 21.6px font size and -0.54px letter spacing.
- Tagline: 408.66px at 9.92px font size and 2.7776px letter spacing.

The requested change is to reduce and tighten the tagline so its rendered width is approximately aligned with the organization name above it.

After reducing the tagline to 0.38rem with 0.08em tracking, its actual text bound measured 188.63px, while the organization name measured 164.14px. The next refinement removes the extra tracking so the two bounds align more closely.

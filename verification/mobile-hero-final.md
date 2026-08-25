# Mobile hero responsive check

Date: 2026-08-25
Viewport: 407×846

The final mobile hero centers the eyebrow, heading, description, and CTA group. The CTAs stack vertically on narrow screens and remain centered. The supplied community image is visible on the right side of the portrait crop while the green left-side treatment preserves copy readability. At `md` and above, the original desktop object-center crop and left-aligned hero layout are preserved.

TypeScript and `git diff --check` passed after the final crop adjustment.

A 1280×846 desktop screenshot confirmed that the desktop image crop remains centered, the hero content remains left-aligned, and the CTAs remain in a horizontal row. The mobile positioning and stacking utilities do not alter the desktop composition.

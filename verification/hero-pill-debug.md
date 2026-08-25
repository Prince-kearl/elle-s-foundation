# Hero pill styling debug

Date: 2026-08-25

The live homepage contains both `a.hero-pill` elements, and the active Vite stylesheet serves the `.hero-pill { border-radius: 9999px !important; }` rule. However, computed browser styles still returned `borderRadius: 0px` for both CTAs, indicating that the current global sharp-corner rule or generated cascade needs a more specific targeted selector.

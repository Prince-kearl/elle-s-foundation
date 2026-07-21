export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const color = tone === "light" ? "var(--color-cream)" : "var(--color-primary)";
  const accent = "var(--color-gold)";
  return (
    <a href="/" className="flex items-center gap-2.5 group">
      <svg width="34" height="38" viewBox="0 0 34 38" fill="none" aria-hidden>
        <path
          d="M17 36c0-9 0-14 4-19 3-4 8-5 12-5-1 8-4 13-9 16-3 2-5 3-7 8Z"
          fill={color}
          opacity="0.9"
        />
        <path
          d="M17 36C17 22 13 14 5 10c-2-1-4-1-4-1 1 8 4 14 8 18 3 3 6 4 8 9Z"
          fill={color}
        />
        <circle cx="24" cy="9" r="2.2" fill={accent} />
      </svg>
      <div className="leading-none">
        <div
          className="font-display text-[1.35rem] font-semibold tracking-tight"
          style={{ color }}
        >
          Elle's Foundation
        </div>
        <div
          className="text-[0.62rem] uppercase tracking-[0.28em] mt-0.5"
          style={{ color: accent }}
        >
          Feeding Hope · Restoring Lives
        </div>
      </div>
    </a>
  );
}

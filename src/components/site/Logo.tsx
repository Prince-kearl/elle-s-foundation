import logoAsset from "@/assets/brand/elle-foundation-logo.png.asset.json";

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const color = tone === "light" ? "var(--color-cream)" : "var(--color-primary)";
  const accent = "var(--color-gold)";
  return (
    <a href="/" className="flex items-center gap-2.5 group">
      <span
        role="img"
        aria-label="Elle's Foundation"
        className="size-10 shrink-0"
        style={{
          backgroundColor: color,
          WebkitMaskImage: `url(${logoAsset.url})`,
          maskImage: `url(${logoAsset.url})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />

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

import logoAsset from "@/assets/brand/elles-foundation-mark.png";

export function Logo({
  tone = "dark",
  orgName = "Elle's Foundation",
  tagline = "Feeding Hope · Restoring Lives",
}: {
  tone?: "dark" | "light";
  orgName?: string;
  tagline?: string;
}) {
  const textColor = tone === "light" ? "#ffffff" : "var(--primary)";
  const subColor = tone === "light" ? "var(--sand)" : "var(--earth)";
  return (
    <a
      href="/"
      className="group flex items-center gap-2.5 lg:shrink-0"
      aria-label="Elle's Foundation home"
    >
      <span className="grid size-10 shrink-0 place-items-center">
        <img
          src={logoAsset}
          alt=""
          className={`size-9 object-contain ${tone === "light" ? "brightness-0 invert" : ""}`}
        />
      </span>
      <div className="leading-none">
        <div
          className="whitespace-nowrap font-display text-[1.35rem] font-semibold tracking-tight"
          style={{ color: textColor }}
        >
          {orgName}
        </div>
        <div
          className="mt-0.5 whitespace-nowrap text-[0.38rem] uppercase tracking-[0em]"
          style={{ color: subColor }}
        >
          {tagline}
        </div>
      </div>
    </a>
  );
}

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
  const textColor = tone === "light" ? "#ffffff" : "#0f6848";
  const subColor = tone === "light" ? "#cdeca7" : "#f26518";
  return (
    <a href="/" className="flex items-center gap-2.5 group" aria-label="Elle's Foundation home">
      <span className="grid size-10 shrink-0 place-items-center">
        <img
          src={logoAsset}
          alt=""
          className={`size-9 object-contain ${tone === "light" ? "brightness-0 invert" : ""}`}
        />
      </span>
      <div className="leading-none">
        <div
          className="font-display text-[1.35rem] font-semibold tracking-tight"
          style={{ color: textColor }}
        >
          {orgName}
        </div>
        <div
          className="mt-0.5 text-[0.62rem] uppercase tracking-[0.28em]"
          style={{ color: subColor }}
        >
          {tagline}
        </div>
      </div>
    </a>
  );
}

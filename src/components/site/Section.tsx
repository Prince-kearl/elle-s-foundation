import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  center = true,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`${center ? "text-center mx-auto" : ""} max-w-2xl mb-14`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="font-display text-4xl md:text-5xl font-semibold mt-4 leading-[1.1]">
        {title}
      </h2>
      {intro && (
        <p className="mt-5 text-muted-foreground text-lg leading-relaxed">{intro}</p>
      )}
    </div>
  );
}

export function Counter({ n, label }: { n: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-4xl md:text-5xl text-primary font-semibold">
        {n}
      </div>
      <div className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

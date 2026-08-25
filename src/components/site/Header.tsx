import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { HandHeart, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { GlobalSearch } from "./GlobalSearch";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/programs", label: "Programs" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      id="top"
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-[color:var(--color-forest)]/15 bg-[color:var(--color-cream)]/95 shadow-[0_12px_28px_-24px_rgba(8,75,53,0.8)] backdrop-blur-md"
          : "border-transparent bg-[color:var(--color-cream)]"
      }`}
    >
      <div className="container-wide flex items-center justify-between gap-6 py-3.5 lg:py-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="group relative px-3.5 py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[color:var(--color-ink)]/65 transition-colors hover:text-[color:var(--color-forest)]"
              activeProps={{
                className:
                  "group relative px-3.5 py-2 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[color:var(--color-forest)]",
              }}
            >
              {item.label}
              <span
                className="absolute inset-x-3.5 bottom-0 h-0.5 origin-left scale-x-0 bg-[color:var(--color-earth)] transition-transform group-hover:scale-x-100"
                aria-hidden="true"
              />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <GlobalSearch />
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 bg-[color:var(--color-forest)] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[color:var(--color-earth)]"
          >
            <HandHeart className="size-4" aria-hidden="true" />
            Support us
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <GlobalSearch />
          <button
            type="button"
            className="grid size-10 place-items-center border border-[color:var(--color-forest)]/20 text-[color:var(--color-forest)] transition hover:border-[color:var(--color-earth)] hover:text-[color:var(--color-earth)]"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[color:var(--color-forest)] text-white lg:hidden">
          <div className="container-wide flex flex-col gap-1 py-4">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                onClick={() => setOpen(false)}
                className="border-l-2 border-transparent px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white/70 transition hover:border-[color:var(--color-gold)] hover:bg-white/5 hover:text-white"
                activeProps={{
                  className:
                    "border-l-2 border-[color:var(--color-gold)] bg-white/5 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white",
                }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/donate"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center justify-center gap-2 bg-[color:var(--color-gold)] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--color-ink)] transition hover:bg-[color:var(--color-earth)] hover:text-white"
            >
              <HandHeart className="size-4" aria-hidden="true" />
              Support us
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

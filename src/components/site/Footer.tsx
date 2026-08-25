import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUp,
  ArrowUpRight,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  Send,
  Twitter,
} from "lucide-react";
import { toast } from "sonner";
import { usePageContent, pv } from "@/lib/page-content";
import { supabase } from "@/lib/supabase";
import { Logo } from "./Logo";

const linkGroups = [
  {
    title: "Organization",
    links: [
      { label: "About us", to: "/about" },
      { label: "Our story", to: "/about#story" },
      { label: "Focus areas", to: "/programs" },
      { label: "Core programs", to: "/programs" },
    ],
  },
  {
    title: "Participation",
    links: [
      { label: "Upcoming events", to: "/#events" },
      { label: "Stories from the field", to: "/programs#stories" },
      { label: "Make a donation", to: "/donate" },
      { label: "Volunteer with us", to: "/contact" },
    ],
  },
  {
    title: "Support & legal",
    links: [
      { label: "Frequently asked questions", to: "/#faqs" },
      { label: "Contact Elle's Foundation", to: "/contact" },
      { label: "Privacy policy", to: "/#privacy" },
      { label: "Terms of use", to: "/#terms" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Contact us", to: "/contact" },
      { label: "Our programs", to: "/programs" },
      { label: "Events calendar", to: "/#events" },
      { label: "Support the work", to: "/donate" },
    ],
  },
];

export function Footer() {
  const { data: c } = usePageContent("footer");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const socials = [
    { Icon: Facebook, href: pv(c, "social.facebook", "#"), label: "Facebook" },
    { Icon: Instagram, href: pv(c, "social.instagram", "#"), label: "Instagram" },
    { Icon: Twitter, href: pv(c, "social.twitter", "#"), label: "Twitter" },
    { Icon: Linkedin, href: pv(c, "social.linkedin", "#"), label: "LinkedIn" },
  ];

  return (
    <footer
      id="site-footer"
      className="mt-24 bg-[color:var(--color-cream)] text-[color:var(--color-ink)]"
    >
      <section className="container-wide pb-14 pt-2 sm:pb-20 sm:pt-6">
        <div className="relative overflow-hidden bg-[color:var(--color-ink)] px-6 py-9 text-white shadow-[0_18px_34px_-24px_rgba(8,75,53,0.7)] sm:px-10 sm:py-10 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-12">
          <div
            className="pointer-events-none absolute -right-12 -top-16 size-48 border-[20px] border-[color:var(--color-earth)]/15"
            aria-hidden="true"
          />
          <div className="relative max-w-2xl">
            <p className="mb-3 text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--color-sand)]">
              Partner with Elle's Foundation
            </p>
            <h2 className="font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
              {pv(c, "cta.title", "Want to host or sponsor a community programme?")}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
              {pv(
                c,
                "cta.description",
                "We partner with schools, community centres, and youth organisations to create practical programmes that restore dignity and open opportunity.",
              )}
            </p>
          </div>
          <Link
            to="/contact"
            className="relative mt-7 inline-flex shrink-0 items-center justify-center gap-3 bg-[color:var(--color-gold)] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--color-ink)] hover:bg-[color:var(--color-earth)] hover:text-white lg:mt-0"
          >
            Partner with us
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <div className="bg-[color:var(--color-forest)] text-white">
        <div className="container-wide">
          <div className="flex flex-col gap-6 border-b border-white/10 py-9 sm:flex-row sm:items-center sm:justify-between">
            <Logo tone="light" />
            <div className="flex items-center gap-2" aria-label="Social links">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="grid size-9 place-items-center border border-white/15 text-white/70 transition hover:border-[color:var(--color-gold)] hover:bg-[color:var(--color-gold)] hover:text-[color:var(--color-ink)]"
                >
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8 lg:py-12">
            {linkGroups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h3 className="border-b border-white/10 pb-3 font-display text-sm font-semibold text-white">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-3 text-xs text-white/65">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="transition-colors hover:text-[color:var(--color-gold)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div>
              <h3 className="border-b border-white/10 pb-3 font-display text-sm font-semibold text-white">
                Make an impact
              </h3>
              <ul className="mt-4 space-y-3 text-xs text-white/65">
                <li>
                  <Link
                    to="/donate"
                    className="transition-colors hover:text-[color:var(--color-gold)]"
                  >
                    Support us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="transition-colors hover:text-[color:var(--color-gold)]"
                  >
                    Volunteer with us
                  </Link>
                </li>
                <li>
                  <a
                    href="/#events"
                    className="transition-colors hover:text-[color:var(--color-gold)]"
                  >
                    View events calendar
                  </a>
                </li>
              </ul>
              <form
                className="mt-7"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const normalizedEmail = email.trim().toLowerCase();
                  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
                    toast.error("Please enter a valid email address.");
                    return;
                  }
                  setSubmitting(true);
                  try {
                    const { error } = await supabase.from("newsletter_subscribers").insert({
                      email: normalizedEmail,
                      whatsapp_number: whatsappNumber.trim() || null,
                      source: "website_footer",
                      status: "subscribed",
                    });
                    if (error && error.code !== "23505") {
                      toast.error(
                        error.code === "42P01" || error.code === "42703"
                          ? "Newsletter signups are not configured yet. Please apply all newsletter Supabase migrations."
                          : "We couldn't save your subscription. Please try again.",
                      );
                      return;
                    }
                    setEmail("");
                    setWhatsappNumber("");
                    setSubscribed(true);
                    toast.success(
                      error?.code === "23505"
                        ? "You're already on the list."
                        : "You're on the list. Your welcome message has been recorded.",
                    );
                  } catch {
                    toast.error("We couldn't reach the newsletter service. Please try again.");
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                <label
                  htmlFor="footer-email"
                  className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/60"
                >
                  {pv(c, "newsletter.title", "Stay updated")}
                </label>
                <div className="mt-2 flex border border-white/10 bg-black/10">
                  <input
                    id="footer-email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setSubscribed(false);
                    }}
                    placeholder="Your email..."
                    aria-label="Email address for newsletter"
                    autoComplete="email"
                    required
                    className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/35 focus:ring-1 focus:ring-[color:var(--color-gold)]"
                  />
                  <button
                    type="submit"
                    aria-label={submitting ? "Joining the newsletter" : "Join the newsletter"}
                    disabled={submitting}
                    className="grid size-10 shrink-0 place-items-center bg-[color:var(--color-gold)] text-[color:var(--color-ink)] hover:bg-[color:var(--color-earth)] hover:text-white disabled:cursor-wait disabled:opacity-70"
                  >
                    {submitting ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Send className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <input
                  id="footer-whatsapp"
                  type="tel"
                  value={whatsappNumber}
                  onChange={(event) => {
                    setWhatsappNumber(event.target.value);
                    setSubscribed(false);
                  }}
                  placeholder="WhatsApp number (optional)"
                  aria-label="WhatsApp number for welcome message (optional)"
                  autoComplete="tel"
                  className="mt-2 w-full border border-white/10 bg-black/10 px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/35 focus:ring-1 focus:ring-[color:var(--color-gold)]"
                />
                <p
                  className="mt-2 min-h-4 text-[0.65rem] text-[color:var(--color-sand)]"
                  aria-live="polite"
                >
                  {subscribed
                    ? "Thanks — your signup is recorded. Welcome updates are being prepared."
                    : ""}
                </p>
              </form>
            </div>
          </div>

          <div
            id="privacy"
            className="flex flex-col gap-5 border-t border-white/10 py-6 text-[0.66rem] text-white/55 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              © {new Date().getFullYear()}{" "}
              {pv(c, "legal.copyright", "Elle's Foundation. All rights reserved.")}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <a href="#privacy" className="transition-colors hover:text-white">
                Privacy policy
              </a>
              <span aria-hidden="true">•</span>
              <a id="terms" href="#terms" className="transition-colors hover:text-white">
                Terms of use
              </a>
              <span aria-hidden="true">•</span>
              <span className="text-[color:var(--color-gold)]">Community nonprofit · Ghana</span>
            </div>
            <a
              href="#top"
              className="inline-flex w-fit items-center gap-2 border border-white/15 px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] transition hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)]"
            >
              Back to top
              <ArrowUp className="size-3" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

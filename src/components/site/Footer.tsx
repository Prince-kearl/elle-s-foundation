import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 bg-[oklch(0.22_0.015_130)] text-[oklch(0.92_0.015_85)]">
      {/* Stats strip */}
      <div className="border-b border-white/10">
        <div className="container-wide grid grid-cols-2 md:grid-cols-4 gap-8 py-10 text-center">
          {[
            ["12,400+", "Children supported"],
            ["3,200", "Families assisted"],
            ["46", "Communities reached"],
            ["9", "Countries impacted"],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="font-display text-3xl text-[color:var(--color-gold)]">{n}</div>
              <div className="text-xs uppercase tracking-[0.22em] mt-1 opacity-70">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-wide py-16 grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo tone="light" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed opacity-75">
            Elle's Foundation is a community-focused nonprofit dedicated to
            improving lives through education, health, and community development —
            because every child deserves a chance.
          </p>
          <div className="flex gap-3 mt-6">
            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="size-9 rounded-full grid place-items-center border border-white/15 hover:border-[color:var(--color-gold)] hover:text-[color:var(--color-gold)] transition"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg text-white mb-4">Explore</h4>
          <ul className="space-y-2.5 text-sm opacity-80">
            <li><Link to="/about" className="hover:text-[color:var(--color-gold)]">About</Link></li>
            <li><Link to="/programs" className="hover:text-[color:var(--color-gold)]">Programs</Link></li>
            <li><Link to="/donate" className="hover:text-[color:var(--color-gold)]">Donate</Link></li>
            <li><Link to="/contact" className="hover:text-[color:var(--color-gold)]">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-white mb-4">Get in touch</h4>
          <ul className="space-y-3 text-sm opacity-80">
            <li className="flex gap-2"><Phone className="size-4 mt-0.5 shrink-0" /> +233 55 123 4567</li>
            <li className="flex gap-2"><Mail className="size-4 mt-0.5 shrink-0" /> info@ellefoundation.org</li>
            <li className="flex gap-2"><MapPin className="size-4 mt-0.5 shrink-0" /> Accra, Ghana</li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-white mb-4">Newsletter</h4>
          <p className="text-sm opacity-75 mb-3">Stories of hope, delivered monthly.</p>
          <form className="flex rounded-full bg-white/5 border border-white/15 overflow-hidden">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none placeholder:text-white/40"
            />
            <button className="px-4 bg-[color:var(--color-gold)] text-[color:var(--color-ink)] text-sm font-medium">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-wide flex flex-col md:flex-row justify-between gap-4 py-6 text-xs opacity-60">
          <div>© {new Date().getFullYear()} Elle's Foundation. All rights reserved.</div>
          <div className="flex gap-5">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Transparency</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

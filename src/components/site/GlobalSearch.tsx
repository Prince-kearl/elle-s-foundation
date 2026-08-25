import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Search, X } from "lucide-react";

type SearchScope = "site" | "admin";

type SearchItem = {
  label: string;
  description: string;
  to: string;
  keywords: string;
};

const siteItems: SearchItem[] = [
  { label: "Home", description: "Elle’s Foundation overview and impact", to: "/", keywords: "home mission impact hope" },
  { label: "About us", description: "Our story, approach, and team", to: "/about", keywords: "about story team mission" },
  { label: "Programs", description: "Education, health, shelter, and community", to: "/programs", keywords: "programs education health shelter community" },
  { label: "Support us", description: "Donate and join the work", to: "/donate", keywords: "support donate sponsor give" },
  { label: "Contact", description: "Reach the Elle’s Foundation team", to: "/contact", keywords: "contact email phone message" },
  { label: "Community events", description: "Upcoming events and RSVP registration", to: "/#events", keywords: "events calendar rsvp register community" },
];

const adminItems: SearchItem[] = [
  { label: "Dashboard", description: "Overview, metrics, and activity", to: "/admin", keywords: "dashboard overview metrics" },
  { label: "Events & RSVPs", description: "Create events and review registrations", to: "/admin/events", keywords: "events calendar rsvp registration" },
  { label: "Newsletter subscribers", description: "Review, export, and manage newsletter signups", to: "/admin/newsletter", keywords: "newsletter subscribers email audience export whatsapp" },
  { label: "Programs", description: "Manage public programmes", to: "/admin/programs", keywords: "programs education health" },
  { label: "Stories", description: "Manage stories from the field", to: "/admin/stories", keywords: "stories content" },
  { label: "Contact messages", description: "Review incoming messages", to: "/admin/contacts", keywords: "contact messages inbox" },
  { label: "Donations", description: "Review support and donation intents", to: "/admin/donations", keywords: "donations support money" },
  { label: "Brand & Theme", description: "Update colour, type, and visual settings", to: "/admin/brand", keywords: "brand theme colour font" },
  { label: "Site settings", description: "Manage global site configuration", to: "/admin/settings", keywords: "settings configuration" },
];

export function GlobalSearch({ scope = "site" }: { scope?: SearchScope }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const items = scope === "admin" ? adminItems : siteItems;
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items.slice(0, 5);
    return items.filter((item) => `${item.label} ${item.description} ${item.keywords}`.toLowerCase().includes(normalized)).slice(0, 6);
  }, [items, query]);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label="Search the website" className={`inline-flex items-center gap-2 border px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${scope === "admin" ? "border-[#0f6848]/20 bg-white text-[#0f6848] hover:bg-[#f1fae9]" : "border-border/70 bg-background/80 text-foreground/70 hover:border-primary hover:text-primary"}`}>
        <Search className="size-4" /> <span className="hidden sm:inline">Search</span><kbd className="hidden md:inline border-l border-current/20 pl-2 font-sans text-[0.58rem] opacity-60">⌘K</kbd>
      </button>
      {open && <div className={`absolute right-0 top-[calc(100%+0.75rem)] z-[70] w-[min(90vw,24rem)] border bg-white shadow-[0_20px_50px_-24px_rgba(8,75,53,0.5)] ${scope === "admin" ? "border-[#c5dfb6]" : "border-border"}`}>
        <div className="flex items-center gap-2 border-b border-[#c5dfb6]/70 px-3 py-3"><Search className="size-4 text-[#f26518]" /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={scope === "admin" ? "Search the admin portal…" : "Search pages and events…"} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#7b9185]" /><button type="button" onClick={() => setOpen(false)} aria-label="Close search"><X className="size-4 text-[#477763]" /></button></div>
        <div className="p-2">{results.length ? results.map((item) => <Link key={item.to} to={item.to as never} onClick={() => setOpen(false)} className="group flex items-start gap-3 px-3 py-3 transition hover:bg-[#f1fae9]"><span className="mt-0.5 grid size-7 shrink-0 place-items-center bg-[#cdeca7] text-[#084b35]"><ArrowUpRight className="size-3.5" /></span><span className="min-w-0"><span className="block text-sm font-bold text-[#084b35]">{item.label}</span><span className="mt-0.5 block text-xs leading-5 text-[#6b8076]">{item.description}</span></span></Link>) : <p className="px-3 py-6 text-center text-sm text-[#6b8076]">No matching pages found.</p>}</div>
        <div className="border-t border-[#c5dfb6]/70 px-3 py-2 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-[#8aa096]">{scope === "admin" ? "Portal search" : "Site search"} · Esc to close</div>
      </div>}
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { usePageContent, pv } from "@/lib/page-content";
import { usePublicEvents, type EventRecord } from "@/lib/cms";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import heroChildren from "@/assets/community/live/outreach-street-group.jpeg";
import childrenUnity from "@/assets/community/live/outreach-children.jpeg";
import programCommunity from "@/assets/community/live/community-gathering.jpeg";
import programEducation from "@/assets/community/live/community-supplies.jpeg";
import programHealth from "@/assets/community/live/family-support.jpeg";
import programShelter from "@/assets/community/live/volunteer-team.jpeg";
import story1 from "@/assets/community/live/outreach-street-group.jpeg";
import story2 from "@/assets/community/live/child-community.jpeg";
import story3 from "@/assets/community/live/team-under-tree.jpeg";
import volunteer from "@/assets/community/live/community-team.jpeg";
import operationFeedTheStreet from "@/assets/community/operation-feed-the-street-2025.jpeg";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Check,
  ChevronRight,
  GraduationCap,
  HandHeart,
  Heart,
  HeartPulse,
  Home as HomeIcon,
  Leaf,
  Quote,
  Star,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Elle's Foundation — Feeding Hope. Restoring Lives." },
      {
        name: "description",
        content:
          "A community-focused nonprofit improving lives through education, health, shelter, and community development. Join us — donate, volunteer, or partner.",
      },
      { property: "og:title", content: "Elle's Foundation — Feeding Hope. Restoring Lives." },
      {
        property: "og:description",
        content:
          "Every child deserves a chance. Every family deserves support. Every community deserves the opportunity to thrive.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

type C = Record<string, string> | undefined;
type HomepageEvent = {
  id: string;
  day: string;
  month: string;
  type: string;
  title: string;
  meta: string;
  detail: string;
  status: string;
  accent: string;
};

function Home() {
  const { data: c } = usePageContent("home");

  return (
    <SiteLayout>
      <Hero c={c} />
      <ImpactStrip />
      <UpcomingEvents />
      <PastEvent />
      <About c={c} />
      <Opportunity />
      <Programs />
      <FieldStories c={c} />
      <Mission c={c} />
      <Testimonials />
      <CTA c={c} />
    </SiteLayout>
  );
}

function Hero({ c }: { c: C }) {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-5rem)] items-end overflow-hidden bg-[#073b2b] text-white">
      <img
        src={heroChildren}
        alt="Elle's Foundation volunteers and children celebrating a community outreach moment"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        loading="eager"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,48,34,0.94)_0%,rgba(4,48,34,0.74)_40%,rgba(4,48,34,0.18)_78%,rgba(4,48,34,0.35)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(4,48,34,0.84)_0%,transparent_50%)]" />

      <div className="container-wide relative flex w-full flex-col justify-between pb-8 pt-16 sm:pb-10 md:min-h-[calc(100svh-5rem)] md:pt-28">
        <div className="max-w-4xl rise-in">
          <div className="mb-7 flex items-center gap-3 text-[0.66rem] font-bold uppercase tracking-[0.24em] text-[#cdeca7]">
            <span className="size-2 rounded-full bg-[#ff8a3d]" />
            <span>{pv(c, "hero.eyebrow", "Elle's Foundation · Est. 2015")}</span>
          </div>
          <h1 className="max-w-4xl font-display text-[3.3rem] font-semibold leading-[0.94] tracking-[-0.065em] text-white sm:text-[5.5rem] md:text-[7.1rem] lg:text-[8.5rem]">
            Feeding hope.
            <br />
            <span className="text-[#ff8a3d]">Restoring lives.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/80 md:text-lg md:leading-8">
            {pv(
              c,
              "hero.description",
              "We believe every child deserves a chance, every family deserves support, and every community deserves the opportunity to thrive with dignity and hope.",
            )}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/donate"
              className="group inline-flex items-center gap-3 rounded-full bg-[#ff8a3d] px-5 py-3.5 text-sm font-bold text-[#073b2b] transition duration-200 hover:-translate-y-0.5 hover:bg-white active:scale-[0.97]"
            >
              <span className="grid size-7 place-items-center rounded-full bg-[#073b2b] text-[#ff8a3d]">
                <Heart className="size-3.5 fill-current" />
              </span>
              {pv(c, "hero.cta_primary", "Support us")}
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/about"
              className="group inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/15 active:scale-[0.97]"
            >
              Our story
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col justify-between gap-6 border-t border-white/20 pt-5 text-xs text-white/70 md:flex-row md:items-end">
          <a href="#about" className="group inline-flex items-center gap-3 font-bold uppercase tracking-[0.2em] text-[#cdeca7]">
            <span className="grid size-9 place-items-center rounded-full border border-[#cdeca7]/50 transition group-hover:bg-[#cdeca7] group-hover:text-[#073b2b]"><ArrowDown className="size-4" /></span>
            Discover more
          </a>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[childrenUnity, story1, story3].map((image, index) => (
                <img key={image} src={image} alt="" className="size-8 rounded-full border-2 border-[#073b2b] object-cover" style={{ zIndex: 3 - index }} />
              ))}
            </div>
            <span>{pv(c, "hero.trust_text", "Trusted by 3,200+ families across Ghana and beyond.")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImpactStrip() {
  const stats = [
    { value: "12,400+", label: "Children supported", note: "Across Ghana and beyond", Icon: Users, tone: "#ff8a3d" },
    { value: "3,200", label: "Families assisted", note: "Through practical support", Icon: HandHeart, tone: "#0f9d73" },
    { value: "148K", label: "Meals served", note: "Meals and clean water", Icon: HeartPulse, tone: "#f26518" },
    { value: "82", label: "Projects completed", note: "Community-led progress", Icon: Check, tone: "#1b86b8" },
  ];

  return (
    <section className="border-b border-[#0f6848]/10 bg-[#f1fae9] py-8 md:py-10">
      <div className="container-wide">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#477763]">Impact snapshot</div>
          <div className="inline-flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#0f6848]"><span className="size-2 bg-[#0f9d73]" /> Live programme totals</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ value, label, note, Icon, tone }) => (
            <div key={label} className="soft-card border-t-4 bg-white p-5" style={{ borderTopColor: tone }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-display text-3xl font-semibold leading-none text-[#073b2b] md:text-4xl">{value}</div>
                  <div className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#477763]">{label}</div>
                </div>
                <span className="grid size-9 place-items-center" style={{ backgroundColor: `${tone}18`, color: tone }}><Icon className="size-4" /></span>
              </div>
              <div className="mt-5 border-t border-[#0f6848]/10 pt-3 text-xs font-medium text-[#477763]">↗ {note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function UpcomingEvents() {
  const { data: liveEvents } = usePublicEvents();
  const [selectedEvent, setSelectedEvent] = useState<HomepageEvent | null>(null);
  const fallbackEvents: HomepageEvent[] = [
    { id: "smile-project", day: "27", month: "SEP", type: "Featured community event", title: "The Smile Project", meta: "Dzowulu Special School · 27 Sep 2026", detail: "A day dedicated to bringing smiles, spreading love, and creating meaningful moments.", status: "Confirmed", accent: "#ff8a3d" },
    { id: "wellbeing-day", day: "05", month: "OCT", type: "Health & connection", title: "Community wellbeing day", meta: "Location to be announced", detail: "Practical conversations, check-ins, and shared support for families in our community.", status: "Coming soon", accent: "#0f9d73" },
    { id: "learning-circle", day: "18", month: "OCT", type: "Education & mentorship", title: "Community learning circle", meta: "Location to be announced", detail: "A space for young people, mentors, and families to learn, connect, and grow together.", status: "Coming soon", accent: "#1b86b8" },
  ];
  const events: HomepageEvent[] = liveEvents?.length ? liveEvents.map((event: EventRecord) => {
    const date = new Date(`${event.event_date}T00:00:00`);
    return { id: event.id, day: date.toLocaleDateString("en-GH", { day: "2-digit" }), month: date.toLocaleDateString("en-GH", { month: "short" }).toUpperCase(), type: event.event_type, title: event.title, meta: `${event.location} · ${date.toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}`, detail: event.description, status: event.status === "published" ? "Confirmed" : "Coming soon", accent: event.accent };
  }) : fallbackEvents;
  const calendarDate = liveEvents?.length ? new Date(`${liveEvents[0].event_date}T00:00:00`) : new Date("2026-09-01T00:00:00");
  const monthLabel = calendarDate.toLocaleDateString("en-GH", { month: "long", year: "numeric" });
  const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  const leadingDays = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
  const calendarDays = [...Array.from({ length: leadingDays }, () => ""), ...Array.from({ length: daysInMonth }, (_, index) => String(index + 1))];
  const highlightedDay = events[0]?.day;

  return (
    <section id="events" className="border-y border-[#0f6848]/10 bg-[#f5f3ea] py-12 md:py-16">
      <div className="container-wide">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#f26518]"><span className="size-2 bg-[#ff8a3d]" /> Community calendar</div>
            <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#073b2b] md:text-6xl">Show up for what matters.</h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-[#477763] md:text-right">Join the days that bring neighbours together. Dates and details are updated as each programme is confirmed.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.3fr_1fr]">
          <div className="soft-card bg-[#073b2b] p-5 text-white">
            <div className="flex items-start justify-between gap-3 border-b border-white/15 pb-5">
              <div><div className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#cdeca7]">Upcoming</div><div className="mt-2 font-display text-2xl">{monthLabel}</div></div>
              <CalendarDays className="size-5 text-[#ff8a3d]" />
            </div>
            <div className="mt-5 grid grid-cols-7 gap-y-3 text-center text-[0.62rem]">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}-${index}`} className="font-bold text-white/45">{day}</span>)}
              {calendarDays.map((day, index) => <span key={`${day}-${index}`} className={`mx-auto grid size-7 place-items-center ${day === highlightedDay ? "bg-[#ff8a3d] font-bold text-[#073b2b]" : "text-white/75"}`}>{day}</span>)}
            </div>
            <div className="mt-6 flex items-center gap-2 border-t border-white/15 pt-4 text-xs text-white/60"><span className="size-2 bg-[#ff8a3d]" /> {events[0]?.day} {events[0]?.month} · {events[0]?.title}</div>
          </div>

          <div className="grid gap-3">
            {events.map((event) => (
              <article key={event.id} className="soft-card group grid gap-5 border-l-4 bg-white p-5 transition hover:-translate-y-0.5 sm:grid-cols-[5rem_1fr_auto] sm:items-center" style={{ borderLeftColor: event.accent }}>
                <div className="grid size-16 place-items-center border border-[#0f6848]/15 bg-[#fbfff8] text-center"><div><div className="font-display text-2xl font-semibold leading-none text-[#073b2b]">{event.day}</div><div className="mt-1 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[#f26518]">{event.month}</div></div></div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[#477763]"><span className="size-2" style={{ backgroundColor: event.accent }} /> {event.type}</div>
                  <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-[#073b2b]">{event.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-[#477763]"><span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" /> {event.meta}</span><span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" /> Community-led</span></div>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#477763]">{event.detail}</p>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-[#0f6848]/10 pt-4 sm:block sm:border-t-0 sm:pt-0 sm:text-right"><span className="inline-flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[#0f6848]"><span className="size-2 bg-[#0f9d73]" /> {event.status}</span><button type="button" onClick={() => setSelectedEvent(event)} className="group/link mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#0f6848] transition hover:text-[#f26518]">RSVP now <ArrowUpRight className="size-4 transition-transform group-hover/link:translate-x-0.5" /></button></div>
              </article>
            ))}
          </div>
        </div>
      </div>
      {selectedEvent && <RsvpModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </section>
  );
}

function PastEvent() {
  return (
    <section className="border-b border-[#0f6848]/10 bg-[#073b2b] py-12 text-white md:py-16">
      <div className="container-wide grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
        <div className="relative overflow-hidden border border-[#cdeca7]/20 bg-[#0f6848]">
          <img src={operationFeedTheStreet} alt="Operation Feed the Street event flyer from 8 June 2025" className="mx-auto max-h-[34rem] w-full object-contain" loading="lazy" />
        </div>
        <div className="max-w-2xl">
          <div className="mb-4 flex items-center gap-3 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#cdeca7]"><span className="size-2 bg-[#ff8a3d]" /> Field archive · 08 June 2025</div>
          <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-white md:text-6xl">Operation Feed the Street.</h2>
          <p className="mt-6 text-base leading-8 text-white/70 md:text-lg">A past community action centred on meals, clean water, and restoring dignity for people experiencing hunger and homelessness.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[['01', 'Feed', 'Meals and clean water'], ['02', 'Connect', 'Community-led support'], ['03', 'Restore', 'Dignity through action']].map(([number, label, detail]) => <div key={number} className="border-t border-[#cdeca7]/25 pt-3"><div className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-[#ff8a3d]">{number}</div><div className="mt-2 font-display text-xl text-white">{label}</div><div className="mt-1 text-xs leading-5 text-white/60">{detail}</div></div>)}
          </div>
          <p className="mt-8 border-l-2 border-[#ff8a3d] pl-4 text-sm font-semibold text-[#cdeca7]">Past event archive · Operation Feed the Street (#OFTS)</p>
        </div>
      </div>
    </section>
  );
}

function RsvpModal({ event, onClose }: { event: HomepageEvent; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(1);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit(eventForm: React.FormEvent) {
    eventForm.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("event_rsvps").insert({ event_id: event.id, name, email, phone: phone || null, guests, note: note || null });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setSubmitted(true);
    toast.success("Your RSVP has been received.");
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#073b2b]/70 p-4" role="dialog" aria-modal="true" aria-labelledby="rsvp-title" onClick={onClose}>
      <div className="w-full max-w-xl border border-[#0f6848]/20 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-[#0f6848]/10 p-6">
          <div><div className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#f26518]">Community RSVP</div><h3 id="rsvp-title" className="mt-2 font-display text-3xl font-semibold text-[#073b2b]">{event.title}</h3><p className="mt-2 text-sm text-[#477763]">{event.meta}</p></div>
          <button type="button" aria-label="Close RSVP form" onClick={onClose} className="border border-[#0f6848]/15 px-3 py-2 text-sm font-bold text-[#073b2b] hover:bg-[#f1fae9]">Esc</button>
        </div>
        {submitted ? (
          <div className="p-8"><div className="grid size-12 place-items-center bg-[#0f9d73] text-white"><Check className="size-6" /></div><h4 className="mt-5 font-display text-2xl text-[#073b2b]">You’re on the list.</h4><p className="mt-2 text-sm leading-7 text-[#477763]">Thank you for registering. We’ll contact you with event details and updates.</p><button type="button" onClick={onClose} className="mt-6 bg-[#073b2b] px-5 py-3 text-sm font-bold text-white">Close</button></div>
        ) : (
          <form onSubmit={submit} className="grid gap-4 p-6 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#477763]">Full name<input required value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full border border-[#0f6848]/20 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#f26518]" placeholder="Your name" /></label>
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#477763]">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full border border-[#0f6848]/20 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#f26518]" placeholder="you@example.com" /></label>
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#477763]">Phone <span className="font-normal normal-case tracking-normal">(optional)</span><input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 w-full border border-[#0f6848]/20 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#f26518]" placeholder="+233 ..." /></label>
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#477763]">Guests<input required min={1} max={20} type="number" value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="mt-2 w-full border border-[#0f6848]/20 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#f26518]" /></label>
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-[#477763] sm:col-span-2">Message <span className="font-normal normal-case tracking-normal">(optional)</span><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="mt-2 w-full border border-[#0f6848]/20 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#f26518]" placeholder="Anything we should know?" /></label>
            <div className="flex items-center justify-between gap-4 border-t border-[#0f6848]/10 pt-4 sm:col-span-2"><p className="text-xs leading-5 text-[#477763]">We’ll only use these details to coordinate this event.</p><button disabled={submitting} type="submit" className="bg-[#f26518] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{submitting ? "Sending…" : "Confirm RSVP"}</button></div>
          </form>
        )}
      </div>
    </div>
  );
}

function About({ c }: { c: C }) {
  return (
    <section id="about" className="section-y bg-[#fbfff8]">
      <div className="container-wide grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-24">
        <div className="relative">
          <div className="absolute -left-5 -top-5 size-24 rounded-full border border-[#ff8a3d]/50" />
          <div className="relative aspect-[0.95] overflow-hidden rounded-[1.35rem] sm:aspect-[1.05]">
            <img src={childrenUnity} alt="A young girl smiling with a community volunteer" className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="absolute -bottom-6 -right-3 max-w-[15rem] rounded-2xl bg-white p-5 shadow-[0_22px_50px_-25px_rgba(15,104,72,0.4)] sm:-right-7">
            <div className="flex items-center gap-2 text-[#0f6848]"><span className="grid size-8 place-items-center rounded-full bg-[#f1fae9]"><Leaf className="size-4" /></span><span className="text-[0.62rem] font-bold uppercase tracking-[0.16em]">Since 2015</span></div>
            <p className="mt-3 text-sm leading-5 text-[#477763]">Walking alongside families for the long term.</p>
          </div>
        </div>
        <div className="max-w-2xl">
          <div className="mb-5 flex items-center gap-3 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#f26518]"><span className="size-2 rounded-full bg-[#ff8a3d]" /> {pv(c, "about.eyebrow", "About Elle's Foundation")}</div>
          <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#0f6848] md:text-6xl">{pv(c, "about.title", "A community-focused nonprofit built on compassion.")}</h2>
          <p className="mt-7 max-w-xl text-base leading-8 text-[#477763] md:text-lg">{pv(c, "about.description", "Elle's Foundation is dedicated to improving lives through education, health, and community development. We walk alongside the families we serve — with humility, integrity, and long-term commitment to real change.")}</p>
          <div className="mt-8 grid max-w-xl grid-cols-2 gap-5 border-y border-[#0f6848]/15 py-7 sm:grid-cols-4 sm:gap-4">
            {[["12,400+", "Children supported"], ["82", "Projects completed"], ["98%", "To direct programs"], ["148K", "Meals served"]].map(([number, label]) => <div key={label}><div className="font-display text-2xl font-semibold text-[#0f6848] md:text-3xl">{number}</div><div className="mt-1 text-[0.59rem] font-bold uppercase tracking-[0.12em] text-[#477763]">{label}</div></div>)}
          </div>
          <Link to="/about" className="group mt-8 inline-flex items-center gap-3 text-sm font-bold text-[#0f6848] transition hover:text-[#f26518]">Learn more about our story <span className="grid size-8 place-items-center rounded-full border border-[#0f6848]/20 transition group-hover:border-[#f26518] group-hover:bg-[#f1fae9]"><ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span></Link>
        </div>
      </div>
    </section>
  );
}

function Opportunity() {
  const points = [
    ["01", "A chance to learn", "Education should open doors, not depend on where a child is born."],
    ["02", "A safe place to grow", "Families deserve support that protects dignity today and builds confidence for tomorrow."],
    ["03", "A community to belong to", "Lasting change is built together, through trust, practical action, and shared hope."],
  ];

  return (
    <section className="section-y bg-[#073b2b] text-white">
      <div className="container-wide">
        <div className="mb-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div><div className="mb-5 flex items-center gap-3 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#cdeca7]"><span className="size-2 rounded-full bg-[#ff8a3d]" /> The opportunity</div><h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-6xl">What becomes possible when people have a place to begin?</h2></div>
          <p className="max-w-xl text-base leading-8 text-white/70 md:justify-self-end md:text-lg">We start by making room for the real barriers people face—and the practical possibilities that open when they are supported.</p>
        </div>
        <div className="grid border-t border-white/15 md:grid-cols-3">
          {points.map(([number, title, text]) => <div key={number} className="border-b border-white/15 py-7 md:border-b-0 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0 md:last:pr-0"><div className="font-display text-4xl text-[#ff8a3d]">{number}</div><h3 className="mt-6 font-display text-2xl font-semibold">{title}</h3><p className="mt-3 max-w-xs text-sm leading-6 text-white/65">{text}</p></div>)}
        </div>
      </div>
    </section>
  );
}

function Programs() {
  const programs = [
    { icon: GraduationCap, number: "01", title: "Education", label: "Learning · Confidence · Opportunity", text: "Building brighter futures through learning, scholarships, and safe spaces to grow.", image: programEducation },
    { icon: HeartPulse, number: "02", title: "Health", label: "Care · Prevention · Wellbeing", text: "Promoting wellbeing with clinics, checkups, clean water, and health education.", image: programHealth },
    { icon: HomeIcon, number: "03", title: "Shelter & support", label: "Safety · Dignity · Stability", text: "Offering practical shelter and support to families facing uncertainty.", image: programShelter },
    { icon: Users, number: "04", title: "Community development", label: "Connection · Skills · Growth", text: "Creating opportunities that restore dignity and inspire shared growth.", image: programCommunity },
  ];

  return (
    <section className="section-y bg-[#fbfff8]">
      <div className="container-wide">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div className="max-w-2xl"><div className="mb-5 flex items-center gap-3 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#f26518]"><span className="size-2 rounded-full bg-[#ff8a3d]" /> Our programs</div><h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#0f6848] md:text-6xl">Practical support. Lasting change.</h2></div><Link to="/programs" className="group inline-flex items-center gap-3 text-sm font-bold text-[#0f6848] hover:text-[#f26518]">Explore all programs <span className="grid size-9 place-items-center rounded-full border border-[#0f6848]/20 transition group-hover:border-[#f26518] group-hover:bg-[#f1fae9]"><ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span></Link></div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {programs.map(({ icon: Icon, number, title, label, text, image }) => <Link key={title} to="/programs" className="group block overflow-hidden rounded-[1.2rem] border border-[#0f6848]/10 bg-white shadow-[0_18px_45px_-35px_rgba(15,104,72,0.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_50px_-30px_rgba(15,104,72,0.4)]"><div className="relative aspect-[1.12] overflow-hidden bg-[#cdeca7]"><img src={image} alt={title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" /><div className="absolute inset-x-4 top-4 flex items-start justify-between"><span className="rounded-full bg-white/90 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#0f6848]">{number}</span><span className="grid size-9 place-items-center rounded-full bg-[#ff8a3d] text-[#073b2b] opacity-0 transition group-hover:opacity-100"><ArrowUpRight className="size-4" /></span></div></div><div className="p-6"><div className="flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.13em] text-[#f26518]"><Icon className="size-4" /> {label}</div><h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-[#0f6848]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#477763]">{text}</p><div className="mt-5 flex items-center gap-2 text-sm font-bold text-[#0f6848]">Learn more <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" /></div></div></Link>)}
        </div>
      </div>
    </section>
  );
}

function FieldStories({ c }: { c: C }) {
  const stories = [
    { image: story1, tag: "Education", title: "Amina found her voice through school.", text: "From a village without a classroom to the top of her class — one scholarship changed everything." },
    { image: story2, tag: "Family", title: "A home rebuilt, a mother renewed.", text: "Grace and her son moved into permanent shelter after two years of uncertainty." },
    { image: story3, tag: "Youth", title: "Two brothers, one graduation day.", text: "Kwame and Kojo are the first in their family to finish secondary school." },
  ];

  return (
    <section className="section-y bg-[#f1fae9]">
      <div className="container-wide">
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div className="max-w-2xl"><div className="mb-5 flex items-center gap-3 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#f26518]"><span className="size-2 rounded-full bg-[#ff8a3d]" /> Stories from the field</div><h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#0f6848] md:text-6xl">{pv(c, "stories.title", "Real people. Real change.")}</h2></div><Link to="/programs" className="group inline-flex items-center gap-3 text-sm font-bold text-[#0f6848] hover:text-[#f26518]">Read all stories <span className="grid size-9 place-items-center rounded-full border border-[#0f6848]/20 transition group-hover:border-[#f26518] group-hover:bg-white"><ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span></Link></div>
        <div className="grid gap-6 md:grid-cols-3">
          {stories.map(({ image, tag, title, text }, index) => <article key={title} className={`group ${index === 1 ? "md:translate-y-10" : ""}`}><div className="relative aspect-[0.88] overflow-hidden rounded-[1.2rem] bg-[#cdeca7]"><img src={image} alt={title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" /><div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-xl bg-white/90 px-4 py-3 backdrop-blur-md"><span className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#f26518]">{tag}</span><ArrowUpRight className="size-4 text-[#0f6848]" /></div></div><div className="mt-6 max-w-sm"><div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#f26518]">{tag}</div><h3 className="font-display text-2xl font-semibold leading-tight text-[#0f6848]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#477763]">{text}</p></div></article>)}
        </div>
      </div>
    </section>
  );
}

function Mission({ c }: { c: C }) {
  const checks = ["Meals and clean water", "Support for children", "Community connection", "Long-term partnership"];

  return (
    <section className="section-y bg-[#fbfff8]">
      <div className="container-wide grid items-center gap-10 overflow-hidden rounded-[1.5rem] bg-[#f6dfc9] p-6 md:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
        <div className="relative order-2 lg:order-1"><div className="absolute -left-5 -top-5 size-20 rounded-full border border-[#f26518]/40" /><div className="relative aspect-[1.12] overflow-hidden rounded-[1.15rem]"><img src={volunteer} alt="Elle's Foundation volunteers serving a community meal" className="h-full w-full object-cover" loading="lazy" /></div><div className="absolute -bottom-5 -right-3 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-[0_18px_36px_-20px_rgba(15,104,72,0.5)] sm:-right-5"><div className="grid size-9 place-items-center rounded-full bg-[#f1fae9] text-[#0f6848]"><HandHeart className="size-4" /></div><div><div className="font-display text-xl text-[#0f6848]">620</div><div className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#477763]">Active volunteers</div></div></div></div>
        <div className="order-1 max-w-xl lg:order-2 lg:pl-8"><div className="mb-5 flex items-center gap-3 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#f26518]"><span className="size-2 rounded-full bg-[#ff8a3d]" /> {pv(c, "ofts.eyebrow", "Operation Feed the Street")}</div><h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#0f6848] md:text-6xl">Small acts. Shared table. <span className="text-[#f26518]">Lasting dignity.</span></h2><p className="mt-6 text-base leading-8 text-[#477763] md:text-lg">{pv(c, "ofts.point_1_text", "Elle's Foundation is committed to providing meals, clean water, and building connections with individuals experiencing hunger and homelessness.")}</p><div className="mt-7 grid gap-3 sm:grid-cols-2">{checks.map((item) => <div key={item} className="flex items-center gap-2 text-sm font-semibold text-[#0f6848]"><span className="grid size-5 place-items-center rounded-full bg-[#0f6848] text-white"><Check className="size-3" /></span>{item}</div>)}</div><div className="mt-8 flex flex-wrap gap-3"><Link to="/donate" className="inline-flex items-center gap-2 rounded-full bg-[#0f6848] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#084b35] active:scale-[0.97]"><Heart className="size-4 fill-current text-[#ff8a3d]" /> Support us</Link><Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-[#0f6848]/20 px-6 py-3 text-sm font-bold text-[#0f6848] transition hover:bg-white">Join the work <ArrowRight className="size-4" /></Link></div></div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    ["Volunteering with Elle's Foundation was the most meaningful year of my life. Their team meets people with real dignity.", "Amelia O.", "Volunteer, Ghana"],
    ["The scholarship program changed my daughter's future. She now dreams of becoming a nurse.", "Fatou D.", "Parent, Senegal"],
    ["A partner that keeps its word. Elle's Foundation delivers where it matters — on the ground, with the people.", "David M.", "Corporate partner"],
  ];

  return (
    <section className="section-y bg-[#073b2b] text-white">
      <div className="container-wide"><div className="mb-12 flex items-end justify-between gap-6"><div className="max-w-2xl"><div className="mb-5 flex items-center gap-3 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#cdeca7]"><span className="size-2 rounded-full bg-[#ff8a3d]" /> Voices</div><h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-6xl">Trusted by those we serve and serve with.</h2></div><Quote className="hidden size-16 text-white/10 md:block" /></div><div className="grid gap-5 md:grid-cols-3">{quotes.map(([quote, name, role]) => <blockquote key={name} className="rounded-[1.15rem] border border-white/10 bg-white/[0.07] p-7 transition hover:-translate-y-1 hover:bg-white/10 md:p-8"><div className="flex gap-1 text-[#ff8a3d]">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className="size-3.5 fill-current" />)}</div><p className="mt-6 font-display text-xl leading-[1.2] text-white/95">“{quote}”</p><footer className="mt-8 border-t border-white/10 pt-4"><div className="text-sm font-semibold">{name}</div><div className="mt-1 text-xs uppercase tracking-[0.15em] text-white/55">{role}</div></footer></blockquote>)}</div></div>
    </section>
  );
}

function CTA({ c }: { c: C }) {
  return (
    <section className="section-y-sm bg-[#fbfff8]">
      <div className="container-wide"><div className="relative overflow-hidden rounded-[1.5rem] bg-[#ff8a3d] px-7 py-12 text-[#073b2b] md:px-14 md:py-16"><div className="absolute -right-24 -top-32 size-96 rounded-full border border-[#073b2b]/15" /><div className="absolute -right-5 -top-12 size-64 rounded-full border border-[#073b2b]/15" /><div className="relative grid items-end gap-10 lg:grid-cols-[1.2fr_0.8fr]"><div className="max-w-2xl"><div className="mb-5 flex items-center gap-3 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[#084b35]"><span className="size-2 rounded-full bg-[#cdeca7]" /> Get involved</div><h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-6xl">{pv(c, "cta.title", "Be the reason someone's life changes.")}</h2><p className="mt-5 max-w-xl text-base leading-7 text-[#084b35]/75 md:text-lg">{pv(c, "cta.description", "Volunteer. Donate. Partner with us. Together, we can make a lasting difference.")}</p></div><div className="flex flex-wrap gap-3 lg:justify-end"><Link to="/donate" className="inline-flex items-center gap-2 rounded-full bg-[#073b2b] px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#084b35] active:scale-[0.97]"><Heart className="size-4 fill-current text-[#ff8a3d]" /> Support us</Link><Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-[#073b2b]/25 bg-white/25 px-6 py-3.5 text-sm font-bold text-[#073b2b] transition hover:bg-white/45">Volunteer</Link></div></div></div></div>
    </section>
  );
}

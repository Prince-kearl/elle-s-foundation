import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { publicImageValue, pv, usePageContent } from "@/lib/page-content";
import { useSiteCopy } from "@/lib/cms";
import {
  usePublicEvents,
  usePublicPrograms,
  usePublicStats,
  usePublicStories,
  usePublicTestimonials,
  type EventRecord,
  type Program,
  type Stat,
  type Story,
  type Testimonial,
} from "@/lib/cms";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { richTextForDisplay } from "@/components/admin/RichTextEditor";
import heroChildren from "@/assets/community/live/hero-community-water.svg";
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
  accent: string;
};

function Home() {
  const { data: c } = usePageContent("home");
  const { data: heroCopy } = useSiteCopy("hero");
  const { data: stats } = usePublicStats();
  const { data: programs } = usePublicPrograms();
  const { data: stories } = usePublicStories();
  const { data: testimonials } = usePublicTestimonials();

  const heroContent: C = {
    ...c,
    "hero.eyebrow": heroCopy?.eyebrow ?? c?.["hero.eyebrow"] ?? "",
    "hero.title_line_1": heroCopy?.title_line_1 ?? "",
    "hero.title_line_2": heroCopy?.title_line_2 ?? "",
    "hero.description": heroCopy?.description ?? c?.["hero.description"] ?? "",
    "hero.cta_primary_label": heroCopy?.cta_primary_label ?? "",
    "hero.cta_secondary_label": heroCopy?.cta_secondary_label ?? "",
    "hero.trust_line": heroCopy?.trust_line ?? "",
  };

  return (
    <SiteLayout>
      <Hero c={heroContent} />
      <ImpactStrip records={stats} />
      <UpcomingEvents />
      <PastEvent c={c} />
      <About c={c} stats={stats} />
      <Opportunity />
      <Programs records={programs} c={c} />
      <FieldStories c={c} records={stories} />
      <Mission c={c} stats={stats} />
      <Testimonials records={testimonials} />
      <CTA c={c} />
    </SiteLayout>
  );
}

function Hero({ c }: { c: C }) {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-5rem)] items-end overflow-hidden bg-[var(--forest)] text-white">
      <img
        src={pv(c, "hero.image", heroChildren)}
        alt={pv(
          c,
          "hero.image_alt",
          "Elle's Foundation volunteers and children celebrating a community outreach moment",
        )}
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[64%_center] sm:object-[64%_center] md:object-center"
        loading="eager"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,48,34,0.94)_0%,rgba(4,48,34,0.74)_40%,rgba(4,48,34,0.18)_78%,rgba(4,48,34,0.35)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(4,48,34,0.84)_0%,transparent_50%)]" />

      <div className="container-wide relative flex w-full flex-col items-center justify-between pb-8 pt-16 sm:pb-10 md:min-h-[calc(100svh-5rem)] md:items-start md:pt-28">
        <div className="rise-in w-full max-w-4xl text-center md:text-left">
          <div className="mb-7 flex items-center justify-center gap-3 text-[0.66rem] font-bold uppercase tracking-[0.24em] text-[var(--sand)] md:justify-start">
            <span className="size-2 rounded-full bg-[var(--gold)]" />
            <span>{pv(c, "hero.eyebrow", "Elle's Foundation · Est. 2015")}</span>
          </div>
          <h1 className="max-w-4xl font-display text-[3.3rem] font-semibold leading-[0.94] tracking-[-0.065em] text-white sm:text-[5.5rem] md:text-[7.1rem] lg:text-[8.5rem]">
            {pv(c, "hero.title_line_1", "Feeding hope.")}
            <br />
            <span className="text-[var(--gold)]">
              {pv(c, "hero.title_line_2", "Restoring lives.")}
            </span>
          </h1>
          <div className="rich-text prose prose-lg mx-auto mt-7 max-w-xl text-base leading-7 text-white/80 md:mx-0 md:text-lg md:leading-8 [&_a]:underline [&_strong]:font-bold [&_em]:italic" dangerouslySetInnerHTML={{ __html: richTextForDisplay(pv(c, "hero.description", "We believe every child deserves a chance, every family deserves support, and every community deserves the opportunity to thrive with dignity and hope.")) }} />
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 md:justify-start">
            <a
              href={pv(c, "hero.cta_primary_href", "/donate")}
              className="hero-pill group inline-flex items-center gap-3 rounded-full bg-[var(--gold)] px-5 py-3.5 text-sm font-bold text-[var(--forest)] transition duration-200 hover:-translate-y-0.5 hover:bg-white active:scale-[0.97]"
            >
              <span className="grid size-7 place-items-center rounded-full bg-[var(--forest)] text-[var(--gold)]">
                <Heart className="size-3.5 fill-current" />
              </span>
              {pv(c, "hero.cta_primary_label", pv(c, "hero.cta_primary", "Support us"))}
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href={pv(c, "hero.cta_secondary_href", "/about")}
              className="hero-pill group inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-white/70 hover:bg-white/15 active:scale-[0.97]"
            >
              {pv(c, "hero.cta_secondary_label", "Our story")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        <div className="mt-16 flex flex-col justify-between gap-6 border-t border-white/20 pt-5 text-xs text-white/70 md:flex-row md:items-end">
          <a
            href="#about"
            className="group inline-flex items-center gap-3 font-bold uppercase tracking-[0.2em] text-[var(--sand)]"
          >
            <span className="grid size-9 place-items-center rounded-full border border-[var(--sand)]/50 transition group-hover:bg-[var(--sand)] group-hover:text-[var(--forest)]">
              <ArrowDown className="size-4" />
            </span>
            Discover more
          </a>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[
                pv(c, "about.image", childrenUnity),
                pv(c, "stories.image_1", story1),
                pv(c, "stories.image_3", story3),
              ].map((image, index) => (
                <img
                  key={image}
                  src={image}
                  alt=""
                  className="size-8 rounded-full border-2 border-[var(--forest)] object-cover"
                  style={{ zIndex: 3 - index }}
                />
              ))}
            </div>
            <span>
              {pv(
                c,
                "hero.trust_line",
                pv(c, "hero.trust_text", "Trusted by 3,200+ families across Ghana and beyond."),
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImpactStrip({ records }: { records?: Stat[] }) {
  const tones = ["var(--gold)", "#0f9d73", "var(--earth)", "#1b86b8"];
  const icons = [Users, HandHeart, HeartPulse, Check];
  const stats = (records ?? []).map((record, index) => ({
    value: record.value,
    label: record.label,
    Icon: icons[index % icons.length],
    tone: tones[index % tones.length],
  }));

  return (
    <section className="border-b border-[var(--primary)]/10 bg-[var(--cream)] py-8 md:py-10">
      <div className="container-wide">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
            Impact snapshot
          </div>
          <div className="inline-flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
            <span className="size-2 bg-[#0f9d73]" /> Live programme totals
          </div>
        </div>
        {stats.length ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ value, label, Icon, tone }) => (
            <div
              key={label}
              className="soft-card border-t-4 bg-white p-5"
              style={{ borderTopColor: tone }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-display text-3xl font-semibold leading-none text-[var(--forest)] md:text-4xl">
                    {value}
                  </div>
                  <div className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                    {label}
                  </div>
                </div>
                <span
                  className="grid size-9 place-items-center"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${tone} 10%, transparent)`,
                    color: tone,
                  }}
                >
                  <Icon className="size-4" />
                </span>
              </div>
            </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-[var(--primary)]/20 bg-white/70 px-5 py-8 text-sm text-[var(--muted-foreground)]">
            Impact metrics will appear here once they are published in the foundation CMS.
          </div>
        )}
      </div>
    </section>
  );
}

function UpcomingEvents() {
  const { data: liveEvents } = usePublicEvents();
  const [selectedEvent, setSelectedEvent] = useState<HomepageEvent | null>(null);
  const events: HomepageEvent[] = (liveEvents ?? []).map((event: EventRecord) => {
        const date = new Date(`${event.event_date}T00:00:00`);
        return {
          id: event.id,
          day: date.toLocaleDateString("en-GH", { day: "2-digit" }),
          month: date.toLocaleDateString("en-GH", { month: "short" }).toUpperCase(),
          type: event.event_type,
          title: event.title,
          meta: `${event.location} · ${date.toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}`,
          detail: event.description,
          accent: event.accent,
        };
      });
  const calendarDate = liveEvents?.[0]
    ? new Date(`${liveEvents[0].event_date}T00:00:00`)
    : new Date();
  const monthLabel = calendarDate.toLocaleDateString("en-GH", { month: "long", year: "numeric" });
  const daysInMonth = new Date(
    calendarDate.getFullYear(),
    calendarDate.getMonth() + 1,
    0,
  ).getDate();
  const leadingDays = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
  const calendarDays = [
    ...Array.from({ length: leadingDays }, () => ""),
    ...Array.from({ length: daysInMonth }, (_, index) => String(index + 1)),
  ];
  const highlightedDay = events[0]?.day;

  return (
    <section id="events" className="border-y border-[var(--primary)]/10 bg-[#f5f3ea] py-12 md:py-16">
      <div className="container-wide">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[var(--earth)]">
              <span className="size-2 bg-[var(--gold)]" /> Community calendar
            </div>
            <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[var(--forest)] md:text-6xl">
              Show up for what matters.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-7 text-[var(--muted-foreground)] md:text-right">
            Join the days that bring neighbours together. Dates and details are updated as each
            programme is confirmed.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.3fr_1fr]">
          <div className="soft-card bg-[var(--forest)] p-5 text-white">
            <div className="flex items-start justify-between gap-3 border-b border-white/15 pb-5">
              <div>
                <div className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--sand)]">
                  Upcoming
                </div>
                <div className="mt-2 font-display text-2xl">{monthLabel}</div>
              </div>
              <CalendarDays className="size-5 text-[var(--gold)]" />
            </div>
            <div className="mt-5 grid grid-cols-7 gap-y-3 text-center text-[0.62rem]">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <span key={`${day}-${index}`} className="font-bold text-white/45">
                  {day}
                </span>
              ))}
              {calendarDays.map((day, index) => (
                <span
                  key={`${day}-${index}`}
                  className={`mx-auto grid size-7 place-items-center ${day === highlightedDay ? "bg-[var(--gold)] font-bold text-[var(--forest)]" : "text-white/75"}`}
                >
                  {day}
                </span>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-2 border-t border-white/15 pt-4 text-xs text-white/60">
              <span className="size-2 bg-[var(--gold)]" /> {events[0]?.day} {events[0]?.month} ·{" "}
              {events[0]?.title}
            </div>
          </div>

          <div className="grid gap-3">
            {events.length ? events.map((event) => (
              <article
                key={event.id}
                className="soft-card group grid gap-5 border-l-4 bg-white p-5 transition hover:-translate-y-0.5 sm:grid-cols-[5rem_1fr_auto] sm:items-center"
                style={{ borderLeftColor: event.accent }}
              >
                <div className="grid size-16 place-items-center border border-[var(--primary)]/15 bg-[var(--background)] text-center">
                  <div>
                    <div className="font-display text-2xl font-semibold leading-none text-[var(--forest)]">
                      {event.day}
                    </div>
                    <div className="mt-1 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[var(--earth)]">
                      {event.month}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                    <span className="size-2" style={{ backgroundColor: event.accent }} />{" "}
                    {event.type}
                  </div>
                  <h3 className="mt-2 font-display text-2xl font-semibold leading-tight text-[var(--forest)]">
                    {event.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-[var(--muted-foreground)]">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" /> {event.meta}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-3.5" /> Community-led
                    </span>
                  </div>
                  <div className="rich-text prose prose-sm mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)] [&_a]:underline [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: richTextForDisplay(event.detail) }} />
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-[var(--primary)]/10 pt-4 sm:block sm:border-t-0 sm:pt-0 sm:text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(event)}
                    className="group/link mt-0 inline-flex items-center gap-2 border border-[var(--primary)]/20 bg-[var(--gold)] px-4 py-2.5 text-sm font-bold text-[var(--forest)] shadow-sm transition hover:border-[var(--forest)] hover:bg-[var(--forest)] hover:text-white sm:mt-3"
                  >
                    RSVP now{" "}
                    <ArrowUpRight className="size-4 transition-transform group-hover/link:translate-x-0.5" />
                  </button>
                </div>
              </article>
            )) : (
              <div className="border border-dashed border-[var(--primary)]/20 bg-white/70 px-5 py-8 text-sm text-[var(--muted-foreground)]">
                Upcoming events will appear here once they are published in the foundation CMS.
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedEvent && <RsvpModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </section>
  );
}

function PastEvent({ c }: { c: C }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = imageFailed
    ? operationFeedTheStreet
    : publicImageValue(c, "past_event.image", operationFeedTheStreet);
  return (
    <section className="border-b border-[var(--primary)]/10 bg-[var(--forest)] py-12 text-white md:py-16">
      <div className="container-wide grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
        <div className="relative overflow-hidden border border-[var(--sand)]/20 bg-[var(--primary)]">
          <img
            src={image}
            alt={pv(
              c,
              "past_event.image_alt",
              "Elle's Foundation volunteers and children celebrating a community outreach moment",
            )}
            onError={() => setImageFailed(true)}
            className="mx-auto h-full max-h-[34rem] min-h-[20rem] w-full object-cover object-[64%_center]"
            loading="lazy"
          />
        </div>
        <div className="max-w-2xl">
          <div className="mb-4 flex items-center gap-3 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[var(--sand)]">
            <span className="size-2 bg-[var(--gold)]" /> Field archive · 08 June 2025
          </div>
          <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-white md:text-6xl">
            Operation Feed the Street.
          </h2>
          <p className="mt-6 text-base leading-8 text-white/70 md:text-lg">
            A past community action centred on meals, clean water, and restoring dignity for people
            experiencing hunger and homelessness.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              ["01", "Feed", "Meals and clean water"],
              ["02", "Connect", "Community-led support"],
              ["03", "Restore", "Dignity through action"],
            ].map(([number, label, detail]) => (
              <div key={number} className="border-t border-[var(--sand)]/25 pt-3">
                <div className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-[var(--gold)]">
                  {number}
                </div>
                <div className="mt-2 font-display text-xl text-white">{label}</div>
                <div className="mt-1 text-xs leading-5 text-white/60">{detail}</div>
              </div>
            ))}
          </div>
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
    const rsvpId = crypto.randomUUID();
    const { error } = await supabase.from("event_rsvps").insert({
      id: rsvpId,
      event_id: event.id,
      name,
      email,
      phone: phone || null,
      guests,
      note: note || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    // Email delivery is deliberately non-blocking: the RSVP is already saved,
    // while the Edge Function records and attempts the confirmation separately.
    void supabase.functions.invoke("send-rsvp-confirmation", {
      body: { rsvp_id: rsvpId },
    });
    setSubmitted(true);
    toast.success("Your RSVP has been received. A confirmation email is on its way.");
  }

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-[var(--forest)]/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rsvp-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl border border-[var(--primary)]/20 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[var(--primary)]/10 p-6">
          <div>
            <div className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--earth)]">
              Community RSVP
            </div>
            <h3 id="rsvp-title" className="mt-2 font-display text-3xl font-semibold text-[var(--forest)]">
              {event.title}
            </h3>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{event.meta}</p>
          </div>
          <button
            type="button"
            aria-label="Close RSVP form"
            onClick={onClose}
            className="border border-[var(--primary)]/15 px-3 py-2 text-sm font-bold text-[var(--forest)] hover:bg-[var(--cream)]"
          >
            Esc
          </button>
        </div>
        {submitted ? (
          <div className="p-8">
            <div className="grid size-12 place-items-center bg-[#0f9d73] text-white">
              <Check className="size-6" />
            </div>
            <h4 className="mt-5 font-display text-2xl text-[var(--forest)]">You’re on the list.</h4>
            <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
              Thank you for registering. We’ll contact you with event details and updates.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 bg-[var(--forest)] px-5 py-3 text-sm font-bold text-white"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-4 p-6 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              Full name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full border border-[var(--primary)]/20 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[var(--earth)]"
                placeholder="Your name"
              />
            </label>
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full border border-[var(--primary)]/20 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[var(--earth)]"
                placeholder="you@example.com"
              />
            </label>
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              Phone <span className="font-normal normal-case tracking-normal">(optional)</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full border border-[var(--primary)]/20 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[var(--earth)]"
                placeholder="+233 ..."
              />
            </label>
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              Guests
              <input
                required
                min={1}
                max={20}
                type="number"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="mt-2 w-full border border-[var(--primary)]/20 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[var(--earth)]"
              />
            </label>
            <label className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)] sm:col-span-2">
              Message <span className="font-normal normal-case tracking-normal">(optional)</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="mt-2 w-full border border-[var(--primary)]/20 px-3 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-[var(--earth)]"
                placeholder="Anything we should know?"
              />
            </label>
            <div className="flex items-center justify-between gap-4 border-t border-[var(--primary)]/10 pt-4 sm:col-span-2">
              <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                We’ll only use these details to coordinate this event.
              </p>
              <button
                disabled={submitting}
                type="submit"
                className="bg-[var(--earth)] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Confirm RSVP"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function About({ c, stats }: { c: C; stats?: Stat[] }) {
  const impactStats = (stats ?? []).slice(0, 4);

  return (
    <section id="about" className="section-y bg-[var(--background)]">
      <div className="container-wide grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-24">
        <div className="relative">
          <div className="absolute -left-5 -top-5 size-24 rounded-full border border-[var(--gold)]/50" />
          <div className="relative aspect-[0.95] overflow-hidden rounded-[1.35rem] sm:aspect-[1.05]">
            <img
              src={pv(c, "about.image", childrenUnity)}
              alt={pv(c, "about.image_alt", "A young girl smiling with a community volunteer")}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="absolute -bottom-6 -right-3 max-w-[15rem] rounded-2xl bg-white p-5 shadow-[0_22px_50px_-25px_rgba(15,104,72,0.4)] sm:-right-7">
            <div className="flex items-center gap-2 text-[var(--primary)]">
              <span className="grid size-8 place-items-center rounded-full bg-[var(--cream)]">
                <Leaf className="size-4" />
              </span>
              <span className="text-[0.62rem] font-bold uppercase tracking-[0.16em]">
                Since 2015
              </span>
            </div>
            <p className="mt-3 text-sm leading-5 text-[var(--muted-foreground)]">
              Walking alongside families for the long term.
            </p>
          </div>
        </div>
        <div className="max-w-2xl">
          <div className="mb-5 flex items-center gap-3 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[var(--earth)]">
            <span className="size-2 rounded-full bg-[var(--gold)]" />{" "}
            {pv(c, "about.eyebrow", "About Elle's Foundation")}
          </div>
          <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[var(--primary)] md:text-6xl">
            {pv(c, "about.title", "A community-focused nonprofit built on compassion.")}
          </h2>
          <p className="mt-7 max-w-xl text-base leading-8 text-[var(--muted-foreground)] md:text-lg">
            {pv(
              c,
              "about.description",
              "Elle's Foundation is dedicated to improving lives through education, health, and community development. We walk alongside the families we serve — with humility, integrity, and long-term commitment to real change.",
            )}
          </p>
          <div className="mt-8 grid max-w-xl grid-cols-2 gap-5 border-y border-[var(--primary)]/15 py-7 sm:grid-cols-4 sm:gap-4">
            {impactStats.map(({ value, label }) => (
              <div key={label}>
                <div className="font-display text-2xl font-semibold text-[var(--primary)] md:text-3xl">
                  {value}
                </div>
                <div className="mt-1 text-[0.59rem] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                  {label}
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/about"
            className="group mt-8 inline-flex items-center gap-3 text-sm font-bold text-[var(--primary)] transition hover:text-[var(--earth)]"
          >
            Learn more about our story{" "}
            <span className="grid size-8 place-items-center rounded-full border border-[var(--primary)]/20 transition group-hover:border-[var(--earth)] group-hover:bg-[var(--cream)]">
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Opportunity() {
  const points = [
    [
      "01",
      "A chance to learn",
      "Education should open doors, not depend on where a child is born.",
    ],
    [
      "02",
      "A safe place to grow",
      "Families deserve support that protects dignity today and builds confidence for tomorrow.",
    ],
    [
      "03",
      "A community to belong to",
      "Lasting change is built together, through trust, practical action, and shared hope.",
    ],
  ];

  return (
    <section className="section-y bg-[var(--forest)] text-white">
      <div className="container-wide">
        <div className="mb-14 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <div className="mb-5 flex items-center gap-3 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[var(--sand)]">
              <span className="size-2 rounded-full bg-[var(--gold)]" /> The opportunity
            </div>
            <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-6xl">
              What becomes possible when people have a place to begin?
            </h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-white/70 md:justify-self-end md:text-lg">
            We start by making room for the real barriers people face—and the practical
            possibilities that open when they are supported.
          </p>
        </div>
        <div className="grid border-t border-white/15 md:grid-cols-3">
          {points.map(([number, title, text]) => (
            <div
              key={number}
              className="border-b border-white/15 py-7 md:border-b-0 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
            >
              <div className="font-display text-4xl text-[var(--gold)]">{number}</div>
              <h3 className="mt-6 font-display text-2xl font-semibold">{title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-6 text-white/65">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Programs({ records, c }: { records?: Program[]; c: C }) {
  const iconMap: Record<string, typeof GraduationCap> = {
    GraduationCap,
    HeartPulse,
    Home: HomeIcon,
    Users,
  };
  const images = [
    pv(c, "programs.image_1", programEducation),
    pv(c, "programs.image_2", programHealth),
    pv(c, "programs.image_3", programShelter),
    pv(c, "programs.image_4", programCommunity),
  ];
  const programs = (records ?? []).map((record, index) => ({
        icon: iconMap[record.icon] ?? GraduationCap,
        number: String(index + 1).padStart(2, "0"),
        title: record.title,
        label: "Community support",
        text: record.description,
        image: record.image_url || images[index % images.length],
      }));

  return (
    <section className="section-y bg-[var(--background)]">
      <div className="container-wide">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[var(--earth)]">
              <span className="size-2 rounded-full bg-[var(--gold)]" /> Our programs
            </div>
            <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[var(--primary)] md:text-6xl">
              Practical support. Lasting change.
            </h2>
          </div>
          <Link
            to="/programs"
            className="group inline-flex items-center gap-3 text-sm font-bold text-[var(--primary)] hover:text-[var(--earth)]"
          >
            Explore all programs{" "}
            <span className="grid size-9 place-items-center rounded-full border border-[var(--primary)]/20 transition group-hover:border-[var(--earth)] group-hover:bg-[var(--cream)]">
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
        {programs.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {programs.map(({ icon: Icon, number, title, label, text, image }) => (
            <Link
              key={title}
              to="/programs"
              className="group block overflow-hidden rounded-[1.2rem] border border-[var(--primary)]/10 bg-white shadow-[0_18px_45px_-35px_rgba(15,104,72,0.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_50px_-30px_rgba(15,104,72,0.4)]"
            >
              <div className="relative aspect-[1.12] overflow-hidden bg-[var(--sand)]">
                <img
                  src={image}
                  alt={title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-x-4 top-4 flex items-start justify-between">
                  <span className="rounded-full bg-white/90 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
                    {number}
                  </span>
                  <span className="grid size-9 place-items-center rounded-full bg-[var(--gold)] text-[var(--forest)] opacity-0 transition group-hover:opacity-100">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.13em] text-[var(--earth)]">
                  <Icon className="size-4" /> {label}
                </div>
                <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-[var(--primary)]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{text}</p>
                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-[var(--primary)]">
                  Learn more{" "}
                  <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-[var(--primary)]/20 bg-white px-5 py-8 text-sm text-[var(--muted-foreground)]">
            Programs will appear here once they are published in the foundation CMS.
          </div>
        )}
      </div>
    </section>
  );
}

function FieldStories({ c, records }: { c: C; records?: Story[] }) {
  const fallbackImages = [
    pv(c, "stories.image_1", story1),
    pv(c, "stories.image_2", story2),
    pv(c, "stories.image_3", story3),
  ];
  const stories = (records ?? []).map((record, index) => ({
        image: record.image_url || fallbackImages[index % fallbackImages.length],
        tag: record.tag || "Community",
        title: record.title,
        text: record.excerpt || "",
      }));

  return (
    <section className="section-y bg-[var(--cream)]">
      <div className="container-wide">
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[var(--earth)]">
              <span className="size-2 rounded-full bg-[var(--gold)]" /> Stories from the field
            </div>
            <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[var(--primary)] md:text-6xl">
              {pv(c, "stories.title", "Real people. Real change.")}
            </h2>
          </div>
          <Link
            to="/programs"
            className="group inline-flex items-center gap-3 text-sm font-bold text-[var(--primary)] hover:text-[var(--earth)]"
          >
            Read all stories{" "}
            <span className="grid size-9 place-items-center rounded-full border border-[var(--primary)]/20 transition group-hover:border-[var(--earth)] group-hover:bg-white">
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
        {stories.length ? (
          <div className="grid gap-6 md:grid-cols-3">
            {stories.map(({ image, tag, title, text }, index) => (
            <article key={title} className={`group ${index === 1 ? "md:translate-y-10" : ""}`}>
              <div className="relative aspect-[0.88] overflow-hidden rounded-[1.2rem] bg-[var(--sand)]">
                <img
                  src={image}
                  alt={title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-xl bg-white/90 px-4 py-3 backdrop-blur-md">
                  <span className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--earth)]">
                    {tag}
                  </span>
                  <ArrowUpRight className="size-4 text-[var(--primary)]" />
                </div>
              </div>
              <div className="mt-6 max-w-sm">
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--earth)]">
                  {tag}
                </div>
                <h3 className="font-display text-2xl font-semibold leading-tight text-[var(--primary)]">
                  {title}
                </h3>
                <div className="rich-text prose prose-sm mt-3 max-w-sm text-sm leading-6 text-[var(--muted-foreground)] [&_a]:underline [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: richTextForDisplay(text) }} />
              </div>
            </article>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-[var(--primary)]/20 bg-white/60 px-5 py-8 text-sm text-[var(--muted-foreground)]">
            Stories will appear here once they are published in the foundation CMS.
          </div>
        )}
      </div>
    </section>
  );
}

function Mission({ c, stats }: { c: C; stats?: Stat[] }) {
  const [imageFailed, setImageFailed] = useState(false);
  const volunteerStat = stats?.find((stat) => stat.label.toLowerCase().includes("volunteer"));
  const image = imageFailed ? volunteer : publicImageValue(c, "volunteer.image", volunteer);
  const checks = [
    "Meals and clean water",
    "Support for children",
    "Community connection",
    "Long-term partnership",
  ];

  return (
    <section className="section-y bg-[var(--background)]">
      <div className="container-wide grid items-center gap-10 overflow-hidden rounded-[1.5rem] bg-[#f6dfc9] p-6 md:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
        <div className="relative order-2 lg:order-1">
          <div className="absolute -left-5 -top-5 size-20 rounded-full border border-[var(--earth)]/40" />
          <div className="relative aspect-[1.12] overflow-hidden rounded-[1.15rem]">
            <img
              src={image}
              alt={pv(
                c,
                "volunteer.image_alt",
                "Elle's Foundation volunteers serving a community meal",
              )}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          {volunteerStat && (
            <div className="absolute -bottom-5 -right-3 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-[0_18px_36px_-20px_rgba(15,104,72,0.5)] sm:-right-5">
              <div className="grid size-9 place-items-center rounded-full bg-[var(--cream)] text-[var(--primary)]">
                <HandHeart className="size-4" />
              </div>
              <div>
                <div className="font-display text-xl text-[var(--primary)]">{volunteerStat.value}</div>
                <div className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                  {volunteerStat.label}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="order-1 max-w-xl lg:order-2 lg:pl-8">
          <div className="mb-5 flex items-center gap-3 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[var(--earth)]">
            <span className="size-2 rounded-full bg-[var(--gold)]" />{" "}
            {pv(c, "ofts.eyebrow", "Operation Feed the Street")}
          </div>
          <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-[var(--primary)] md:text-6xl">
            Small acts. Shared table. <span className="text-[var(--earth)]">Lasting dignity.</span>
          </h2>
          <p className="mt-6 text-base leading-8 text-[var(--muted-foreground)] md:text-lg">
            {pv(
              c,
              "ofts.point_1_text",
              "Elle's Foundation is committed to providing meals, clean water, and building connections with individuals experiencing hunger and homelessness.",
            )}
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {checks.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm font-semibold text-[var(--primary)]"
              >
                <span className="grid size-5 place-items-center rounded-full bg-[var(--primary)] text-white">
                  <Check className="size-3" />
                </span>
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[var(--forest)] active:scale-[0.97]"
            >
              <Heart className="size-4 fill-current text-[var(--gold)]" /> Support us
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 px-6 py-3 text-sm font-bold text-[var(--primary)] transition hover:bg-white"
            >
              Join the work <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials({ records }: { records?: Testimonial[] }) {
  const quotes = (records ?? []).map((record) => [record.quote, record.name, record.role || ""]);

  return (
    <section className="section-y bg-[var(--forest)] text-white">
      <div className="container-wide">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="mb-5 flex items-center gap-3 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[var(--sand)]">
              <span className="size-2 rounded-full bg-[var(--gold)]" /> Voices
            </div>
            <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-6xl">
              Trusted by those we serve and serve with.
            </h2>
          </div>
          <Quote className="hidden size-16 text-white/10 md:block" />
        </div>
        {quotes.length ? (
          <div className="grid gap-5 md:grid-cols-3">
            {quotes.map(([quote, name, role]) => (
            <blockquote
              key={name}
              className="rounded-[1.15rem] border border-white/10 bg-white/[0.07] p-7 transition hover:-translate-y-1 hover:bg-white/10 md:p-8"
            >
              <div className="flex gap-1 text-[var(--gold)]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-6 font-display text-xl leading-[1.2] text-white/95">“{quote}”</p>
              <footer className="mt-8 border-t border-white/10 pt-4">
                <div className="text-sm font-semibold">{name}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.15em] text-white/55">{role}</div>
              </footer>
            </blockquote>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-white/20 bg-white/[0.04] px-5 py-8 text-sm text-white/60">
            Testimonials will appear here once they are published in the foundation CMS.
          </div>
        )}
      </div>
    </section>
  );
}

function CTA({ c }: { c: C }) {
  return (
    <section className="section-y-sm bg-[var(--background)]">
      <div className="container-wide">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-[var(--gold)] px-7 py-12 text-[var(--forest)] md:px-14 md:py-16">
          <div className="absolute -right-24 -top-32 size-96 rounded-full border border-[var(--forest)]/15" />
          <div className="absolute -right-5 -top-12 size-64 rounded-full border border-[var(--forest)]/15" />
          <div className="relative grid items-end gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-3 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[var(--forest)]">
                <span className="size-2 rounded-full bg-[var(--sand)]" /> Get involved
              </div>
              <h2 className="font-display text-4xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-6xl">
                {pv(c, "cta.title", "Be the reason someone's life changes.")}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[var(--forest)]/75 md:text-lg">
                {pv(
                  c,
                  "cta.description",
                  "Volunteer. Donate. Partner with us. Together, we can make a lasting difference.",
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                to="/donate"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--forest)] px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[var(--forest)] active:scale-[0.97]"
              >
                <Heart className="size-4 fill-current text-[var(--gold)]" /> Support us
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--forest)]/25 bg-white/25 px-6 py-3.5 text-sm font-bold text-[var(--forest)] transition hover:bg-white/45"
              >
                Volunteer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SectionHeading } from "@/components/site/Section";
import { Media } from "@/components/site/Media";
import { usePageContent, pv } from "@/lib/page-content";
import { trackTeamProfileClick, usePublicTeam, usePublicTestimonials, type TeamMember } from "@/lib/cms";
import aboutHero from "@/assets/community/live/outreach-children.jpeg";
import { useState } from "react";
import { ArrowRight, Globe, Heart, Instagram, Linkedin, X } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Elle's Foundation" },
      {
        name: "description",
        content:
          "Our story, our people, and our commitment to feeding hope and restoring lives across communities.",
      },
      { property: "og:title", content: "About Elle's Foundation" },
      {
        property: "og:description",
        content:
          "A community-focused nonprofit built on compassion, integrity, service, and faith.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

const milestones = [
  ["2015", "Elle's Foundation is founded around a single community kitchen."],
  ["2017", "Opened our first learning center serving 120 children."],
  ["2019", "Launched mobile health outreach across 8 rural communities."],
  ["2022", "Reached 10,000 children supported across 6 countries."],
  ["2026", "82 completed projects — and just getting started."],
];

function About() {
  const { data: c } = usePageContent("about");
  const { data: liveTeam } = usePublicTeam();
  const { data: liveTestimonials } = usePublicTestimonials();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const people = liveTeam ?? [];
  const testimonials = liveTestimonials ?? [];
  return (
    <SiteLayout>
      <section className="pt-14 section-y-sm">
        <div className="container-wide grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="eyebrow">{pv(c, "hero.eyebrow", "About Us")}</span>
            <h1 className="font-display text-5xl md:text-6xl mt-5 leading-[1.02] text-primary">
              {pv(c, "hero.title", "Our story is their story.")}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              {pv(
                c,
                "hero.paragraph_1",
                "Elle's Foundation began in a small kitchen serving warm meals to children who walked hours to school on empty stomachs. A decade later, our work spans education, health, shelter, and community development — but the heart of it hasn't changed.",
              )}
            </p>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {pv(
                c,
                "hero.paragraph_2",
                "We believe that lasting change is built with communities, not for them. Every project we take on is co-designed with the people it serves, and measured by the dignity it restores.",
              )}
            </p>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden aspect-[5/6]">
              <Media
                src={pv(c, "hero.image") || pv(c, "story.image", aboutHero)}
                alt="Children and volunteers at an Elle's Foundation outreach"
                loading="eager"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-y bg-secondary/50">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Milestones"
            title={
              <>
                A decade of <span className="italic text-earth">quiet, steady</span> progress.
              </>
            }
          />
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
            <ul className="space-y-8">
              {milestones.map(([y, t]) => (
                <li key={y} className="relative pl-12">
                  <span className="absolute left-0 top-1.5 size-6 rounded-full bg-primary text-primary-foreground text-xs grid place-items-center font-medium">
                    ●
                  </span>
                  <div className="font-display text-2xl text-primary">{y}</div>
                  <p className="text-muted-foreground mt-1">{t}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="leadership" className="section-y scroll-mt-28">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Leadership"
            title={
              <>
                The people behind the <span className="italic text-earth">promise.</span>
              </>
            }
          />
          {people.length ? (
            <div className="grid gap-6 bg-transparent sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
              {people.map((p) => (
                <article key={p.id} className="group relative">
                  <div className="relative overflow-hidden rounded-[1.25rem] border border-border bg-background shadow-[0_16px_32px_-26px_var(--forest)] transition duration-300 group-hover:-translate-y-1 group-hover:border-primary/35 group-hover:shadow-[0_24px_42px_-25px_var(--forest)]">
                    <button type="button" onClick={() => { setSelectedMember(p); void trackTeamProfileClick(p.id).catch(() => undefined); }} className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={`View ${p.name}'s profile`}>
                      <div className="relative aspect-[1.28/1] overflow-hidden bg-[var(--forest)]">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt={`${p.name} portrait`} className="h-full w-full object-cover grayscale contrast-110 transition duration-500 group-hover:scale-105 group-hover:grayscale-0" />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-[var(--forest)] font-display text-4xl text-[var(--cream)]/85">
                            {p.name.split(" ").map((s) => s[0]).join("")}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--forest)]/75 via-transparent to-[var(--primary)]/15" aria-hidden="true" />
                        <span className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border border-[var(--cream)]/55 bg-[var(--forest)]/25 text-[var(--cream)] backdrop-blur-sm" aria-hidden="true">↗</span>
                      </div>
                      <div className="relative px-4 pb-4 pt-10">
                        <span className="absolute -top-8 left-4 grid size-16 place-items-center rounded-full border-4 border-background bg-[var(--forest)] font-display text-xl text-[var(--cream)] shadow-md" aria-hidden="true">{p.name.split(" ").map((s) => s[0]).join("")}</span>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="truncate font-display text-lg leading-tight text-primary">{p.name}</h4>
                            <p className="mt-1 truncate text-[0.62rem] font-semibold uppercase tracking-[0.11em] text-muted-foreground">{p.role}</p>
                          </div>
                          <span className="shrink-0 text-[0.55rem] font-bold uppercase tracking-[0.12em] text-earth">Profile</span>
                        </div>
                        {p.bio ? <p className="mt-4 line-clamp-2 text-xs leading-5 text-muted-foreground">{p.bio}</p> : null}
                        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                          <span className="inline-flex items-center gap-1.5 text-[0.54rem] font-bold uppercase tracking-[0.12em] text-muted-foreground"><span className="size-1.5 rounded-full bg-earth" aria-hidden="true" /> Elle’s Foundation</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1.5 text-[0.55rem] font-semibold text-primary-foreground transition group-hover:bg-forest">View bio <span className="text-secondary">↗</span></span>
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-2 border-t border-border px-4 py-3" aria-label={`${p.name} social profiles`}>
                      {p.linkedin_url ? <a href={p.linkedin_url} target="_blank" rel="noreferrer" aria-label={`${p.name} on LinkedIn`} className="grid size-7 place-items-center rounded-full border border-border text-primary transition hover:bg-primary hover:text-primary-foreground"><Linkedin className="size-3" /></a> : <span title="LinkedIn link not added" aria-label="LinkedIn link not added" className="grid size-7 place-items-center rounded-full border border-border text-primary/25"><Linkedin className="size-3" /></span>}
                      {p.instagram_url ? <a href={p.instagram_url} target="_blank" rel="noreferrer" aria-label={`${p.name} on Instagram`} className="grid size-7 place-items-center rounded-full border border-border text-primary transition hover:bg-primary hover:text-primary-foreground"><Instagram className="size-3" /></a> : <span title="Instagram link not added" aria-label="Instagram link not added" className="grid size-7 place-items-center rounded-full border border-border text-primary/25"><Instagram className="size-3" /></span>}
                      {p.website_url ? <a href={p.website_url} target="_blank" rel="noreferrer" aria-label={`${p.name}'s website`} className="grid size-7 place-items-center rounded-full border border-border text-primary transition hover:bg-primary hover:text-primary-foreground"><Globe className="size-3" /></a> : <span title="Website link not added" aria-label="Website link not added" className="grid size-7 place-items-center rounded-full border border-border text-primary/25"><Globe className="size-3" /></span>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border px-5 py-8 text-sm text-muted-foreground">
              Leadership profiles will appear here once they are published in the foundation CMS.
            </div>
          )}
          {testimonials.length ? (
            <div className="mt-16 border-t border-border pt-12">
              <SectionHeading eyebrow="Voices behind the work" title="Trusted by those we serve and serve with." />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.slice(0, 6).map((testimonial) => (
                  <figure key={testimonial.id} className="border border-primary/15 bg-primary px-5 py-6 text-primary-foreground shadow-[0_18px_36px_-28px_var(--forest)]">
                    <blockquote className="text-sm leading-7 text-primary-foreground/90">“{testimonial.quote}”</blockquote>
                    <figcaption className="mt-6 border-t border-primary-foreground/20 pt-4">
                      <p className="font-semibold">{testimonial.name}</p>
                      {testimonial.role ? <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-secondary">{testimonial.role}</p> : null}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {selectedMember ? <TeamMemberModal member={selectedMember} onClose={() => setSelectedMember(null)} /> : null}
      <section className="section-y-sm">
        <div className="container-wide">
          <div className="grid min-h-[380px] place-items-center overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center">
            <div>
              <h3 className="font-display text-4xl md:text-5xl text-white leading-tight max-w-2xl mx-auto">
                {pv(c, "cta.title", "Walk with us into the next decade.")}
              </h3>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Link
                  to="/donate"
                  className="inline-flex items-center gap-2 rounded-full bg-gold text-ink px-6 py-3 font-medium"
                >
                  <Heart className="size-4" /> Donate
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/30 text-white px-6 py-3 font-medium"
                >
                  Contact us <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}


function TeamMemberModal({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-primary/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-member-name"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg border border-border bg-background p-7 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close profile"
          className="absolute right-4 top-4 grid size-9 place-items-center border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          <X className="size-4" />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="grid size-24 place-items-center overflow-hidden rounded-full bg-secondary font-display text-3xl text-primary">
            {member.avatar_url ? (
              <img src={member.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              member.name.split(" ").map((part) => part[0]).join("")
            )}
          </div>
          <h2 id="team-member-name" className="mt-5 font-display text-3xl text-primary">{member.name}</h2>
          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-earth">{member.role}</p>
          {member.bio ? (
            <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">{member.bio}</p>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">This profile is managed by the Elle’s Foundation team.</p>
          )}
          {(member.linkedin_url || member.instagram_url || member.website_url) ? (
            <div className="mt-6 flex items-center gap-3">
              {member.linkedin_url ? <a href={member.linkedin_url} target="_blank" rel="noreferrer" aria-label={`${member.name} on LinkedIn`} className="grid size-10 place-items-center border border-border text-primary transition hover:border-primary hover:bg-secondary"><Linkedin className="size-4" /></a> : null}
              {member.instagram_url ? <a href={member.instagram_url} target="_blank" rel="noreferrer" aria-label={`${member.name} on Instagram`} className="grid size-10 place-items-center border border-border text-primary transition hover:border-primary hover:bg-secondary"><Instagram className="size-4" /></a> : null}
              {member.website_url ? <a href={member.website_url} target="_blank" rel="noreferrer" aria-label={`${member.name}'s website`} className="grid size-10 place-items-center border border-border text-primary transition hover:border-primary hover:bg-secondary"><Globe className="size-4" /></a> : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

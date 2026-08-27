import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SectionHeading } from "@/components/site/Section";
import { Media } from "@/components/site/Media";
import { usePageContent, pv } from "@/lib/page-content";
import { usePublicTeam, type TeamMember } from "@/lib/cms";
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
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const people = liveTeam ?? [];
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
            <div className="grid gap-8 rounded-[2rem] bg-[#dedfdd] p-5 [background-image:linear-gradient(rgba(255,255,255,0.32)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.32)_1px,transparent_1px)] [background-size:48px_48px] sm:grid-cols-2 sm:p-8 lg:grid-cols-4 lg:gap-7 lg:p-10">
              {people.map((p) => (
                <article key={p.id} className="group relative pt-2">
                  <div className="absolute inset-x-2 top-0 h-full translate-x-3 translate-y-3 rounded-[1.75rem] border border-white/70 bg-white/50" aria-hidden="true" />
                  <div className="relative z-10 overflow-hidden rounded-[1.75rem] border border-white/90 bg-white shadow-[0_24px_45px_-30px_rgba(0,0,0,0.8)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_30px_50px_-28px_rgba(0,0,0,0.75)]">
                    <button type="button" onClick={() => setSelectedMember(p)} className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={`View ${p.name}'s profile`}>
                      <div className="relative aspect-[1.12/1] overflow-hidden bg-[#181818]">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt={`${p.name} portrait`} className="h-full w-full object-cover grayscale contrast-125 transition duration-500 group-hover:scale-105 group-hover:grayscale-0" />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-[linear-gradient(145deg,#111,#595959)] font-display text-5xl text-white/80">
                            {p.name.split(" ").map((s) => s[0]).join("")}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" aria-hidden="true" />
                        <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-white/60 bg-white/10 text-white backdrop-blur-sm" aria-hidden="true">↗</span>
                      </div>
                      <div className="relative px-5 pb-5 pt-12">
                        <span className="absolute -top-10 left-5 grid size-20 place-items-center rounded-full border-[5px] border-white bg-black font-display text-2xl text-white shadow-lg" aria-hidden="true">{p.name.split(" ").map((s) => s[0]).join("")}</span>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="truncate font-display text-xl leading-tight text-[#111]">{p.name}</h4>
                            <p className="mt-1 truncate text-xs font-medium uppercase tracking-[0.1em] text-[#6b6b6b]">{p.role}</p>
                          </div>
                          <span className="shrink-0 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-[#8a8a8a]">Profile</span>
                        </div>
                        <p className="mt-5 line-clamp-3 min-h-[4.5rem] text-xs leading-6 text-[#4f4f4f]">{p.bio || "Meet the person helping Elle’s Foundation build lasting change with communities."}</p>
                        <div className="mt-5 flex items-center justify-between border-t border-[#e7e7e7] pt-4">
                          <span className="inline-flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#6d6d6d]"><span className="size-1.5 rounded-full bg-[#39a85b]" aria-hidden="true" /> Elle’s Foundation</span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#111] px-3 py-2 text-[0.58rem] font-semibold text-white transition group-hover:bg-primary">View bio <span className="text-[#d9f6a5]">↗</span></span>
                        </div>
                      </div>
                    </button>
                    {(p.linkedin_url || p.instagram_url || p.website_url) ? (
                      <div className="flex gap-2 px-5 pb-5">
                        {p.linkedin_url ? <a href={p.linkedin_url} target="_blank" rel="noreferrer" aria-label={`${p.name} on LinkedIn`} className="grid size-8 place-items-center rounded-full border border-[#d8d8d8] text-[#303030] transition hover:bg-[#111] hover:text-white"><Linkedin className="size-3.5" /></a> : null}
                        {p.instagram_url ? <a href={p.instagram_url} target="_blank" rel="noreferrer" aria-label={`${p.name} on Instagram`} className="grid size-8 place-items-center rounded-full border border-[#d8d8d8] text-[#303030] transition hover:bg-[#111] hover:text-white"><Instagram className="size-3.5" /></a> : null}
                        {p.website_url ? <a href={p.website_url} target="_blank" rel="noreferrer" aria-label={`${p.name}'s website`} className="grid size-8 place-items-center rounded-full border border-[#d8d8d8] text-[#303030] transition hover:bg-[#111] hover:text-white"><Globe className="size-3.5" /></a> : null}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border px-5 py-8 text-sm text-muted-foreground">
              Leadership profiles will appear here once they are published in the foundation CMS.
            </div>
          )}
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

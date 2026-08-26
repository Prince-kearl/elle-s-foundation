import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SectionHeading } from "@/components/site/Section";
import { Media } from "@/components/site/Media";
import { usePageContent, pv } from "@/lib/page-content";
import { usePublicTeam } from "@/lib/cms";
import aboutHero from "@/assets/community/live/outreach-children.jpeg";
import { ArrowRight, Heart } from "lucide-react";

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

const team = [
  { n: "Elle Mensah", r: "Founder & Executive Director", avatar: null, bio: null },
  { n: "Samuel Osei", r: "Director of Programs", avatar: null, bio: null },
  { n: "Ama Owusu", r: "Head of Community Health", avatar: null, bio: null },
  { n: "Joseph Kamau", r: "Partnerships Lead", avatar: null, bio: null },
];

function About() {
  const { data: c } = usePageContent("about");
  const { data: liveTeam } = usePublicTeam();
  const people = liveTeam?.length
    ? liveTeam.map((member) => ({
        n: member.name,
        r: member.role,
        avatar: member.avatar_url,
        bio: member.bio,
      }))
    : team;
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

      <section className="section-y">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Leadership"
            title={
              <>
                The people behind the <span className="italic text-earth">promise.</span>
              </>
            }
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {people.map((p) => (
              <div key={p.n} className="soft-card p-6 text-center">
                <div className="size-20 mx-auto overflow-hidden rounded-full bg-secondary grid place-items-center font-display text-2xl text-primary">
                  {p.avatar ? (
                    <img src={p.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    p.n
                      .split(" ")
                      .map((s) => s[0])
                      .join("")
                  )}
                </div>
                <h4 className="font-display text-lg mt-4 text-primary">{p.n}</h4>
                <p className="text-sm text-muted-foreground">{p.r}</p>
                {p.bio ? (
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">{p.bio}</p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

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

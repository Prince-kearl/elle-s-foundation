import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SectionHeading } from "@/components/site/Section";
import unity from "@/assets/children-unity.jpg";
import heroChildren from "@/assets/hero-children.jpg";
import { ArrowRight, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Elle's Foundation" },
      { name: "description", content: "Our story, our people, and our commitment to feeding hope and restoring lives across communities." },
      { property: "og:title", content: "About Elle's Foundation" },
      { property: "og:description", content: "A community-focused nonprofit built on compassion, integrity, service, and faith." },
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
  { n: "Elle Mensah", r: "Founder & Executive Director" },
  { n: "Samuel Osei", r: "Director of Programs" },
  { n: "Ama Owusu", r: "Head of Community Health" },
  { n: "Joseph Kamau", r: "Partnerships Lead" },
];

function About() {
  return (
    <SiteLayout>
      <section className="pt-14 pb-20">
        <div className="container-wide grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="eyebrow">About Us</span>
            <h1 className="font-display text-5xl md:text-6xl mt-5 leading-[1.02] text-primary">
              Our story is <span className="italic text-earth">their story.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Elle's Foundation began in a small kitchen serving warm meals to
              children who walked hours to school on empty stomachs. A decade
              later, our work spans education, health, shelter, and community
              development — but the heart of it hasn't changed.
            </p>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              We believe that lasting change is built with communities, not for
              them. Every project we take on is co-designed with the people it
              serves, and measured by the dignity it restores.
            </p>
          </div>
          <div className="relative">
            <div className="rounded-[2.5rem] overflow-hidden aspect-[5/6]">
              <img src={heroChildren} alt="Children smiling" loading="lazy" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/50">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Milestones"
            title={<>A decade of <span className="italic text-earth">quiet, steady</span> progress.</>}
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

      <section className="py-24">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Leadership"
            title={<>The people behind the <span className="italic text-earth">promise.</span></>}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((p) => (
              <div key={p.n} className="soft-card p-6 text-center">
                <div className="size-20 mx-auto rounded-full bg-secondary grid place-items-center font-display text-2xl text-primary">
                  {p.n.split(" ").map((s) => s[0]).join("")}
                </div>
                <h4 className="font-display text-lg mt-4 text-primary">{p.n}</h4>
                <p className="text-sm text-muted-foreground">{p.r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-wide">
          <div className="rounded-[2.5rem] overflow-hidden relative">
            <img src={unity} alt="Community" loading="lazy" className="w-full h-[380px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/85 to-primary/40 grid place-items-center text-center px-6">
              <div>
                <h3 className="font-display text-4xl md:text-5xl text-white leading-tight max-w-2xl mx-auto">
                  Walk with us into the next decade.
                </h3>
                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  <Link to="/donate" className="inline-flex items-center gap-2 rounded-full bg-gold text-ink px-6 py-3 font-medium">
                    <Heart className="size-4" /> Donate
                  </Link>
                  <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/30 text-white px-6 py-3 font-medium">
                    Contact us <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

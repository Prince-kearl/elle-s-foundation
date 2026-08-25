import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SectionHeading, Counter } from "@/components/site/Section";
import { Media } from "@/components/site/Media";
import { usePageContent, pv } from "@/lib/page-content";
import c1 from "@/assets/community/community-1.jpeg.asset.json";
import c2 from "@/assets/community/community-2.jpeg.asset.json";
import c3 from "@/assets/community/community-3.jpeg.asset.json";
import c4 from "@/assets/community/community-4.jpeg.asset.json";
import c5 from "@/assets/community/community-5.jpeg.asset.json";
import c6 from "@/assets/community/community-6.jpeg.asset.json";
import c7 from "@/assets/community/community-7.jpeg.asset.json";
import c8 from "@/assets/community/community-8.jpeg.asset.json";
import c9 from "@/assets/community/community-9.jpeg.asset.json";
import {
  Eye, Target, Heart, ShieldCheck, HandHeart, Users, Sparkles, Cross, Star,
  GraduationCap, HeartPulse, Home as HomeIcon, TreePine, ArrowRight, Quote,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Elle's Foundation — Feeding Hope. Restoring Lives." },
      { name: "description", content: "A community-focused nonprofit improving lives through education, health, shelter, and community development. Join us — donate, volunteer, or partner." },
      { property: "og:title", content: "Elle's Foundation — Feeding Hope. Restoring Lives." },
      { property: "og:description", content: "Every child deserves a chance. Every family deserves support. Every community deserves the opportunity to thrive." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const { data: c } = usePageContent("home");
  return (
    <SiteLayout>
      <Hero c={c} />
      <Stats />
      <About c={c} />
      <VisionMission c={c} />
      <Ofts c={c} />
      <Values c={c} />


      <Programs c={c} />
      <Stories c={c} />
      <Testimonials />
      <Partners />
      <CTA c={c} />
    </SiteLayout>
  );
}

type C = Record<string, string> | undefined;

function Hero({ c }: { c: C }) {
  return (
    <section className="relative overflow-hidden pt-6 pb-24">
      <div className="blob top-[-6rem] left-[-6rem] size-[28rem]"
           style={{ background: "color-mix(in oklab, var(--color-primary) 55%, transparent)" }} />
      <div className="blob bottom-[-8rem] right-[-4rem] size-[26rem]"
           style={{ background: "color-mix(in oklab, var(--color-gold) 45%, transparent)" }} />

      <div className="container-wide grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center relative">
        <div className="rise-in">
          <span className="eyebrow">{pv(c, "hero.eyebrow", "Elle's Foundation · Est. 2015")}</span>
          <h1 className="mt-6 font-display text-5xl md:text-7xl font-semibold leading-[0.98] text-primary">
            {pv(c, "hero.title", "Feeding Hope.")}
            <br />
            <span className="text-earth">{pv(c, "hero.title_accent", "Restoring Lives.")}</span>
          </h1>
          <p className="mt-7 text-lg text-muted-foreground max-w-xl leading-relaxed">
            {pv(c, "hero.description", "We believe every child deserves a chance, every family deserves support, and every community deserves the opportunity to thrive with dignity and hope.")}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3.5 font-medium hover:bg-forest transition shadow-[var(--shadow-soft)]"
            >
              <Heart className="size-4" /> {pv(c, "hero.cta_primary", "Donate Now")}
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-primary/25 text-primary px-7 py-3.5 font-medium hover:bg-secondary transition"
            >
              {pv(c, "hero.cta_secondary", "Become a Volunteer")} <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-5 text-sm text-muted-foreground">
            <div className="flex -space-x-3">
              {[c3.url, c5.url, c9.url].map((s, i) => (
                <img key={i} src={s} alt="" className="size-10 rounded-full border-2 border-background object-cover" />
              ))}
            </div>
            <div>{pv(c, "hero.trust_text", "Trusted by 3,200+ families across Ghana and beyond.")}</div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-primary/15 to-gold/15 blur-2xl" />
          <div className="relative rounded-2xl overflow-hidden shadow-[var(--shadow-soft)] aspect-[5/6]">
            <Media
              video={pv(c, "hero.video")}
              src={pv(c, "hero.image", c5.url)}
              alt="Elle's Foundation outreach — smiling children and volunteers"
              loading="eager"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -left-6 bottom-10 float-slow bg-card rounded-xl p-4 shadow-[var(--shadow-card)] border border-border w-56">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{pv(c, "hero.badge_label", "Meals served")}</div>
            <div className="font-display text-3xl text-primary">{pv(c, "hero.badge_value", "148,720")}</div>
            <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-primary to-gold" />
            </div>
          </div>
          <div className="absolute -right-4 top-10 float-slow bg-card rounded-xl px-4 py-3 shadow-[var(--shadow-card)] border border-border flex items-center gap-3" style={{ animationDelay: "1.5s" }}>
            <div className="size-10 rounded-full bg-primary/10 grid place-items-center text-primary">
              <Sparkles className="size-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-medium">98% goes to programs</div>
              <div className="text-xs text-muted-foreground">Full transparency</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    ["12,400+", "Children Supported"],
    ["3,200", "Families Assisted"],
    ["46", "Communities Reached"],
    ["148K", "Meals Served"],
    ["620", "Volunteers"],
    ["82", "Projects Completed"],
  ];
  return (
    <section className="section-y-sm">
      <div className="container-wide rounded-2xl bg-secondary/60 border border-border py-12 px-6 md:px-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {items.map(([n, l]) => <Counter key={l} n={n} label={l} />)}
      </div>
    </section>
  );
}

function About({ c }: { c: C }) {
  return (
    <section className="section-y">
      <div className="container-wide grid lg:grid-cols-2 gap-14 items-center">
        <div className="relative">
          <div className="rounded-2xl overflow-hidden aspect-[6/5]">
            <Media
              video={pv(c, "about.video")}
              src={pv(c, "about.image", c2.url)}
              alt="Volunteers distributing supplies to families"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-8 -right-4 bg-card border border-border rounded-xl p-5 shadow-[var(--shadow-card)] max-w-xs">
            <Quote className="size-5 text-gold" />
            <p className="font-display text-primary mt-2 leading-snug">
              "{pv(c, "about.quote", "We feed hope, restore dignity, and empower lives.")}"
            </p>
          </div>
        </div>
        <div>
          <span className="eyebrow">{pv(c, "about.eyebrow", "About Elle's Foundation")}</span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 leading-[1.05] text-primary">
            {pv(c, "about.title", "A community-focused nonprofit built on compassion.")}
          </h2>
          <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
            {pv(c, "about.description", "Elle's Foundation is dedicated to improving lives through education, health, and community development. We walk alongside the families we serve — with humility, integrity, and long-term commitment to real change.")}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              ["12,400+", "Children Supported"],
              ["82", "Projects Completed"],
              ["98%", "To Direct Programs"],
              ["148K", "Meals Served"],
            ].map(([n, l]) => (

              <div key={l} className="soft-card p-5">
                <div className="font-display text-2xl text-primary">{n}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{l}</div>
              </div>
            ))}
          </div>
          <Link
            to="/about"
            className="mt-8 inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
          >
            Learn more about our story <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function VisionMission({ c }: { c: C }) {
  const mission = [
    "Provide education for children without access",
    "Offer shelter and support to the underprivileged",
    "Deliver health initiatives that promote wellbeing",
    "Lead community outreach that restores dignity",
  ];
  return (
    <section className="section-y-sm">
      <div className="container-wide grid lg:grid-cols-2 gap-6">
        <div className="soft-card soft-card-hover p-10 bg-primary text-primary-foreground border-primary/30">
          <div className="size-14 rounded-full bg-white/15 grid place-items-center">
            <Eye className="size-7" />
          </div>
          <span className="eyebrow mt-6 !bg-white/15 !text-white/90">Our Vision</span>
          <h3 className="font-display text-3xl mt-4 leading-tight">
            {pv(c, "vision.title", "A world where every child has access to education, every family has shelter, and every community is empowered with health, dignity and hope.")}
          </h3>
        </div>
        <div className="soft-card soft-card-hover p-10">
          <div className="size-14 rounded-full bg-gold/15 grid place-items-center text-gold">
            <Target className="size-7" />
          </div>
          <span className="eyebrow mt-6">Our Mission</span>
          <h3 className="font-display text-3xl mt-4 leading-tight text-primary">
            {pv(c, "mission.title", "Restoring dignity through practical, lasting change.")}
          </h3>
          <ul className="mt-6 space-y-3">
            {mission.map((m) => (
              <li key={m} className="flex gap-3 text-foreground/80">
                <span className="mt-2 size-1.5 rounded-full bg-gold shrink-0" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Ofts({ c }: { c: C }) {
  const points = [
    {
      t: pv(c, "ofts.point_1_title", "What We Do"),
      d: pv(c, "ofts.point_1_text", "Elle's Foundation is committed to providing meals, clean water, and building connections with individuals experiencing hunger and homelessness."),
    },
    {
      t: pv(c, "ofts.point_2_title", "Our Mission"),
      d: pv(c, "ofts.point_2_text", "To support the lives of children without shelter and education, to feed the poor, the needy, and the homeless."),
    },
    {
      t: pv(c, "ofts.point_3_title", "Our Vision"),
      d: pv(c, "ofts.point_3_text", "To foster a society where education and food security are fundamental rights, ensuring a brighter and more equitable future for all."),
    },
  ];
  const momo = [
    ["0502418189", "Telecel", "Rebecca Ashirifie"],
    ["0559969764", "MTN", "Marilyn Kotei"],
  ];
  return (
    <section className="section-y">
      <div className="container-wide">
        <div className="rounded-2xl overflow-hidden bg-primary text-primary-foreground p-8 md:p-12 grid lg:grid-cols-2 gap-12">
          <div>
            <span className="eyebrow !bg-white/15 !text-white/90">{pv(c, "ofts.eyebrow", "Operation Feed the Street")}</span>
            <h2 className="font-display text-4xl md:text-5xl mt-5 leading-[1.05]">
              {pv(c, "ofts.title", "#OFTS")}
            </h2>
            <p className="mt-3 text-lg opacity-90">
              {pv(c, "ofts.tagline", "Feeding Hope. Restoring Dignity.")}
            </p>
            <ul className="mt-8 space-y-6">
              {points.map((p) => (
                <li key={p.t} className="flex gap-4">
                  <span className="size-9 rounded-full bg-white/15 grid place-items-center shrink-0">
                    <HandHeart className="size-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-xl">{p.t}</h3>
                    <p className="opacity-85 mt-1 leading-relaxed">{p.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-center">
            <div className="rounded-xl bg-white/10 border border-white/20 p-6">
              <h3 className="font-display text-2xl">{pv(c, "ofts.donate_title", "Want to Help? Donate Today!")}</h3>
              <p className="text-sm opacity-80 mt-2 uppercase tracking-[0.18em]">MoMo Donations</p>
              <ul className="mt-5 space-y-4">
                {momo.map(([num, net, name]) => (
                  <li key={num} className="flex items-center justify-between gap-4 rounded-lg bg-white/10 px-4 py-3">
                    <div>
                      <div className="font-display text-xl">{num}</div>
                      <div className="text-xs opacity-80">{name}</div>
                    </div>
                    <span className="text-xs uppercase tracking-widest rounded-full border border-white/30 px-3 py-1">{net}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/donate"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold text-ink px-6 py-3 font-medium"
              >
                <Heart className="size-4" /> Donate online
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

}

function Values({ c }: { c: C }) {
  const vals = [
    { i: Heart, t: "Compassion", d: "We care deeply and act with kindness." },
    { i: ShieldCheck, t: "Integrity", d: "We are honest, transparent, and accountable." },
    { i: HandHeart, t: "Service", d: "We serve with humility and love." },
    { i: Sparkles, t: "Empowerment", d: "We equip people to reach their full potential." },
    { i: Cross, t: "Faith", d: "We trust in God and walk in purpose." },
    { i: Users, t: "Community", d: "We believe in unity and collective impact." },
    { i: Star, t: "Excellence", d: "We are committed to quality in all we do." },
  ];
  return (
    <section className="section-y relative">
      <div className="container-wide">
        <SectionHeading
          eyebrow="What Drives Us"
          title={pv(c, "values.title", "Our Core Values")}
          intro={pv(c, "values.intro", "The principles that shape every program, partnership, and promise we keep.")}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {vals.map(({ i: Icon, t, d }) => (
            <div key={t} className="soft-card soft-card-hover p-6">
              <div className="size-12 rounded-xl bg-secondary grid place-items-center text-primary">
                <Icon className="size-6" />
              </div>
              <h4 className="font-display text-xl mt-5 text-primary">{t}</h4>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Programs({ c }: { c: C }) {
  const list = [
    { i: GraduationCap, t: "Education", d: "Building brighter futures through learning and scholarships.", img: c1.url },
    { i: HeartPulse, t: "Health", d: "Promoting wellbeing with clinics, checkups, and clean water.", img: c4.url },
    { i: HomeIcon, t: "Shelter & Support", d: "Offering shelter and support to the underprivileged.", img: c6.url },
    { i: TreePine, t: "Community Development", d: "Creating opportunities that restore dignity and inspire growth.", img: c8.url },
  ];
  return (
    <section className="section-y bg-secondary/50">
      <div className="container-wide">
        <SectionHeading
          eyebrow="What We Do"
          title={pv(c, "programs.title", "Programs that change everything.")}
          intro={pv(c, "programs.intro", "Four focused pillars, one shared belief — that lasting change begins with people, not projects.")}
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {list.map(({ i: Icon, t, d, img }) => (
            <article key={t} className="soft-card soft-card-hover overflow-hidden flex flex-col">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={img} alt={t} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="size-11 rounded-xl bg-primary/10 grid place-items-center text-primary -mt-11 relative border-4 border-card">
                  <Icon className="size-5" />
                </div>
                <h4 className="font-display text-xl mt-4 text-primary">{t}</h4>
                <p className="text-sm text-muted-foreground mt-2 flex-1">{d}</p>
                <Link to="/programs" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2 transition-all">
                  Learn more <ArrowRight className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stories({ c }: { c: C }) {
  const stories = [
    { img: c3.url, tag: "Education", t: "Amina found her voice through school.", d: "From a village without a classroom to top of her class — one scholarship changed everything." },
    { img: c7.url, tag: "Family", t: "A home rebuilt, a mother renewed.", d: "Grace and her son moved into permanent shelter after two years of uncertainty." },
    { img: c9.url, tag: "Youth", t: "Two brothers, one graduation day.", d: "Kwame and Kojo are the first in their family to finish secondary school." },
  ];
  const galleryVideo = pv(c, "gallery.video");
  return (
    <section className="section-y">
      <div className="container-wide">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <span className="eyebrow">Featured Stories</span>
            <h2 className="font-display text-4xl md:text-5xl mt-4 leading-[1.05] text-primary">
              {pv(c, "stories.title", "Real people. Real change.")}
            </h2>
          </div>
          <Link to="/programs" className="inline-flex items-center gap-2 text-primary font-medium">
            All stories <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {stories.map((s) => (
            <article key={s.t} className="group">
              <div className="rounded-xl overflow-hidden aspect-[4/5]">
                <img src={s.img} alt={s.t} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="mt-5">
                <span className="text-xs uppercase tracking-[0.2em] text-gold font-medium">{s.tag}</span>
                <h4 className="font-display text-2xl mt-2 text-primary leading-snug">{s.t}</h4>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{s.d}</p>
              </div>
            </article>
          ))}
        </div>

        {galleryVideo ? (
          <div className="mt-12 rounded-2xl overflow-hidden aspect-video bg-black">
            <Media video={galleryVideo} alt={pv(c, "gallery.title", "Moments from our work")} className="w-full h-full object-cover" />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Testimonials() {
  const t = [
    { q: "Volunteering with Elle's Foundation was the most meaningful year of my life. Their team meets people with real dignity.", n: "Amelia O.", r: "Volunteer, Ghana" },
    { q: "The scholarship program changed my daughter's future. She now dreams of becoming a nurse.", n: "Fatou D.", r: "Parent, Senegal" },
    { q: "A partner that keeps its word. Elle's Foundation delivers where it matters — on the ground, with the people.", n: "David M.", r: "Corporate Partner" },
  ];
  return (
    <section className="section-y bg-secondary/50">
      <div className="container-wide">
        <SectionHeading
          eyebrow="Voices"
          title={<>Trusted by those we <span className="text-earth">serve</span> and serve with.</>}
        />
        <div className="grid md:grid-cols-3 gap-6">
          {t.map((x) => (
            <blockquote key={x.n} className="soft-card p-8">
              <Quote className="size-6 text-gold" />
              <p className="mt-4 font-display text-xl leading-snug text-primary">"{x.q}"</p>
              <footer className="mt-6 text-sm">
                <div className="font-medium">{x.n}</div>
                <div className="text-muted-foreground">{x.r}</div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function Partners() {
  const partners = ["UNICEF Partner", "Save The Children", "Global Giving", "World Food Aid", "Compassion Intl.", "Rotary Club"];
  return (
    <section className="section-y-sm">
      <div className="container-wide">
        <p className="text-center text-xs uppercase tracking-[0.28em] text-muted-foreground mb-8">
          Proud to work alongside
        </p>
        <div className="flex flex-wrap justify-center gap-x-14 gap-y-6 opacity-70">
          {partners.map((p) => (
            <span key={p} className="font-display text-lg text-primary/70 whitespace-nowrap">{p}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA({ c }: { c: C }) {
  return (
    <section className="section-y-sm">
      <div className="container-wide">
        <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground px-8 md:px-16 py-16 md:py-20">
          <div className="blob top-[-4rem] right-[-4rem] size-[22rem]" style={{ background: "color-mix(in oklab, var(--color-gold) 60%, transparent)" }} />
          <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
            <div>
              <span className="eyebrow !bg-white/15 !text-white/90">Get Involved</span>
              <h3 className="font-display text-4xl md:text-6xl mt-4 leading-[1.02]">
                {pv(c, "cta.title", "Be the reason someone's life changes.")}
              </h3>
              <p className="mt-5 opacity-85 text-lg max-w-xl">
                {pv(c, "cta.description", "Volunteer. Donate. Partner with us. Together, we can make a lasting difference.")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link to="/donate" className="inline-flex items-center gap-2 rounded-full bg-gold text-ink px-6 py-3.5 font-medium">
                <Heart className="size-4" /> Donate
              </Link>
              <Link to="/sponsor" className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/25 px-6 py-3.5 font-medium">
                Sponsor
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/25 px-6 py-3.5 font-medium">
                Volunteer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

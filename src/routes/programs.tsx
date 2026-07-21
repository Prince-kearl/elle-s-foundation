import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SectionHeading } from "@/components/site/Section";
import edu from "@/assets/program-education.jpg";
import health from "@/assets/program-health.jpg";
import shelter from "@/assets/program-shelter.jpg";
import community from "@/assets/program-community.jpg";
import { GraduationCap, HeartPulse, Home, TreePine, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Programs — Elle's Foundation" },
      { name: "description", content: "Education, healthcare, shelter, and community development programs restoring dignity across four continents." },
      { property: "og:title", content: "Our Programs — Elle's Foundation" },
      { property: "og:description", content: "Four focused pillars, one shared belief — lasting change begins with people, not projects." },
      { property: "og:url", content: "/programs" },
    ],
    links: [{ rel: "canonical", href: "/programs" }],
  }),
  component: Programs,
});

const programs = [
  { i: GraduationCap, t: "Education", d: "Scholarships, learning centers, teacher training, and school-feeding programs that keep children in the classroom.", img: edu, stat: ["4,800", "students supported"] },
  { i: HeartPulse, t: "Healthcare", d: "Mobile clinics, maternal care, vaccinations, and clean water access across rural communities.", img: health, stat: ["62", "outreach clinics"] },
  { i: Home, t: "Shelter & Support", d: "Safe homes, family stabilization, and crisis support for the most vulnerable.", img: shelter, stat: ["940", "families housed"] },
  { i: TreePine, t: "Community Development", d: "Skills training, small-business grants, and infrastructure that unlock long-term prosperity.", img: community, stat: ["46", "communities reached"] },
];

function Programs() {
  return (
    <SiteLayout>
      <section className="pt-14 pb-10">
        <div className="container-wide text-center max-w-3xl mx-auto">
          <span className="eyebrow">Our Programs</span>
          <h1 className="font-display text-5xl md:text-6xl mt-5 leading-[1.02] text-primary">
            Four pillars. One <span className="italic text-earth">promise.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Every program we run is designed with the community, delivered by local teams,
            and measured by the change it creates in real lives.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container-wide space-y-20">
          {programs.map(({ i: Icon, t, d, img, stat }, idx) => (
            <div key={t} className={`grid lg:grid-cols-2 gap-12 items-center ${idx % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
              <div className="rounded-[2rem] overflow-hidden aspect-[5/4]">
                <img src={img} alt={t} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="size-12 rounded-xl bg-primary/10 grid place-items-center text-primary">
                  <Icon className="size-6" />
                </div>
                <h2 className="font-display text-4xl mt-5 text-primary leading-tight">{t}</h2>
                <p className="text-muted-foreground mt-4 text-lg leading-relaxed">{d}</p>
                <div className="mt-6 flex items-center gap-6">
                  <div>
                    <div className="font-display text-3xl text-primary">{stat[0]}</div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{stat[1]}</div>
                  </div>
                  <Link to="/donate" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium">
                    Support this program <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Impact"
            title={<>Measured in <span className="italic text-earth">lives</span>, not slides.</>}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              ["148K", "Meals served"],
              ["4,800", "Students enrolled"],
              ["62", "Clinics run"],
              ["940", "Families housed"],
            ].map(([n, l]) => (
              <div key={l} className="soft-card p-6 text-center">
                <div className="font-display text-4xl text-primary">{n}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

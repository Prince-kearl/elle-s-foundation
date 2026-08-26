import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SectionHeading } from "@/components/site/Section";
import { Media } from "@/components/site/Media";
import { usePageContent, pv } from "@/lib/page-content";
import { usePublicPrograms, usePublicStats, type Stat } from "@/lib/cms";
import programEducation from "@/assets/community/live/community-supplies.jpeg";
import programHealth from "@/assets/community/live/family-support.jpeg";
import programShelter from "@/assets/community/live/outreach-children.jpeg";
import programCommunity from "@/assets/community/live/team-under-tree.jpeg";
import { GraduationCap, HeartPulse, Home, TreePine, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Programs — Elle's Foundation" },
      {
        name: "description",
        content:
          "Education, healthcare, shelter, and community development programs restoring dignity across communities.",
      },
      { property: "og:title", content: "Our Programs — Elle's Foundation" },
      {
        property: "og:description",
        content:
          "Four focused pillars, one shared belief — lasting change begins with people, not projects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/programs" },
    ],
    links: [{ rel: "canonical", href: "/programs" }],
  }),
  component: Programs,
});

const ICONS: Record<string, any> = { GraduationCap, HeartPulse, Home, TreePine };

function Programs() {
  const { data: c } = usePageContent("programs");
  const { data: dbPrograms } = usePublicPrograms();
  const { data: dbStats } = usePublicStats();
  const programs = (dbPrograms ?? []) as any[];
  const impactStats = dbStats ?? [];
  const headerImage = pv(c, "header.image") || programEducation;

  return (
    <SiteLayout>
      <section className="pt-14 pb-10">
        <div className="container-wide text-center max-w-3xl mx-auto">
          <span className="eyebrow">{pv(c, "header.eyebrow", "Our Programs")}</span>
          <h1 className="font-display text-5xl md:text-6xl mt-5 leading-[1.02] text-primary">
            {pv(c, "header.title", "Four pillars. One promise.")}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            {pv(
              c,
              "header.description",
              "Every program we run is designed with the community, delivered by local teams, and measured by the change it creates in real lives.",
            )}
          </p>
        </div>
        {headerImage ? (
          <div className="container-wide mt-10">
            <div className="rounded-2xl overflow-hidden aspect-[16/7] bg-black">
              <Media
                src={headerImage}
                alt="Elle's Foundation programs"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : null}
      </section>

      <section className="section-y-sm">
        <div className="container-wide space-y-20">
          {programs.length ? programs.map((p, idx) => {
            const Icon = ICONS[p.icon] ?? GraduationCap;
            return (
              <div
                key={p.id ?? p.title}
                className={`grid lg:grid-cols-2 gap-12 items-center ${idx % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}
              >
                <div className="rounded-2xl overflow-hidden aspect-[5/4] bg-secondary">
                  <Media
                    src={p.image_url || ""}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="size-12 rounded-xl bg-primary/10 grid place-items-center text-primary">
                    <Icon className="size-6" />
                  </div>
                  <h2 className="font-display text-4xl mt-5 text-primary leading-tight">
                    {p.title}
                  </h2>
                  <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
                    {p.description}
                  </p>
                  <div className="mt-6 flex items-center gap-6">
                    {p.stat_value ? (
                      <div>
                        <div className="font-display text-3xl text-primary">{p.stat_value}</div>
                        <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                          {p.stat_label}
                        </div>
                      </div>
                    ) : null}
                    <Link
                      to="/donate"
                      className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium"
                    >
                      Support this program <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="border border-dashed border-border px-5 py-8 text-sm text-muted-foreground">
              Programs will appear here once they are published in the foundation CMS.
            </div>
          )}
        </div>
      </section>

      <section className="section-y">
        <div className="container-wide">
          <SectionHeading
            eyebrow="Impact"
            title={pv(c, "impact.title", "Measured in lives, not slides.")}
          />
          {impactStats.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {impactStats.map(({ value: n, label: l }) => (
              <div key={l} className="soft-card p-6 text-center">
                <div className="font-display text-4xl text-primary">{n}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                  {l}
                </div>
              </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border px-5 py-8 text-sm text-muted-foreground">
              Impact metrics will appear here once they are published in the foundation CMS.
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

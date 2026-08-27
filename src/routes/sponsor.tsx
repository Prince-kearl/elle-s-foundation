import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SectionHeading } from "@/components/site/Section";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Utensils, Home, TreePine, HandHeart, Heart, Loader2, Check, Star } from "lucide-react";
import { toast } from "sonner";
import { usePageContent, pv } from "@/lib/page-content";
import type { Sponsorship } from "@/lib/cms";

const ICONS: Record<string, any> = { GraduationCap, Utensils, Home, TreePine, HandHeart, Heart };

export const Route = createFileRoute("/sponsor")({
  head: () => ({
    meta: [
      { title: "Sponsor — Elle's Foundation" },
      { name: "description", content: "Sponsor a child's education, a family's meals, a community well. Recurring gifts in Ghana Cedis that build lasting change." },
      { property: "og:title", content: "Sponsor a life. Change a story. — Elle's Foundation" },
      { property: "og:description", content: "Recurring gifts in Ghana Cedis that build lasting change for children, families, and communities." },
      { property: "og:url", content: "/sponsor" },
    ],
    links: [{ rel: "canonical", href: "/sponsor" }],
  }),
  component: SponsorPage,
});

function SponsorPage() {
  const { data: c } = usePageContent("sponsor");
  const { data: tiers = [], isLoading } = useQuery<Sponsorship[]>({
    queryKey: ["p:sponsorships"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sponsorships").select("*").eq("visible", true).order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Sponsorship[];
    },
  });

  const [selected, setSelected] = useState<Sponsorship | null>(null);

  return (
    <SiteLayout>
      <section className="pt-14 pb-8">
        <div className="container-wide text-center max-w-3xl mx-auto">
          <span className="eyebrow">{pv(c, "hero.eyebrow", "Sponsorship")}</span>
          <h1 className="font-display text-5xl md:text-6xl mt-5 leading-[1.02] text-primary">
            {pv(c, "hero.title", "Sponsor a life. Change a story.")}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            {pv(c, "hero.description", "Your recurring gift in Ghana Cedis creates lasting change — from meals and schooling to safe homes and clean water.")}
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-wide">
          {isLoading ? (
            <div className="text-center py-20"><Loader2 className="inline size-6 animate-spin text-primary" /></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tiers.length === 0 ? (
                <div className="col-span-full border border-border bg-secondary/30 px-6 py-16 text-center text-muted-foreground">Sponsorship options will be available soon.</div>
              ) : tiers.map((t) => {
                const Icon = ICONS[t.icon ?? ""] ?? HandHeart;
                return (
                  <article key={t.id} className={`soft-card soft-card-hover p-6 flex flex-col ${t.featured ? "ring-2 ring-primary/40" : ""}`}>
                    {t.featured && (
                      <div className="inline-flex self-start items-center gap-1 rounded-md bg-gold/15 text-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest mb-3">
                        <Star className="size-3" /> Most Impact
                      </div>
                    )}
                    <div className="size-12 rounded-lg bg-primary/10 grid place-items-center text-primary">
                      <Icon className="size-6" />
                    </div>
                    <h3 className="font-display text-xl mt-4 text-primary leading-snug">{t.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 flex-1">{t.description}</p>
                    <div className="mt-5">
                      <div className="font-display text-3xl text-primary">GH₵{Number(t.amount).toLocaleString()}</div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mt-0.5">{t.frequency}</div>
                    </div>
                    {t.benefits?.length ? (
                      <ul className="mt-4 space-y-1.5 text-sm text-foreground/80">
                        {t.benefits.map((b: string) => (
                          <li key={b} className="flex gap-2"><Check className="size-4 text-gold shrink-0 mt-0.5" />{b}</li>
                        ))}
                      </ul>
                    ) : null}
                    <button onClick={() => setSelected(t)} className="mt-5 rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:bg-forest transition">
                      Sponsor now
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {selected && <SponsorModal tier={selected} onClose={() => setSelected(null)} />}
    </SiteLayout>
  );
}

function SponsorModal({ tier, onClose }: { tier: Sponsorship; onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.from("donation_intents").insert({
        amount: tier.amount,
        frequency: tier.frequency,
        currency: tier.currency || "GHS",
        sponsorship_id: tier.id,
        name: name || null, email: email || null, note: note || null,
      });
      if (error) throw error;
      setDone(true);
      toast.success("Thank you! We'll be in touch with payment details.");
    } catch (e: any) { toast.error(e?.message ?? "Failed"); }
    finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-border">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Sponsor</div>
          <h3 className="font-display text-2xl text-primary mt-1">{tier.title}</h3>
          <div className="mt-2 font-display text-xl text-primary">GH₵{Number(tier.amount).toLocaleString()} <span className="text-sm text-muted-foreground font-sans">/ {tier.frequency}</span></div>
        </div>
        <form onSubmit={submit} className="p-6 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-primary" required />
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-primary" required />
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Message (optional)" className="w-full rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
          <button disabled={busy || done} className="w-full rounded-lg bg-primary text-primary-foreground py-3 font-medium hover:bg-forest transition disabled:opacity-60 inline-flex items-center justify-center gap-2">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <HandHeart className="size-4" />}
            {done ? "Received — thank you!" : "Confirm sponsorship"}
          </button>
          <p className="text-xs text-muted-foreground text-center">We'll email Mobile Money & bank details to complete your gift.</p>
        </form>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Heart, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { usePageContent, pv } from "@/lib/page-content";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — Elle's Foundation" },
      { name: "description", content: "Your gift in Ghana Cedis restores dignity. Give once or monthly — every cedi funds education, meals, shelter, and community." },
      { property: "og:title", content: "Donate to Elle's Foundation" },
      { property: "og:description", content: "Every cedi becomes a meal, a schoolbook, a clinic visit, a safer home." },
      { property: "og:url", content: "/donate" },
    ],
    links: [{ rel: "canonical", href: "/donate" }],
  }),
  component: Donate,
});

const AMOUNTS = [50, 100, 250, 500, 1000];

function Donate() {
  const { data: c } = usePageContent("donate");
  const [freq, setFreq] = useState<"once" | "monthly">("monthly");
  const [amount, setAmount] = useState(100);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || amount < 1) return toast.error("Enter an amount");
    setSubmitting(true);
    try {
      const { error } = await supabase.from("donation_intents").insert({
        amount, frequency: freq, name: name || null, email: email || null, note: note || null, currency: "GHS",
      });
      if (error) throw error;
      setDone(true);
      toast.success("Thank you! We'll reach out with payment details.");
    } catch (e: any) {
      toast.error(e?.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteLayout>
      <section className="pt-14 pb-10">
        <div className="container-wide text-center max-w-3xl mx-auto">
          <span className="eyebrow">{pv(c, "hero.eyebrow", "Give with purpose")}</span>
          <h1 className="font-display text-5xl md:text-6xl mt-5 leading-[1.02] text-primary">
            {pv(c, "hero.title", "Every cedi becomes someone's hope.")}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            {pv(c, "hero.description", "98% of every donation goes directly to programs. All amounts are in Ghana Cedis (GH₵).")}
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="container-wide grid lg:grid-cols-[1.1fr_1fr] gap-8">
          <form onSubmit={submit} className="soft-card p-8">
            <h3 className="font-display text-2xl text-primary">Make a donation</h3>
            <div className="mt-6 inline-flex p-1 rounded-lg bg-secondary">
              {(["monthly", "once"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFreq(f)}
                  className={`px-5 py-2 rounded-md text-sm font-medium capitalize transition ${
                    freq === f ? "bg-primary text-primary-foreground" : "text-foreground/70"
                  }`}
                >
                  {f === "once" ? "One-time" : "Monthly"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-2 mt-6">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(a)}
                  className={`rounded-lg border py-3 font-display text-lg transition ${
                    amount === a
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  GH₵{a}
                </button>
              ))}
            </div>
            <div className="relative mt-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">GH₵</span>
              <input
                type="number"
                value={amount}
                min={1}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-lg border border-border pl-14 pr-5 py-3.5 text-lg outline-none focus:border-primary"
                placeholder="Other amount"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-primary" />
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Message (optional)" className="mt-3 w-full rounded-lg border border-border px-4 py-3 text-sm outline-none focus:border-primary" />

            <div className="mt-6 rounded-lg bg-secondary p-5 text-sm leading-relaxed">
              Your <b className="text-primary">GH₵{amount} {freq === "monthly" ? "/ month" : "gift"}</b>{" "}
              can provide {Math.max(1, Math.floor(amount / 5))} nutritious meals,{" "}
              {Math.max(1, Math.floor(amount / 25))} weeks of schooling, or a share of a family's monthly essentials.
            </div>

            <button disabled={submitting || done} type="submit" className="mt-6 w-full rounded-lg bg-primary text-primary-foreground py-4 font-medium hover:bg-forest transition inline-flex items-center justify-center gap-2 disabled:opacity-60">
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Heart className="size-4" />}
              {done ? "Received — thank you!" : `Donate GH₵${amount}${freq === "monthly" ? " monthly" : ""}`}
            </button>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Once submitted, we'll email you Mobile Money (MTN, Vodafone) and bank transfer details.
            </p>
          </form>

          <div className="space-y-4">
            <div className="soft-card p-6">
              <h4 className="font-display text-xl text-primary">Choose your impact</h4>
              <p className="text-sm text-muted-foreground mt-2">Every gift supports a child, a family, or a community through practical, lasting programs.</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-primary">
                One simple way to support
              </div>
            </div>
            {[
              ["Transparent", "Independently audited every year — see the numbers on our impact page."],
              ["Efficient", "98 pesewas of every cedi reaches programs; 2 pesewas keep the lights on."],
              ["Local", "Delivered by community teams — the people your gift serves."],
            ].map(([t, d]) => (
              <div key={t} className="soft-card p-5">
                <Check className="size-5 text-gold" />
                <h4 className="font-display text-lg text-primary mt-2">{t}</h4>
                <p className="text-sm text-muted-foreground mt-1.5">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

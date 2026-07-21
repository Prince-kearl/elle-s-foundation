import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Heart, GraduationCap, Utensils, Home, Check } from "lucide-react";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — Elle's Foundation" },
      { name: "description", content: "Your gift restores dignity. Give once, monthly, or sponsor a child — 98% of every donation goes directly to programs." },
      { property: "og:title", content: "Donate to Elle's Foundation" },
      { property: "og:description", content: "Every gift becomes a meal, a schoolbook, a clinic visit, a safer home." },
      { property: "og:url", content: "/donate" },
    ],
    links: [{ rel: "canonical", href: "/donate" }],
  }),
  component: Donate,
});

const tiers = [
  { i: Utensils, t: "Sponsor Meals", d: "Feed 30 children for a week.", amount: 45 },
  { i: GraduationCap, t: "Sponsor Education", d: "One month of school for a child.", amount: 60 },
  { i: Home, t: "Sponsor Shelter", d: "Home repairs for one family.", amount: 120 },
  { i: Heart, t: "Sponsor a Child", d: "Full monthly support — meals, school & care.", amount: 40 },
];

function Donate() {
  const [freq, setFreq] = useState<"once" | "monthly">("monthly");
  const [amount, setAmount] = useState(60);

  return (
    <SiteLayout>
      <section className="pt-14 pb-10">
        <div className="container-wide text-center max-w-3xl mx-auto">
          <span className="eyebrow">Give with purpose</span>
          <h1 className="font-display text-5xl md:text-6xl mt-5 leading-[1.02] text-primary">
            Every gift becomes <span className="italic text-earth">someone's</span> hope.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            98% of every donation goes directly to programs. The rest keeps the
            lights on so we can keep showing up.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="container-wide grid lg:grid-cols-[1.1fr_1fr] gap-8">
          <div className="soft-card p-8">
            <h3 className="font-display text-2xl text-primary">Make a donation</h3>
            <div className="mt-6 inline-flex p-1 rounded-full bg-secondary">
              {(["monthly", "once"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFreq(f)}
                  className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition ${
                    freq === f ? "bg-primary text-primary-foreground" : "text-foreground/70"
                  }`}
                >
                  {f === "once" ? "One-time" : "Monthly"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-3 mt-6">
              {[25, 50, 100, 250].map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(a)}
                  className={`rounded-xl border py-4 font-display text-xl transition ${
                    amount === a
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  ${a}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-4 w-full rounded-xl border border-border px-5 py-4 text-lg outline-none focus:border-primary"
              placeholder="Other amount"
            />

            <div className="mt-6 rounded-2xl bg-secondary p-5 text-sm leading-relaxed">
              Your <b className="text-primary">${amount} {freq === "monthly" ? "/ month" : "gift"}</b>{" "}
              can provide {Math.max(1, Math.floor(amount / 3))} nutritious meals,{" "}
              {Math.max(1, Math.floor(amount / 15))} weeks of schooling, or a share of a
              family's monthly essentials.
            </div>

            <button className="mt-6 w-full rounded-full bg-primary text-primary-foreground py-4 font-medium hover:bg-forest transition inline-flex items-center justify-center gap-2">
              <Heart className="size-4" /> Donate ${amount}{freq === "monthly" ? " monthly" : ""}
            </button>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Secure payments via Visa, Mastercard, and Mobile Money.
            </p>
          </div>

          <div className="space-y-4">
            {tiers.map(({ i: Icon, t, d, amount }) => (
              <button
                key={t}
                onClick={() => setAmount(amount)}
                className="w-full soft-card soft-card-hover p-5 flex items-center gap-4 text-left"
              >
                <div className="size-12 rounded-xl bg-primary/10 grid place-items-center text-primary shrink-0">
                  <Icon className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="font-display text-lg text-primary">{t}</div>
                  <div className="text-sm text-muted-foreground">{d}</div>
                </div>
                <div className="font-display text-xl text-primary">${amount}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-wide grid md:grid-cols-3 gap-6">
          {[
            ["Transparent", "Independently audited every year — see the numbers on our impact page."],
            ["Efficient", "98¢ of every dollar reaches programs; 2¢ keeps the lights on."],
            ["Local", "Delivered by community teams — the people your gift serves."],
          ].map(([t, d]) => (
            <div key={t} className="soft-card p-6">
              <Check className="size-5 text-gold" />
              <h4 className="font-display text-xl text-primary mt-3">{t}</h4>
              <p className="text-sm text-muted-foreground mt-2">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

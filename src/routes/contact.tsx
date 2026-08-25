import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { usePageContent, pv } from "@/lib/page-content";
import { useSiteSettings } from "@/lib/cms";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Elle's Foundation" },
      {
        name: "description",
        content:
          "Get in touch to volunteer, partner, or learn more about our work across communities.",
      },
      { property: "og:title", content: "Contact Elle's Foundation" },
      {
        property: "og:description",
        content: "Volunteer, partner, or ask a question — we'd love to hear from you.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const { data: c } = usePageContent("contact");
  const { data: settings } = useSiteSettings();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("Volunteering");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const { error } = await supabase
      .from("contact_submissions")
      .insert({ name, email, interest, message });
    setBusy(false);
    if (error) return toast.error(error.message);
    setName("");
    setEmail("");
    setMessage("");
    toast.success("Message sent — thank you.");
  };
  return (
    <SiteLayout>
      <section className="pt-14 pb-10">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <span className="eyebrow">{pv(c, "hero.eyebrow", "Contact Us")}</span>
          <h1 className="font-display text-5xl md:text-6xl mt-5 leading-[1.02] text-primary">
            {pv(c, "hero.title", "Let's build something lasting together.")}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            {pv(
              c,
              "hero.description",
              "Volunteer, partner, or simply say hello. Our team responds within one business day.",
            )}
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="container-wide grid lg:grid-cols-[1fr_1.3fr] gap-8">
          <div className="space-y-4">
            {[
              {
                i: Mail,
                t: "Email",
                v: settings?.email || pv(c, "info.email", "info@ellefoundation.org"),
              },
              {
                i: Phone,
                t: "Phone",
                v: settings?.phone || pv(c, "info.phone", "+233 55 123 4567"),
              },
              {
                i: MapPin,
                t: "Office",
                v: settings?.address || pv(c, "info.office", "Accra, Ghana · Open Mon–Fri"),
              },
            ].map(({ i: Icon, t, v }) => (
              <div key={t} className="soft-card p-5 flex items-center gap-4">
                <div className="size-12 rounded-xl bg-primary/10 grid place-items-center text-primary">
                  <Icon className="size-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{t}</div>
                  <div className="font-medium mt-0.5">{v}</div>
                </div>
              </div>
            ))}
          </div>

          <form className="soft-card p-8" onSubmit={submit}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-2 w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-primary"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  type="email"
                  className="mt-2 w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-primary"
                  placeholder="you@email.com"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">I'm interested in</label>
              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="mt-2 w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-primary bg-card"
              >
                <option>Volunteering</option>
                <option>Partnerships</option>
                <option>Donations & sponsorship</option>
                <option>Press & media</option>
                <option>Something else</option>
              </select>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="mt-2 w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-primary"
                placeholder="Tell us a little about how you'd like to get involved…"
              />
            </div>
            <button
              disabled={busy}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3.5 font-medium disabled:opacity-60"
            >
              <Send className="size-4" /> {busy ? "Sending…" : "Send message"}
            </button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Elle's Foundation" },
      { name: "description", content: "Terms that apply when you use the Elle's Foundation website." },
    ],
  }),
  component: TermsOfUse,
});

function TermsOfUse() {
  return (
    <SiteLayout>
      <main className="bg-[var(--background)]">
        <section className="section-y-sm border-b border-[var(--primary)]/10 bg-[var(--forest)] text-white">
          <div className="container-wide max-w-4xl">
            <p className="mb-5 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[var(--sand)]">Support & legal</p>
            <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-7xl">Terms of use</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70">The basic terms for using Elle’s Foundation’s website, content, forms, and online services.</p>
          </div>
        </section>
        <section className="section-y">
          <div className="container-wide max-w-4xl space-y-10 text-[var(--ink)]">
            <PolicySection title="Using this website">You may use this website for lawful, personal, and informational purposes. Please use the forms and online services honestly and do not interfere with the website, attempt unauthorized access, or use automated activity in a way that could disrupt the service.</PolicySection>
            <PolicySection title="Website content">Unless otherwise stated, the text, visual identity, layout, and original materials on this website belong to Elle’s Foundation or are used with permission. You may share links to our pages, but please do not reproduce, alter, or commercially use our materials without written permission.</PolicySection>
            <PolicySection title="Donations and submissions">Donation, sponsorship, event, newsletter, and contact forms are provided to help us coordinate support and engagement. Submitting a form does not guarantee acceptance, registration, funding, or a particular response. Payment processing may be handled by third-party providers under their own terms.</PolicySection>
            <PolicySection title="Third-party services and links">The website may link to external services or social platforms. Those services are operated independently, and their availability, content, and privacy practices are governed by their own terms and policies.</PolicySection>
            <PolicySection title="Accuracy and availability">We aim to keep the website accurate and available, but information may change and uninterrupted access cannot be guaranteed. Programme details, event dates, donation instructions, and other information should be confirmed with our team when timing or accuracy is important.</PolicySection>
            <PolicySection title="Changes and termination">We may update website content or these terms as our work and services evolve. Continued use of the website after an update means you accept the revised terms. We may restrict access where necessary to protect the website, our community, or our services.</PolicySection>
            <PolicySection title="Contact">Questions about these terms can be sent through the <a href="/contact" class="font-semibold text-[var(--primary)] underline underline-offset-4">contact page</a>.</PolicySection>
            <p className="border-t border-[var(--primary)]/10 pt-6 text-sm text-[var(--ink)]/55">Last updated: August 29, 2026</p>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}

function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-[var(--forest)] md:text-3xl">{title}</h2>
      <p className="mt-3 text-base leading-8 text-[var(--ink)]/75">{children}</p>
    </section>
  );
}

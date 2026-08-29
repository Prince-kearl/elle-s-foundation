import type { ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Elle's Foundation" },
      { name: "description", content: "How Elle's Foundation handles information shared through this website." },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <SiteLayout>
      <main className="bg-[var(--background)]">
        <section className="section-y-sm border-b border-[var(--primary)]/10 bg-[var(--forest)] text-white">
          <div className="container-wide max-w-4xl">
            <p className="mb-5 text-[0.66rem] font-bold uppercase tracking-[0.22em] text-[var(--sand)]">Support & legal</p>
            <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-[-0.05em] md:text-7xl">Privacy policy</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70">A clear explanation of how we handle information shared with Elle’s Foundation through this website.</p>
          </div>
        </section>
        <section className="section-y">
          <div className="container-wide max-w-4xl space-y-10 text-[var(--ink)]">
            <PolicySection title="Information you choose to share">When you contact us, register for an event, subscribe to updates, volunteer, donate, or submit a sponsorship enquiry, we may receive the details you provide, such as your name, email address, phone number, message, and transaction-related information.</PolicySection>
            <PolicySection title="How we use information">We use submitted information to respond to enquiries, administer registrations and donations, provide requested updates, coordinate programmes and events, maintain our records, and improve the website and our services.</PolicySection>
            <PolicySection title="Sharing and service providers">We do not sell personal information. We may share information with trusted service providers that help us operate the website, process communications, manage event registrations, or process payments. These providers should only use information for the services they provide to us.</PolicySection>
            <PolicySection title="Website analytics and cookies">The website may use essential storage or similar technologies to remember preferences and keep core features working. If analytics tools are enabled, they help us understand aggregated website usage and improve the experience.</PolicySection>
            <PolicySection title="Keeping information secure">We use reasonable administrative and technical measures to protect information. No internet transmission or storage system can be guaranteed to be completely secure, so please avoid sending sensitive information through general contact forms.</PolicySection>
            <PolicySection title="Your choices">You may contact us to ask about information you have submitted, request correction of inaccurate details, or opt out of non-essential communications. Some records may need to be retained where required for legitimate operational, accounting, or legal purposes.</PolicySection>
            <PolicySection title="Contact">For privacy questions or requests, please use the <a href="/contact" className="font-semibold text-[var(--primary)] underline underline-offset-4">contact form</a> and select the most relevant enquiry type.</PolicySection>
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

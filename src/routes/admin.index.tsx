import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, AdminCard, Badge } from "@/components/admin/AdminLayout";
import { useAdminList } from "@/lib/cms";
import type { Program, Story, TeamMember, ContactSub, DonationIntent, Faq, Testimonial } from "@/lib/cms";
import { HeartHandshake, Users, MessageSquare, Inbox, Heart, HelpCircle, ImageIcon, TrendingUp } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Elle's Foundation Admin" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

function Dashboard() {
  const programs = useAdminList<Program>("programs");
  const stories = useAdminList<Story>("stories");
  const team = useAdminList<TeamMember>("team_members");
  const testimonials = useAdminList<Testimonial>("testimonials");
  const faqs = useAdminList<Faq>("faqs");
  const contacts = useAdminList<ContactSub>("contact_submissions");
  const donations = useAdminList<DonationIntent>("donation_intents");

  const stats = [
    { label: "Programs", value: programs.data?.length ?? 0, icon: HeartHandshake, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Stories", value: stories.data?.length ?? 0, icon: ImageIcon, tone: "bg-blue-50 text-blue-600" },
    { label: "Team Members", value: team.data?.length ?? 0, icon: Users, tone: "bg-purple-50 text-purple-600" },
    { label: "Testimonials", value: testimonials.data?.length ?? 0, icon: MessageSquare, tone: "bg-amber-50 text-amber-600" },
  ];
  const inbox = [
    { label: "New Messages", value: contacts.data?.filter((c) => !c.handled).length ?? 0, sub: `${contacts.data?.length ?? 0} total`, icon: Inbox, to: "/admin/contacts" as const },
    { label: "Donation Intents", value: donations.data?.length ?? 0, sub: `$${(donations.data ?? []).reduce((s, d) => s + Number(d.amount || 0), 0).toFixed(2)} total`, icon: Heart, to: "/admin/donations" as const },
    { label: "FAQs", value: faqs.data?.length ?? 0, sub: "questions answered", icon: HelpCircle, to: "/admin/faqs" as const },
  ];

  return (
    <AdminLayout title="Dashboard Overview" subtitle="Welcome back to your command center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <AdminCard key={s.label} className="p-5 flex items-center gap-4">
            <div className={`size-12 rounded-xl grid place-items-center ${s.tone}`}>
              <s.icon className="size-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-[#6B7280]">{s.label}</div>
              <div className="font-display text-3xl text-[#111827] mt-0.5">{s.value}</div>
            </div>
          </AdminCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {inbox.map((s) => (
          <Link key={s.label} to={s.to} className="block">
            <AdminCard className="p-5 hover:border-primary/40 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-[#F5EFE5] text-primary grid place-items-center">
                    <s.icon className="size-4" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-[#111827]">{s.value}</div>
                    <div className="text-xs uppercase tracking-wider text-[#6B7280]">{s.label}</div>
                  </div>
                </div>
                <Badge tone="brand">View</Badge>
              </div>
              <div className="text-xs text-[#6B7280] mt-3">{s.sub}</div>
            </AdminCard>
          </Link>
        ))}
      </div>

      <AdminCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="size-4 text-primary" />
          <h3 className="font-display text-xl">Recent activity</h3>
        </div>
        <ul className="divide-y divide-[#F3F4F6]">
          {(contacts.data ?? []).slice(0, 5).map((c) => (
            <li key={c.id} className="py-3 flex items-center justify-between text-sm">
              <div>
                <div className="font-medium">{c.name} <span className="text-[#6B7280] font-normal">· {c.email}</span></div>
                <div className="text-xs text-[#6B7280] line-clamp-1">{c.message}</div>
              </div>
              <span className="text-xs text-[#6B7280]">{new Date(c.created_at).toLocaleDateString()}</span>
            </li>
          ))}
          {(contacts.data?.length ?? 0) === 0 && (
            <li className="py-6 text-center text-sm text-[#6B7280]">No contact messages yet.</li>
          )}
        </ul>
      </AdminCard>
    </AdminLayout>
  );
}

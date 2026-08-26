import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout, AdminCard, Badge } from "@/components/admin/AdminLayout";
import { useAdminList } from "@/lib/cms";
import type { Program, Story, TeamMember, ContactSub, DonationIntent, Faq, Testimonial, EventRecord, EventRsvp } from "@/lib/cms";
import { HeartHandshake, Users, MessageSquare, Inbox, Heart, HelpCircle, ImageIcon, TrendingUp, CalendarDays, ClipboardList } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Download } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Elle's Foundation Admin" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

const DASHBOARD_TABLES = [
  "programs",
  "stories",
  "team_members",
  "testimonials",
  "faqs",
  "contact_submissions",
  "donation_intents",
  "events",
  "event_rsvps",
] as const;

function Dashboard() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel("admin-dashboard-metrics");
    DASHBOARD_TABLES.forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => void queryClient.invalidateQueries({ queryKey: ["a", table] }),
      );
    });
    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const programs = useAdminList<Program>("programs");
  const stories = useAdminList<Story>("stories");
  const team = useAdminList<TeamMember>("team_members");
  const testimonials = useAdminList<Testimonial>("testimonials");
  const faqs = useAdminList<Faq>("faqs");
  const contacts = useAdminList<ContactSub>("contact_submissions");
  const donations = useAdminList<DonationIntent>("donation_intents");
  const events = useAdminList<EventRecord>("events");
  const rsvps = useAdminList<EventRsvp>("event_rsvps");

  const stats = [
    { label: "Programs", value: programs.data?.length ?? 0, icon: HeartHandshake, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Stories", value: stories.data?.length ?? 0, icon: ImageIcon, tone: "bg-blue-50 text-blue-600" },
    { label: "Team Members", value: team.data?.length ?? 0, icon: Users, tone: "bg-purple-50 text-purple-600" },
    { label: "Testimonials", value: testimonials.data?.length ?? 0, icon: MessageSquare, tone: "bg-amber-50 text-amber-600" },
    { label: "Upcoming Events", value: (events.data ?? []).filter((event) => event.status === "published" && event.visible).length, icon: CalendarDays, tone: "bg-orange-50 text-orange-600" },
    { label: "Event RSVPs", value: rsvps.data?.length ?? 0, icon: ClipboardList, tone: "bg-cyan-50 text-cyan-600" },
  ];
  const inbox = [
    { label: "New Messages", value: contacts.data?.filter((c) => !c.handled).length ?? 0, sub: `${contacts.data?.length ?? 0} total`, icon: Inbox, to: "/admin/contacts" as const },
    { label: "Donation Intents", value: donations.data?.length ?? 0, sub: `${formatCurrency((donations.data ?? []).reduce((s, d) => s + Number(d.amount || 0), 0))} total`, icon: Heart, to: "/admin/donations" as const },
    { label: "FAQs", value: faqs.data?.length ?? 0, sub: "questions answered", icon: HelpCircle, to: "/admin/faqs" as const },
  ];
  const chart = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const amount = (donations.data ?? []).filter((item) => {
      const value = new Date(item.created_at);
      return value.getMonth() === date.getMonth() && value.getFullYear() === date.getFullYear();
    }).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return { month: date.toLocaleDateString("en-GH", { month: "short" }), amount };
  });
  const exportDonations = () => {
    const rows = [["Name", "Email", "Amount (GHS)", "Frequency", "Status", "Date"], ...(donations.data ?? []).map((item) => [item.name ?? "", item.email ?? "", item.amount, item.frequency, item.status, item.created_at])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "elles-foundation-donations.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <AdminLayout title="Dashboard Overview" subtitle="Welcome back to your command center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
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

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr] mb-6">
        <AdminCard className="p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div><h3 className="font-display text-xl">Donation trend</h3><p className="text-xs text-[#6B7280]">Pledged amount in Ghana cedis · last six months</p></div>
            <button onClick={exportDonations} className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-semibold"><Download className="size-4" /> CSV</button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}><defs><linearGradient id="donationFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--primary)" stopOpacity={0.28}/><stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--border)"/><XAxis dataKey="month" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false}/><Tooltip formatter={(value) => formatCurrency(Number(value))}/><Area type="monotone" dataKey="amount" stroke="var(--primary)" fill="url(#donationFill)" strokeWidth={2}/></AreaChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>
        <AdminCard className="p-6">
          <h3 className="font-display text-xl">Reporting</h3>
          <p className="mt-2 text-sm text-[#6B7280]">Export donation records for reconciliation and impact reporting.</p>
          <div className="mt-6 text-3xl font-display text-primary">{formatCurrency((donations.data ?? []).reduce((sum, item) => sum + Number(item.amount || 0), 0))}</div>
          <div className="text-xs uppercase tracking-wider text-[#6B7280]">Total pledged</div>
          <button onClick={exportDonations} className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white"><Download className="size-4" /> Export donations</button>
        </AdminCard>
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

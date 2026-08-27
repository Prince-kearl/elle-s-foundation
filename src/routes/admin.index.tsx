import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout, AdminCard, Badge } from "@/components/admin/AdminLayout";
import { useAdminList } from "@/lib/cms";
import type { Stat, Program, Story, TeamMember, ContactSub, DonationIntent, Faq, Testimonial, EventRecord, EventRsvp } from "@/lib/cms";
import { HeartHandshake, Users, MessageSquare, Inbox, Heart, HelpCircle, ImageIcon, TrendingUp, CalendarDays, ClipboardList, CheckCircle } from "lucide-react";
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
  "rsvp_email_confirmations",
] as const;

function DonationTrendTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-[#d9e7df] bg-[#123d31] px-3 py-2.5 text-white shadow-xl">
      <div className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#cfe8d8]">{label}</div>
      <div className="mt-1 text-sm font-bold">{formatCurrency(Number(payload[0]?.value ?? 0))}</div>
    </div>
  );
}

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

  const cmsStats = useAdminList<Stat>("stats");
  const programs = useAdminList<Program>("programs");
  const stories = useAdminList<Story>("stories");
  const team = useAdminList<TeamMember>("team_members");
  const testimonials = useAdminList<Testimonial>("testimonials");
  const faqs = useAdminList<Faq>("faqs");
  const contacts = useAdminList<ContactSub>("contact_submissions");
  const donations = useAdminList<DonationIntent>("donation_intents");
  const events = useAdminList<EventRecord>("events");
  const rsvps = useAdminList<EventRsvp>("event_rsvps");

  const kpiDefinitions = [
    { label: "Children Supported", key: "children supported", icon: Users, topBorder: "border-t-[#e4c39e]", iconTone: "bg-[#fbf7f1] text-[#dcb987]" },
    { label: "Communities Reached", key: "communities reached", icon: HeartHandshake, topBorder: "border-t-[#0f9d73]", iconTone: "bg-[#edf9f3] text-[#0f9d73]" },
    { label: "Volunteers", key: "volunteers", icon: Heart, topBorder: "border-t-[#d9b294]", iconTone: "bg-[#fcf6f2] text-[#d9b294]" },
    { label: "Projects Completed", key: "projects completed", icon: CheckCircle, topBorder: "border-t-[#208db2]", iconTone: "bg-[#eef7fb] text-[#208db2]" },
  ] as const;
  const kpis = kpiDefinitions.map((definition) => {
    const record = (cmsStats.data ?? []).find((item) => item.label.trim().toLowerCase() === definition.key);
    return { ...definition, value: record?.value ?? "—" };
  });
  const inbox = [
    { label: "New Messages", value: contacts.data?.filter((c) => !c.handled).length ?? 0, sub: `${contacts.data?.length ?? 0} total`, icon: Inbox, to: "/admin/contacts" as const },
    { label: "Donation Intents", value: donations.data?.length ?? 0, sub: `${formatCurrency((donations.data ?? []).reduce((s, d) => s + Number(d.amount || 0), 0))} total`, icon: Heart, to: "/admin/donations" as const },
    { label: "FAQs", value: faqs.data?.length ?? 0, sub: "questions answered", icon: HelpCircle, to: "/admin/faqs" as const },
  ];
  const [donationPeriod, setDonationPeriod] = useState<"week" | "month" | "year">("month");
  const periodConfig = {
    week: { count: 5, label: "Monday to Friday", unit: "weekday" },
    month: { count: 12, label: "January to December", unit: "month" },
    year: { count: 5, label: "last five years", unit: "year" },
  } as const;
  const selectedPeriod = periodConfig[donationPeriod];
  const periodStart = new Date();
  periodStart.setHours(0, 0, 0, 0);
  if (donationPeriod === "week") {
    const day = periodStart.getDay();
    periodStart.setDate(periodStart.getDate() - (day === 0 ? 6 : day - 1));
  }
  if (donationPeriod === "month") {
    periodStart.setMonth(0, 1);
  }
  if (donationPeriod === "year") {
    periodStart.setFullYear(periodStart.getFullYear() - (selectedPeriod.count - 1), 0, 1);
  }
  const chart = Array.from({ length: selectedPeriod.count }, (_, index) => {
    const date = new Date();
    if (donationPeriod === "week") {
      const day = date.getDay();
      date.setDate(date.getDate() - (day === 0 ? 6 : day - 1) + index);
    }
    if (donationPeriod === "month") date.setMonth(index, 1);
    if (donationPeriod === "year") date.setFullYear(date.getFullYear() - (selectedPeriod.count - 1 - index), 0, 1);
    const amount = (donations.data ?? []).filter((item) => {
      const value = new Date(item.created_at);
      if (donationPeriod === "week") {
        return value.getFullYear() === date.getFullYear()
          && value.getMonth() === date.getMonth()
          && value.getDate() === date.getDate();
      }
      if (donationPeriod === "month") return value.getMonth() === date.getMonth() && value.getFullYear() === date.getFullYear();
      return value.getFullYear() === date.getFullYear();
    }).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const label = donationPeriod === "week"
      ? date.toLocaleDateString("en-GH", { weekday: "long" })
      : donationPeriod === "month"
        ? date.toLocaleDateString("en-GH", { month: "long" })
        : date.toLocaleDateString("en-GH", { year: "numeric" });
    return { period: label, amount };
  });
  const chartRangeTotal = chart.reduce((sum, item) => sum + item.amount, 0);
  const chartPeak = Math.max(...chart.map((item) => item.amount), 0);
  const exportDonations = () => {
    const rows = [["Name", "Email", "Amount (GHS)", "Frequency", "Status", "Date"], ...(donations.data ?? []).filter((item) => new Date(item.created_at) >= periodStart).map((item) => [item.name ?? "", item.email ?? "", item.amount, item.frequency, item.status, item.created_at])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "elles-foundation-donations.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <AdminLayout title="Dashboard Overview" subtitle="Welcome back to your command center">
      <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <AdminCard key={kpi.label} className={`min-h-[128px] rounded-none border border-[#d5dfd7] border-t-4 bg-white p-5 sm:p-6 ${kpi.topBorder}`}>
            <div className="flex h-full items-start justify-between gap-4">
              <div className="self-end">
                <div className="font-display text-4xl leading-none text-[#073b2b] sm:text-[2.65rem]">{kpi.value}</div>
                <div className="mt-3 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#587268]">{kpi.label}</div>
              </div>
              <span className={`grid size-10 shrink-0 place-items-center ${kpi.iconTone}`}>
                <kpi.icon className="size-4" strokeWidth={1.7} />
              </span>
            </div>
          </AdminCard>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr] mb-6">
        <AdminCard className="overflow-hidden border-[#dfe6e1] bg-white p-0">
          <div className="border-b border-[#edf1ee] px-5 pb-5 pt-5 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="size-2 bg-primary" />
                  <h3 className="font-display text-xl text-[#123d31]">Donation trend</h3>
                </div>
                <p className="mt-1 text-xs text-[#71857c]">Pledged amount in Ghana cedis · {selectedPeriod.label}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex border border-[#dfe6e1] bg-[#f8fbf8] p-1" role="group" aria-label="Donation trend period">
                  {(["week", "month", "year"] as const).map((period) => (
                    <button key={period} type="button" onClick={() => setDonationPeriod(period)} className={`px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] transition ${donationPeriod === period ? "bg-primary text-white shadow-sm" : "text-[#6B7F75] hover:bg-white hover:text-primary"}`}>
                      {period}
                    </button>
                  ))}
                </div>
                <button onClick={exportDonations} className="inline-flex items-center gap-2 border border-[#dfe6e1] bg-white px-3 py-2 text-xs font-semibold text-[#315d4d] transition hover:border-primary/40 hover:bg-[#f8fbf8]"><Download className="size-4" /> CSV</button>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <div className="border border-[#e6eee9] bg-[#f8fbf8] px-3 py-2">
                <div className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#8ba096]">Range total</div>
                <div className="mt-0.5 text-sm font-bold text-[#123d31]">{formatCurrency(chartRangeTotal)}</div>
              </div>
              <div className="border border-[#e6eee9] bg-[#f8fbf8] px-3 py-2">
                <div className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#8ba096]">Peak period</div>
                <div className="mt-0.5 text-sm font-bold text-[#123d31]">{formatCurrency(chartPeak)}</div>
              </div>
            </div>
          </div>
          <div className="h-72 bg-gradient-to-b from-[#fbfefb] to-white px-2 pb-4 pt-5 sm:px-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 8, right: 10, left: 4, bottom: donationPeriod === "month" ? 24 : 8 }}>
                <defs>
                  <linearGradient id="donationFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.32} />
                    <stop offset="78%" stopColor="var(--primary)" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e4ece7" strokeDasharray="4 6" />
                <XAxis dataKey="period" interval={0} tickLine={false} axisLine={false} tick={{ fill: "#789087", fontSize: 10 }} tickMargin={12} angle={donationPeriod === "month" ? -32 : 0} textAnchor={donationPeriod === "month" ? "end" : "middle"} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#789087", fontSize: 10 }} tickMargin={8} width={42} />
                <Tooltip content={<DonationTrendTooltip />} cursor={{ stroke: "var(--primary)", strokeOpacity: 0.2, strokeDasharray: "4 4" }} />
                <Area type="monotone" dataKey="amount" stroke="var(--primary)" fill="url(#donationFill)" strokeWidth={2.5} strokeLinecap="round" dot={{ r: 3.5, fill: "var(--primary)", stroke: "#ffffff", strokeWidth: 2 }} activeDot={{ r: 5, fill: "var(--gold)", stroke: "#123d31", strokeWidth: 2 }} connectNulls />
              </AreaChart>
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

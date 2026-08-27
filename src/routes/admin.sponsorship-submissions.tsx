import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminCard, AdminLayout, Badge } from "@/components/admin/AdminLayout";
import { useAdminList, useUpsert } from "@/lib/cms";
import type { DonationIntent, Sponsorship } from "@/lib/cms";
import { Download, HeartHandshake, Search, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/admin/sponsorship-submissions")({
  head: () => ({ meta: [{ title: "Sponsorship Submissions — Admin" }, { name: "robots", content: "noindex" }] }),
  component: SponsorshipSubmissionsAdmin,
});

type PaymentStatus = "pending" | "completed" | "cancelled";

function SponsorshipSubmissionsAdmin() {
  const { data: donations, isLoading } = useAdminList<DonationIntent>("donation_intents", "created_at");
  const { data: tiers } = useAdminList<Sponsorship>("sponsorships", "position");
  const update = useUpsert("donation_intents");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>("all");

  const tierMap = useMemo(() => new Map((tiers ?? []).map((tier) => [tier.id, tier])), [tiers]);
  const submissions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (donations ?? [])
      .filter((row) => Boolean(row.sponsorship_id))
      .filter((row) => statusFilter === "all" || row.status === statusFilter)
      .filter((row) => {
        if (!query) return true;
        const tier = tierMap.get(row.sponsorship_id ?? "");
        return [row.name, row.email, row.phone, row.note, tier?.title].some((value) => String(value ?? "").toLowerCase().includes(query));
      })
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  }, [donations, search, statusFilter, tierMap]);

  const total = submissions.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const pending = submissions.filter((row) => row.status === "pending").length;
  const completed = submissions.filter((row) => row.status === "completed").length;

  function exportCsv() {
    const headers = ["Donor", "Email", "Mobile", "Tier", "Amount (GHS)", "Frequency", "Payment status", "Note", "Submitted at"];
    const body = submissions.map((row) => {
      const tier = tierMap.get(row.sponsorship_id ?? "");
      return [row.name ?? "", row.email ?? "", row.phone ?? "", tier?.title ?? "Unknown tier", String(row.amount ?? ""), row.frequency, row.status, row.note ?? "", new Date(row.created_at).toISOString()];
    });
    const csv = [headers, ...body].map((line) => line.map(csvEscape).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `elles-foundation-sponsorship-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Sponsorship submissions exported");
  }

  return (
    <AdminLayout title="Sponsorship Submissions" subtitle="Track incoming sponsorship requests and payment progress.">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <label className="relative block flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search donor, email, phone, or tier" className="w-full border border-[#E5E7EB] bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary" />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | PaymentStatus)} className="border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-primary">
            <option value="all">All payment statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button onClick={exportCsv} disabled={!submissions.length} className="inline-flex items-center justify-center gap-2 border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--primary)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50">
          <Download className="size-4" /> Export CSV
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Metric icon={HeartHandshake} label="Sponsorship requests" value={submissions.length} />
        <Metric icon={WalletCards} label="Pending payment" value={pending} />
        <Metric icon={HeartHandshake} label="Completed value" value={formatCurrency(submissions.filter((row) => row.status === "completed").reduce((sum, row) => sum + Number(row.amount || 0), 0))} detail={`${completed} completed · ${formatCurrency(total)} filtered total`} />
      </div>

      <AdminCard>
        {isLoading ? (
          <div className="p-10 text-center text-sm text-[#6B7280]">Loading sponsorship submissions…</div>
        ) : submissions.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#6B7280]">No sponsorship submissions match the current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#EEF0F3]">
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#6B7280]">
                  <th className="px-6 py-3">Donor</th>
                  <th className="px-6 py-3">Tier</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Payment status</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {submissions.map((row) => {
                  const tier = tierMap.get(row.sponsorship_id ?? "");
                  return (
                    <tr key={row.id} className="hover:bg-[#FAFAFB]">
                      <td className="px-6 py-3">
                        <div className="font-semibold">{row.name ?? "Anonymous"}</div>
                        <div className="text-xs text-[#6B7280]">{row.email ?? "—"} · {row.phone ?? "No mobile"}</div>
                      </td>
                      <td className="px-6 py-3"><div className="font-medium text-primary">{tier?.title ?? "Unknown tier"}</div><div className="text-xs text-[#6B7280]">{row.frequency}</div></td>
                      <td className="px-6 py-3 font-display text-lg text-primary">{formatCurrency(row.amount)}</td>
                      <td className="px-6 py-3">
                        <select value={row.status as PaymentStatus} onChange={async (event) => { try { await update.mutateAsync({ id: row.id, status: event.target.value }); toast.success("Payment status updated"); } catch (error: any) { toast.error(error?.message ?? "Could not update payment status"); } }} className="border border-[#E5E7EB] bg-white px-2 py-1.5 text-xs font-semibold outline-none focus:border-primary">
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-3 text-xs text-[#6B7280]">{new Date(row.created_at).toLocaleDateString()}</td>
                      <td className="max-w-[240px] px-6 py-3 text-xs text-[#6B7280]"><span className="line-clamp-2">{row.note || "—"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </AdminLayout>
  );
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof HeartHandshake; label: string; value: string | number; detail?: string }) {
  return <AdminCard className="p-5"><div className="flex items-center gap-3"><div className="grid size-11 place-items-center bg-[#F5EFE5] text-primary"><Icon className="size-5" /></div><div><div className="text-xs uppercase tracking-wider text-[#6B7280]">{label}</div><div className="font-display text-2xl text-[#123d31]">{value}</div>{detail && <div className="mt-1 text-[11px] text-[#6B7280]">{detail}</div>}</div></div></AdminCard>;
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, AdminCard, Badge } from "@/components/admin/AdminLayout";
import { useAdminList, useUpsert, useDelete } from "@/lib/cms";
import type { DonationIntent } from "@/lib/cms";
import { Download, Trash2, Heart, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/admin/donations")({
  head: () => ({ meta: [{ title: "Donations — Admin" }, { name: "robots", content: "noindex" }] }),
  component: DonationsAdmin,
});

function DonationsAdmin() {
  const { data, isLoading } = useAdminList<DonationIntent>("donation_intents", "created_at");
  const upsert = useUpsert("donation_intents");
  const del = useDelete("donation_intents");
  const rows = (data ?? []).slice().sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  const total = rows.reduce((s, d) => s + Number(d.amount || 0), 0);
  const monthly = rows.filter((r) => r.frequency === "monthly").length;

  function exportCsv() {
    const headers = ["Name", "Email", "Mobile number", "Amount (GHS)", "Frequency", "Status", "Note", "Created at"];
    const body = rows.map((r) => [r.name ?? "", r.email ?? "", r.phone ?? "", String(r.amount ?? ""), r.frequency, r.status, r.note ?? "", new Date(r.created_at).toISOString()]);
    const csv = [headers, ...body].map((row) => row.map(csvEscape).join(",")).join("\\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `elles-foundation-donations-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Donation CSV exported");
  }

  return (
    <AdminLayout title="Donations" subtitle="Donation intents captured from the donate page.">
      <div className="mb-5 flex justify-end">
        <button onClick={exportCsv} disabled={!rows.length} className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50">
          <Download className="size-4" /> Export CSV
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <AdminCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-[var(--cream)] text-[var(--primary)] grid place-items-center"><TrendingUp className="size-5" /></div>
            <div><div className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Total pledged</div><div className="font-display text-2xl">{formatCurrency(total)}</div></div>
          </div>
        </AdminCard>
        <AdminCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-[var(--cream)] text-primary grid place-items-center"><Heart className="size-5" /></div>
            <div><div className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Donations</div><div className="font-display text-2xl">{rows.length}</div></div>
          </div>
        </AdminCard>
        <AdminCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-[var(--cream)] text-[var(--earth)] grid place-items-center"><Heart className="size-5" fill="currentColor" /></div>
            <div><div className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Monthly donors</div><div className="font-display text-2xl">{monthly}</div></div>
          </div>
        </AdminCard>
      </div>

      <AdminCard>
        {isLoading ? (
          <div className="p-10 text-center text-sm text-[var(--muted-foreground)]">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-[var(--muted-foreground)]">No donation intents yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr className="text-left text-[11px] uppercase tracking-wider text-[var(--muted-foreground)]">
                  <th className="px-6 py-3">Donor</th>
                  <th className="px-6 py-3">Mobile</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Frequency</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--muted)]">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--background)]">
                    <td className="px-6 py-3">
                      <div className="font-semibold">{r.name ?? "Anonymous"}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{r.email ?? "—"}</div>
                    </td>
                    <td className="px-6 py-3 text-xs text-[var(--muted-foreground)]">{r.phone ?? "—"}</td>
                    <td className="px-6 py-3 font-display text-lg text-primary">{formatCurrency(r.amount)}</td>
                    <td className="px-6 py-3"><Badge tone={r.frequency === "monthly" ? "brand" : "neutral"}>{r.frequency}</Badge></td>
                    <td className="px-6 py-3">
                      <select
                        value={r.status}
                        onChange={async (e) => { await upsert.mutateAsync({ id: r.id, status: e.target.value }); toast.success("Updated"); }}
                        className="text-xs rounded-lg border border-[var(--border)] px-2 py-1 bg-white"
                      >
                        <option value="pending">pending</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-3 text-xs text-[var(--muted-foreground)]">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={async () => { if (!confirm("Delete this donation record?")) return; await del.mutateAsync(r.id); toast.success("Deleted"); }}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </AdminLayout>
  );
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, AdminCard, Badge } from "@/components/admin/AdminLayout";
import { useAdminList, useUpsert, useDelete } from "@/lib/cms";
import type { DonationIntent } from "@/lib/cms";
import { Trash2, Heart, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/admin/donations")({
  head: () => ({ meta: [{ title: "Donations — Admin" }, { name: "robots", content: "noindex" }] }),
  component: DonationsAdmin,
});

function DonationsAdmin() {
  const { data, isLoading } = useAdminList<DonationIntent>("donation_intents");
  const upsert = useUpsert("donation_intents");
  const del = useDelete("donation_intents");
  const rows = (data ?? []).slice().sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  const total = rows.reduce((s, d) => s + Number(d.amount || 0), 0);
  const monthly = rows.filter((r) => r.frequency === "monthly").length;

  return (
    <AdminLayout title="Donations" subtitle="Donation intents captured from the donate page.">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <AdminCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center"><TrendingUp className="size-5" /></div>
            <div><div className="text-xs uppercase tracking-wider text-[#6B7280]">Total pledged</div><div className="font-display text-2xl">{formatCurrency(total)}</div></div>
          </div>
        </AdminCard>
        <AdminCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-[#F5EFE5] text-primary grid place-items-center"><Heart className="size-5" /></div>
            <div><div className="text-xs uppercase tracking-wider text-[#6B7280]">Donations</div><div className="font-display text-2xl">{rows.length}</div></div>
          </div>
        </AdminCard>
        <AdminCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-purple-50 text-purple-600 grid place-items-center"><Heart className="size-5" fill="currentColor" /></div>
            <div><div className="text-xs uppercase tracking-wider text-[#6B7280]">Monthly donors</div><div className="font-display text-2xl">{monthly}</div></div>
          </div>
        </AdminCard>
      </div>

      <AdminCard>
        {isLoading ? (
          <div className="p-10 text-center text-sm text-[#6B7280]">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#6B7280]">No donation intents yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#EEF0F3]">
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#6B7280]">
                  <th className="px-6 py-3">Donor</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Frequency</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FAFAFB]">
                    <td className="px-6 py-3">
                      <div className="font-semibold">{r.name ?? "Anonymous"}</div>
                      <div className="text-xs text-[#6B7280]">{r.email ?? "—"}</div>
                    </td>
                    <td className="px-6 py-3 font-display text-lg text-primary">{formatCurrency(r.amount)}</td>
                    <td className="px-6 py-3"><Badge tone={r.frequency === "monthly" ? "brand" : "neutral"}>{r.frequency}</Badge></td>
                    <td className="px-6 py-3">
                      <select
                        value={r.status}
                        onChange={async (e) => { await upsert.mutateAsync({ id: r.id, status: e.target.value }); toast.success("Updated"); }}
                        className="text-xs rounded-lg border border-[#E5E7EB] px-2 py-1 bg-white"
                      >
                        <option value="pending">pending</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-3 text-xs text-[#6B7280]">{new Date(r.created_at).toLocaleDateString()}</td>
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

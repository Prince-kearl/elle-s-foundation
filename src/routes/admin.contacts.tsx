import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, AdminCard, Badge, GhostButton } from "@/components/admin/AdminLayout";
import { useAdminList, useUpsert, useDelete } from "@/lib/cms";
import type { ContactSub } from "@/lib/cms";
import { Mail, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/contacts")({
  head: () => ({ meta: [{ title: "Contact Messages — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ContactsAdmin,
});

function ContactsAdmin() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useAdminList<ContactSub>("contact_submissions");

  useEffect(() => {
    const channel = supabase
      .channel("admin-contact-submissions")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_submissions" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["a", "contact_submissions"] });
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [queryClient]);
  const upsert = useUpsert("contact_submissions");
  const del = useDelete("contact_submissions");
  const [filter, setFilter] = useState<"all" | "new" | "handled">("all");

  const rows = (data ?? [])
    .filter((r) => filter === "all" || (filter === "new" ? !r.handled : r.handled))
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

  return (
    <AdminLayout title="Contact Messages" subtitle="Every inquiry your visitors send lands here.">
      <div className="flex gap-2 mb-4">
        {(["all", "new", "handled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
              filter === f ? "bg-primary text-white" : "bg-white border border-[#EEF0F3] text-[#4B5563] hover:bg-[#F5EFE5]"
            }`}
          >
            {f} {f !== "all" && `(${(data ?? []).filter((r) => (f === "new" ? !r.handled : r.handled)).length})`}
          </button>
        ))}
      </div>

      <AdminCard>
        {isLoading ? (
          <div className="p-10 text-center text-sm text-[#6B7280]">Loading…</div>
        ) : isError ? (
          <div className="p-10 text-center text-sm text-red-600">Could not load contact messages. {error instanceof Error ? error.message : "Check the contact_submissions table and admin access policies in Supabase."}</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#6B7280]">No messages{filter !== "all" ? ` (${filter})` : ""} yet.</div>
        ) : (
          <ul className="divide-y divide-[#F3F4F6]">
            {rows.map((r) => (
              <li key={r.id} className="p-6 hover:bg-[#FAFAFB]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#111827]">{r.name}</span>
                      {r.handled ? <Badge tone="success">Handled</Badge> : <Badge tone="warn">New</Badge>}
                      {r.interest && <Badge tone="brand">{r.interest}</Badge>}
                    </div>
                    <a href={`mailto:${r.email}`} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                      <Mail className="size-3" /> {r.email}
                    </a>
                    <p className="text-sm text-[#374151] mt-3 whitespace-pre-wrap">{r.message}</p>
                    <div className="text-xs text-[#9CA3AF] mt-2">{new Date(r.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <GhostButton onClick={async () => { await upsert.mutateAsync({ id: r.id, handled: !r.handled }); toast.success(r.handled ? "Marked as new" : "Marked handled"); }}>
                      <Check className="size-4" /> {r.handled ? "Reopen" : "Mark handled"}
                    </GhostButton>
                    <button
                      onClick={async () => { if (!confirm("Delete this message?")) return; await del.mutateAsync(r.id); toast.success("Deleted"); }}
                      className="p-2 rounded-lg border border-[#E5E7EB] text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </AdminLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, AdminCard, Badge } from "@/components/admin/AdminLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Loader2, KeyRound, Copy, RefreshCw, Search, UserCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }, { name: "robots", content: "noindex" }] }),
  component: UsersAdmin,
});

const ROLES = ["admin", "editor", "user"] as const;

function UsersAdmin() {
  const qc = useQueryClient();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | (typeof ROLES)[number]>("all");
  const { data = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_users_admin");
      if (error) throw error;
      return data ?? [];
    },
  });

  const changeRole = async (userId: string, role: string) => {
    const { error } = await supabase.rpc("set_user_role", { _user_id: userId, _role: role });
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["admin_users"] });
    toast.success("Role updated");
  };

  const sendReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) return toast.error(error.message);
    toast.success("Password reset email sent");
  };

  const filteredUsers = data.filter((u: any) => {
    const normalized = search.trim().toLowerCase();
    const matchesSearch = !normalized || `${u.email ?? ""} ${u.full_name ?? ""}`.toLowerCase().includes(normalized);
    return matchesSearch && (roleFilter === "all" || u.role === roleFilter);
  });
  const roleCounts = ROLES.map((role) => ({ role, count: data.filter((u: any) => u.role === role).length }));

  return (
    <AdminLayout title="User Management" subtitle="Assign admin, editor, or user roles.">
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {roleCounts.map(({ role, count }) => <div key={role} className="border border-[#E5E7EB] bg-white p-4"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6B7280]">{role}s</p><p className="mt-2 font-display text-2xl text-primary">{count}</p></div>)}
      </div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative min-w-0 flex-1 md:max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email" className="w-full border border-[#E5E7EB] bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" /></div>
        <div className="flex gap-2"><select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)} className="border border-[#E5E7EB] bg-white px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#4B5563]"><option value="all">All roles</option>{ROLES.map((role) => <option key={role} value={role}>{role}</option>)}</select><button type="button" onClick={() => void refetch()} disabled={isFetching} className="inline-flex items-center gap-2 border border-[#E5E7EB] bg-white px-3 py-2.5 text-xs font-semibold text-primary hover:border-primary disabled:opacity-60" title="Refresh users"><RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh</button></div>
      </div>
      <AdminCard>
        {isLoading ? (
          <div className="p-10 text-center"><Loader2 className="inline size-5 animate-spin text-primary" /></div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-red-600">{(error as any).message}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#EEF0F3] text-[11px] uppercase tracking-wider text-[#6B7280]">
                <tr>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Joined</th>
                  <th className="px-6 py-3 text-left">Last Sign-in</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {filteredUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-[#FAFAFB]">
                    <td className="px-6 py-3 font-medium">{u.email}</td>
                    <td className="px-6 py-3 text-[#6B7280]">{u.full_name || "—"}</td>
                    <td className="px-6 py-3">
                      <select value={u.role} disabled={u.id === currentUser?.id} onChange={(e) => changeRole(u.id, e.target.value)}
                        className="rounded-lg border border-[#E5E7EB] px-2 py-1 text-xs bg-white disabled:cursor-not-allowed disabled:opacity-50" title={u.id === currentUser?.id ? "Your own admin role cannot be changed here" : "Change role"}>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                      <td className="px-6 py-3 text-right"><div className="flex justify-end gap-1"><button aria-label="Copy email" onClick={() => { void navigator.clipboard?.writeText(u.email); toast.success("Email copied"); }} className="p-2 rounded-lg hover:bg-[#F5EFE5] text-primary" title="Copy email"><Copy className="size-4" /></button><button aria-label="Send password reset" onClick={() => sendReset(u.email)} className="p-2 rounded-lg hover:bg-[#F5EFE5] text-primary" title="Send password reset"><KeyRound className="size-4" /></button></div></td>
                    <td className="px-6 py-3 text-[#6B7280] text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-3">
                      {u.last_sign_in_at ? <span className="text-xs text-[#6B7280]">{new Date(u.last_sign_in_at).toLocaleDateString()}</span> : <Badge>Never</Badge>}
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

import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, AdminCard, Badge } from "@/components/admin/AdminLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Loader2, KeyRound, UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }, { name: "robots", content: "noindex" }] }),
  component: UsersAdmin,
});

const ROLES = ["admin", "editor", "user"] as const;

function UsersAdmin() {
  const qc = useQueryClient();
  const { data = [], isLoading, error } = useQuery({
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

  return (
    <AdminLayout title="User Management" subtitle="Assign admin, editor, or user roles.">
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
                {data.map((u: any) => (
                  <tr key={u.id} className="hover:bg-[#FAFAFB]">
                    <td className="px-6 py-3 font-medium">{u.email}</td>
                    <td className="px-6 py-3 text-[#6B7280]">{u.full_name || "—"}</td>
                    <td className="px-6 py-3">
                      <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}
                        className="rounded-lg border border-[#E5E7EB] px-2 py-1 text-xs bg-white">
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-3 text-right"><button aria-label="Send password reset" onClick={() => sendReset(u.email)} className="p-2 rounded-lg hover:bg-[#F5EFE5] text-primary"><KeyRound className="size-4" /></button></td>
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

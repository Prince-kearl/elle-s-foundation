import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, AdminCard, Field, TextInput, PrimaryButton, Toggle } from "@/components/admin/AdminLayout";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Save, KeyRound, User as UserIcon, Bell } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({ meta: [{ title: "My Profile — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ProfileAdmin,
});

function ProfileAdmin() {
  const { user, role } = useAuth();
  const [pw, setPw] = useState(""); const [pw2, setPw2] = useState("");
  const [saving, setSaving] = useState(false);
  const [notifs, setNotifs] = useState({ email: true, browser: true });

  const updatePw = async () => {
    if (pw.length < 6) return toast.error("Password must be at least 6 characters");
    if (pw !== pw2) return toast.error("Passwords don't match");
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSaving(false);
    if (error) return toast.error(error.message);
    setPw(""); setPw2("");
    toast.success("Password updated");
  };

  return (
    <AdminLayout title="My Profile" subtitle="Manage your account settings and security.">
      <div className="grid gap-6 max-w-3xl">
        <AdminCard className="p-6">
          <div className="flex items-center gap-2 mb-4"><UserIcon className="size-4 text-primary" /><h3 className="font-display text-xl">Account</h3></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email"><TextInput value={user?.email ?? ""} disabled /></Field>
            <Field label="Role"><TextInput value={role ?? ""} disabled /></Field>
          </div>
        </AdminCard>

        <AdminCard className="p-6">
          <div className="flex items-center gap-2 mb-4"><Bell className="size-4 text-primary" /><h3 className="font-display text-xl">Notification Preferences</h3></div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Email Notifications</div>
                <div className="text-xs text-[#6B7280]">Receive new contact messages and donations via email.</div>
              </div>
              <Toggle checked={notifs.email} onChange={(v) => setNotifs(p => ({ ...p, email: v }))} />
            </div>
            <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-4">
              <div>
                <div className="text-sm font-medium">Browser Alerts</div>
                <div className="text-xs text-[#6B7280]">Show desktop notifications when active in the dashboard.</div>
              </div>
              <Toggle checked={notifs.browser} onChange={(v) => setNotifs(p => ({ ...p, browser: v }))} />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="p-6">
          <div className="flex items-center gap-2 mb-4"><KeyRound className="size-4 text-primary" /><h3 className="font-display text-xl">Change password</h3></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="New password"><TextInput type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Min 6 characters" /></Field>
            <Field label="Confirm password"><TextInput type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></Field>
          </div>
          <div className="mt-4 flex justify-end">
            <PrimaryButton onClick={updatePw} disabled={saving}><Save className="size-4" /> Update password</PrimaryButton>
          </div>
        </AdminCard>
      </div>
    </AdminLayout>
  );
}

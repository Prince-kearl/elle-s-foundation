import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, AdminCard, Field, TextInput, PrimaryButton } from "@/components/admin/AdminLayout";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Save, KeyRound, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({ meta: [{ title: "My Profile — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ProfileAdmin,
});

function ProfileAdmin() {
  const { user, role } = useAuth();
  const [pw, setPw] = useState(""); const [pw2, setPw2] = useState("");
  const [saving, setSaving] = useState(false);

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
      <div className="grid gap-4 max-w-3xl">
        <AdminCard className="p-6">
          <div className="flex items-center gap-2 mb-4"><UserIcon className="size-4 text-primary" /><h3 className="font-display text-xl">Account</h3></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email"><TextInput value={user?.email ?? ""} disabled /></Field>
            <Field label="Role"><TextInput value={role ?? ""} disabled /></Field>
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

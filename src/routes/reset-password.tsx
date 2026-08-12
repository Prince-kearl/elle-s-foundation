import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Elle's Foundation" }, { name: "robots", content: "noindex" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const recovery = typeof window !== "undefined" && (window.location.hash.includes("type=recovery") || window.location.search.includes("type=recovery"));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) return toast.error("Use at least 8 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. You can now sign in.");
  };

  return <main className="min-h-screen grid place-items-center bg-[#F5EFE5] p-6">
    <div className="w-full max-w-md rounded-lg border border-[#E5E7EB] bg-white p-8 shadow-sm">
      <div className="size-10 rounded-lg bg-primary text-white grid place-items-center"><KeyRound className="size-5" /></div>
      <h1 className="mt-5 font-display text-3xl text-primary">Reset password</h1>
      {!recovery && <p className="mt-2 text-sm text-[#6B7280]">Open the password-reset link from your email to continue.</p>}
      {recovery && <form onSubmit={submit} className="mt-6 space-y-4">
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3" />
        <input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Confirm password" className="w-full rounded-lg border border-[#E5E7EB] px-4 py-3" />
        <button disabled={busy} className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-white disabled:opacity-60">{busy ? <Loader2 className="mx-auto size-4 animate-spin" /> : "Update password"}</button>
      </form>}
      <Link to="/auth" className="mt-6 inline-block text-sm text-primary">Back to sign in</Link>
    </div>
  </main>;
}
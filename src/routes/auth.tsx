import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Elle's Foundation Admin" },
      { name: "description", content: "Sign in to manage Elle's Foundation website content." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading, isAdmin, signIn, signUp } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) nav({ to: "/admin" });
  }, [loading, user, isAdmin, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password, fullName);
    setSubmitting(false);
    if (res.error) return toast.error(res.error);
    if (mode === "signup") toast.success("Account created. Check your email to confirm, then sign in.");
    else toast.success("Signed in");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#F5EFE5]">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary via-forest to-earth text-white">
        <Link to="/" className="flex items-center gap-2 font-display text-2xl">
          <div className="size-9 rounded-lg bg-white/15 grid place-items-center">
            <Heart className="size-4" fill="currentColor" />
          </div>
          Elle's Foundation
        </Link>
        <div>
          <h2 className="font-display text-4xl leading-tight">Manage every part of your site.</h2>
          <p className="mt-4 text-white/75 max-w-md">Update content, review submissions, and shape the story you share with the world — no code required.</p>
        </div>
        <p className="text-xs text-white/50">© {new Date().getFullYear()} Elle's Foundation CMS</p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl text-primary">
            {mode === "signin" ? "Welcome back" : "Create admin account"}
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {mode === "signin" ? "Sign in to your CMS dashboard." : "The first person to sign up becomes super admin."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#4B5563]">Full name</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#4B5563]">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#4B5563]">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            </div>

            <button disabled={submitting} className="w-full rounded-lg bg-gradient-to-r from-primary to-forest text-white px-4 py-3 text-sm font-medium hover:opacity-95 disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 text-sm text-primary hover:underline"
          >
            {mode === "signin" ? "No account yet? Sign up →" : "Already have an account? Sign in →"}
          </button>

          {user && !isAdmin && (
            <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
              You're signed in as <b>{user.email}</b> but you don't have admin access.
              Ask a super admin to grant you the <b>admin</b> role in Supabase (<code>user_roles</code> table).
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#EEF0F3] text-xs text-[#6B7280]">
            <Link to="/" className="hover:text-primary">← Back to website</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

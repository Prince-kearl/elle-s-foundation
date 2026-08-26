import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { ArrowUpRight, LockKeyhole, Loader2, Mail } from "lucide-react";
import logoAsset from "@/assets/brand/elles-foundation-mark.png";
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
    const res =
      mode === "signin" ? await signIn(email, password) : await signUp(email, password, fullName);
    setSubmitting(false);
    if (res.error) return toast.error(res.error);
    if (mode === "signup")
      toast.success("Account created. Check your email to confirm, then sign in.");
    else toast.success("Signed in");
  };

  const isSignIn = mode === "signin";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#073B2B] px-4 py-10 text-[#124A3A] sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 20%, rgba(241,250,233,0.12) 0 1px, transparent 1px), radial-gradient(circle at 78% 74%, rgba(241,250,233,0.10) 0 1px, transparent 1px)",
          backgroundSize: "34px 34px, 47px 47px",
        }}
      />
      <div className="relative w-full max-w-[430px] border border-white/10 bg-[#FBFFF8] shadow-[0_28px_80px_-28px_rgba(0,0,0,0.7)]">
        <div className="border-b border-[#124A3A]/10 px-7 pb-6 pt-7 sm:px-9 sm:pt-9">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-3"
            aria-label="Back to Elle's Foundation website"
          >
            <span className="grid size-11 place-items-center border border-[#D9A88E]/60 bg-[#F7E8DC]">
              <img src={logoAsset} alt="" className="size-9 object-contain" />
            </span>
            <span className="font-display text-xl font-semibold tracking-[-0.03em] text-[#084B35]">
              Elle's Foundation
            </span>
          </Link>
          <div className="mb-3 flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#D9A88E]">
            <span className="size-2 rounded-full bg-[#D9A88E]" /> Protected workspace
          </div>
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-[-0.04em] text-[#084B35] sm:text-[2.15rem]">
            {isSignIn ? "Admin sign in" : "Create admin account"}
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[#5C7067]">
            {isSignIn
              ? "Enter your email and password to manage programmes, stories, media, and site content."
              : "Create an account to access Elle's Foundation content management workspace."}
          </p>
        </div>

        <div className="px-7 pb-7 pt-6 sm:px-9 sm:pb-9">
          <form onSubmit={submit} className="space-y-5">
            {mode === "signup" && (
              <label className="block">
                <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#124A3A]">
                  Full name
                </span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  className="h-12 w-full border border-[#C9D8CE] bg-white px-3.5 text-sm text-[#124A3A] outline-none transition placeholder:text-[#91A39A] focus:border-[#0F6848] focus:ring-2 focus:ring-[#D9A88E]/30"
                  placeholder="Your full name"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#124A3A]">
                Email address
              </span>
              <span className="relative block">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6D8278]"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-12 w-full border border-[#C9D8CE] bg-white pl-10 pr-3.5 text-sm text-[#124A3A] outline-none transition placeholder:text-[#91A39A] focus:border-[#0F6848] focus:ring-2 focus:ring-[#D9A88E]/30"
                  placeholder="you@example.com"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#124A3A]">
                Password
              </span>
              <span className="relative block">
                <LockKeyhole
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6D8278]"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  className="h-12 w-full border border-[#C9D8CE] bg-white pl-10 pr-3.5 text-sm text-[#124A3A] outline-none transition placeholder:text-[#91A39A] focus:border-[#0F6848] focus:ring-2 focus:ring-[#D9A88E]/30"
                  placeholder="Enter your password"
                />
              </span>
            </label>

            <button
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center gap-2 bg-[#0F6848] px-4 text-sm font-bold text-white transition hover:bg-[#084B35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9A88E] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {isSignIn ? "Sign in" : "Create account"}
              {!submitting && <ArrowUpRight className="size-4" />}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(isSignIn ? "signup" : "signin")}
            className="mt-5 text-sm font-semibold text-[#0F6848] underline-offset-4 transition hover:text-[#D9A88E] hover:underline"
          >
            {isSignIn ? "No account yet? Create one →" : "Already have an account? Sign in →"}
          </button>

          {user && !isAdmin && (
            <div className="mt-5 border border-[#E5B8A0] bg-[#F7E8DC] p-4 text-sm leading-6 text-[#7C3E2D]">
              You're signed in as <b>{user.email}</b> but you don't have admin access. Ask a super
              admin to grant you the <b>admin</b> role in Supabase.
            </div>
          )}

          <div className="mt-7 border-t border-[#124A3A]/10 pt-5 text-xs text-[#6D8278]">
            <Link
              to="/"
              className="inline-flex items-center gap-1 font-semibold transition hover:text-[#0F6848]"
            >
              ← Back to website
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

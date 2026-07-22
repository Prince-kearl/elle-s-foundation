import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutGrid, Sparkles, Users, MessageSquare, HelpCircle, ImageIcon,
  Settings, LogOut, Bell, Menu, X, Inbox, HeartHandshake, User,
  Heart, ShieldCheck, ChevronRight
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/admin/hero", label: "Hero Section", icon: Sparkles },
  { to: "/admin/stats", label: "Statistics", icon: ShieldCheck },
  { to: "/admin/programs", label: "Programs", icon: HeartHandshake },
  { to: "/admin/stories", label: "Stories", icon: ImageIcon },
  { to: "/admin/team", label: "Team Members", icon: Users },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/admin/contacts", label: "Contact Messages", icon: Inbox, badge: "contact" as const },
  { to: "/admin/donations", label: "Donations", icon: Heart, badge: "donation" as const },
  { to: "/admin/settings", label: "Site Settings", icon: Settings },
  { to: "/admin/profile", label: "My Profile", icon: User },
] as const;

export function AdminLayout({ children, title, subtitle, action }: { children: ReactNode; title: string; subtitle?: string; action?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = useNavigate();
  const { user, signOut, role } = useAuth();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex text-[#111827]">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 bg-white border-r border-[#EEF0F3] flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-20 px-6 flex items-center gap-2 border-b border-[#EEF0F3]">
          <div className="size-8 rounded-lg bg-primary text-white grid place-items-center">
            <Heart className="size-4" fill="currentColor" />
          </div>
          <span className="font-display text-xl font-semibold text-primary">Elle CMS</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {items.map((item) => {
            const { to, label, icon: Icon } = item;
            const end = "end" in item ? item.end : false;
            const active = end ? path === to : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-gradient-to-r from-primary to-forest text-white shadow-sm"
                    : "text-[#4B5563] hover:bg-[#F5EFE5]/70 hover:text-primary"
                }`}
              >
                <Icon className="size-4" />
                <span className="flex-1">{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#EEF0F3]">
          <button
            onClick={async () => { await signOut(); nav({ to: "/auth" }); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-[#4B5563] hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-20 bg-white border-b border-[#EEF0F3] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2" onClick={() => setOpen((v) => !v)}>
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <Link to="/" className="hidden md:flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-primary">
              View site <ChevronRight className="size-3" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-[#F5EFE5]">
              <Bell className="size-5 text-[#4B5563]" />
              <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5EFE5]">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">{role ?? "user"}</span>
              <span className="text-xs text-[#4B5563] hidden sm:inline max-w-[140px] truncate">{user?.email}</span>
              <div className="size-7 rounded-full bg-gradient-to-br from-primary to-earth text-white grid place-items-center text-xs font-semibold">
                {user?.email?.[0]?.toUpperCase() ?? "?"}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-3xl text-[#111827]">{title}</h1>
              {subtitle && <p className="text-sm text-[#6B7280] mt-1">{subtitle}</p>}
            </div>
            {action}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-[#EEF0F3] rounded-2xl shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}>
      {children}
    </div>
  );
}

export function PrimaryButton({ children, onClick, type = "button", disabled, className = "" }: { children: ReactNode; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean; className?: string }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-forest text-white px-4 py-2.5 text-sm font-medium hover:opacity-95 disabled:opacity-60 transition ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, className = "" }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white text-[#4B5563] px-4 py-2 text-sm font-medium hover:bg-[#F9FAFB] transition ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm bg-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition ${props.className ?? ""}`}
    />
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? "bg-primary" : "bg-[#E5E7EB]"}`}
    >
      <span className={`inline-block size-4 rounded-full bg-white shadow transform transition ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warn" | "brand" }) {
  const map = {
    neutral: "bg-[#F3F4F6] text-[#4B5563]",
    success: "bg-emerald-50 text-emerald-700",
    warn: "bg-amber-50 text-amber-700",
    brand: "bg-[#F5EFE5] text-primary",
  };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${map[tone]}`}>{children}</span>;
}

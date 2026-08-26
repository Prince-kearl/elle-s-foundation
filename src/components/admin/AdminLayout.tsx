import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutGrid,
  Sparkles,
  Users,
  MessageSquare,
  HelpCircle,
  ImageIcon,
  CalendarDays,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Inbox,
  HeartHandshake,
  User,
  Heart,
  ShieldCheck,
  ChevronRight,
  Palette,
  FileText,
  HandHeart,
  UserCog,
  HardDrive,
  Mail,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import logoAsset from "@/assets/brand/elles-foundation-mark.png";
import { GlobalSearch } from "@/components/site/GlobalSearch";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/admin/pages", label: "Pages", icon: FileText },
  { to: "/admin/hero", label: "Hero Section", icon: Sparkles },
  { to: "/admin/stats", label: "Statistics", icon: ShieldCheck },
  { to: "/admin/programs", label: "Programs", icon: HeartHandshake },
  { to: "/admin/events", label: "Events & RSVPs", icon: CalendarDays },
  { to: "/admin/newsletter", label: "Newsletter Subscribers", icon: Mail },
  { to: "/admin/stories", label: "Stories", icon: ImageIcon },
  { to: "/admin/team", label: "Team Members", icon: Users },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/admin/sponsorships", label: "Sponsorships", icon: HandHeart },
  { to: "/admin/media", label: "Media Library", icon: ImageIcon },
  { to: "/admin/storage", label: "Storage & Health", icon: HardDrive },
  { to: "/admin/brand", label: "Brand & Theme", icon: Palette },

  { to: "/admin/users", label: "Users", icon: UserCog },
  { to: "/admin/contacts", label: "Contact Messages", icon: Inbox, badge: "contact" as const },
  { to: "/admin/donations", label: "Donations", icon: Heart, badge: "donation" as const },
  { to: "/admin/settings", label: "Site Settings", icon: Settings },
  { to: "/admin/profile", label: "My Profile", icon: User },
] as const;

export function AdminLayout({
  children,
  title,
  subtitle,
  action,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = useNavigate();
  const { user, signOut, role } = useAuth();

  return (
    <div className="admin-shell min-h-screen bg-background flex text-foreground">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 bg-forest border-r border-primary flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-20 px-5 flex items-center gap-3 border-b border-white/10">
          <div className="grid size-9 place-items-center">
            <img src={logoAsset} alt="" className="size-8 brightness-0 invert" />
          </div>
          <span className="font-display text-xl font-semibold text-white">Elle CMS</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {items.map((item) => {
            const { to, label, icon: Icon } = item;
            const end = "end" in item ? item.end : false;
            const active = end ? path === to : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-sand text-forest shadow-none"
                    : "text-primary-foreground/75 hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                <Icon className="size-4" />
                <span className="flex-1">{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={async () => {
              await signOut();
              nav({ to: "/auth" });
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/75 hover:bg-red-500/20 hover:text-white"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-20 bg-cream border-b border-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2" onClick={() => setOpen((v) => !v)}>
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <Link
              to="/"
              className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-earth"
            >
              View site <ChevronRight className="size-3" />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <GlobalSearch scope="admin" />
            <div className="relative">
              <button
                aria-label="Open notifications"
                onClick={() => setAlertsOpen((value) => !value)}
                className="relative p-2 hover:bg-sand"
              >
                <Bell className="size-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" />
              </button>
              {alertsOpen && (
                <div className="absolute right-0 top-12 w-72 border border-border bg-card p-4 shadow-xl">
                  <div className="font-semibold text-sm">Notifications</div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    New messages, donations, scheduled publications, and system notices appear here.
                  </p>
                  <Link
                    to="/admin"
                    onClick={() => setAlertsOpen(false)}
                    className="mt-3 inline-block text-xs font-semibold text-primary"
                  >
                    View activity
                  </Link>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                aria-label="Open profile menu"
                onClick={() => setProfileOpen((value) => !value)}
                className="flex items-center gap-2 px-3 py-1.5 bg-sand"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {role ?? "user"}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline max-w-[140px] truncate">
                  {user?.email}
                </span>
                <div className="size-7 bg-earth text-primary-foreground grid place-items-center text-xs font-semibold">
                  {user?.email?.[0]?.toUpperCase() ?? "?"}
                </div>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-52 border border-border bg-card py-2 shadow-xl">
                  <Link
                    to="/admin/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                  >
                    <User className="size-4" /> My profile
                  </Link>
                  <button
                    onClick={async () => {
                      await signOut();
                      nav({ to: "/auth" });
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="size-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 bg-background">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-3xl text-foreground">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            {action}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-card border border-border shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-forest disabled:opacity-60 transition ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 border border-border bg-card text-primary px-4 py-2 text-sm font-medium hover:bg-muted transition ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border border-border px-3.5 py-2.5 text-sm bg-card outline-none focus:border-earth focus:ring-2 focus:ring-earth/15 transition ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full border border-border px-3.5 py-2.5 text-sm bg-card outline-none focus:border-earth focus:ring-2 focus:ring-earth/15 transition ${props.className ?? ""}`}
    />
  );
}

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? "bg-primary" : "bg-border"}`}
    >
      <span
        className={`inline-block size-4 rounded-full bg-white shadow transform transition ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warn" | "brand";
}) {
  const map = {
    neutral: "bg-muted text-muted-foreground",
    success: "bg-cream text-primary",
    warn: "bg-amber-50 text-amber-700",
    brand: "bg-sand text-forest",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${map[tone]}`}
    >
      {children}
    </span>
  );
}

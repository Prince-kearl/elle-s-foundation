import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
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
import { supabase } from "@/lib/supabase";

type AdminNotification = {
  id: string;
  label: string;
  detail: string;
  to: string;
  unread: boolean;
};

type AdminNotificationState = {
  notifications: AdminNotification[];
  unreadCount: number;
};

function useAdminNotifications() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_submissions" },
        () => void queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donation_intents" },
        () => void queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_rsvps" },
        () => void queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_notification_reads", filter: `user_id=eq.${user?.id ?? ""}` },
        () => void queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, user?.id]);

  const query = useQuery<AdminNotificationState>({
    queryKey: ["admin-notifications", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return { notifications: [], unreadCount: 0 };
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const [contacts, donations, rsvps, reads] = await Promise.all([
        supabase.from("contact_submissions").select("id,created_at", { count: "exact" }).eq("handled", false).order("created_at", { ascending: false }).limit(100),
        supabase.from("donation_intents").select("id,created_at", { count: "exact" }).gte("created_at", since).order("created_at", { ascending: false }).limit(100),
        supabase.from("event_rsvps").select("id,created_at", { count: "exact" }).gte("created_at", since).order("created_at", { ascending: false }).limit(100),
        supabase.from("admin_notification_reads").select("notification_key,read_at").eq("user_id", user.id),
      ]);
      const readAt = new Map((reads.data ?? []).map((row) => [row.notification_key, row.read_at]));
      const definitions = [
        { id: "contacts", label: "New contact messages", count: contacts.count ?? 0, latest: contacts.data?.[0]?.created_at, to: "/admin/contacts", noun: "message" },
        { id: "donations", label: "Recent donation activity", count: donations.count ?? 0, latest: donations.data?.[0]?.created_at, to: "/admin/donations", noun: "donation" },
        { id: "rsvps", label: "New event RSVPs", count: rsvps.count ?? 0, latest: rsvps.data?.[0]?.created_at, to: "/admin/events", noun: "RSVP" },
      ];
      const notifications = definitions.filter((item) => item.count > 0).map((item) => ({
        id: item.id,
        label: item.label,
        detail: `${item.count} ${item.noun}${item.count === 1 ? "" : "s"}${item.id === "contacts" ? " need attention" : " in the last 7 days"}`,
        to: item.to,
        unread: !readAt.get(item.id) || (!!item.latest && new Date(readAt.get(item.id)!).getTime() < new Date(item.latest).getTime()),
      }));
      return { notifications, unreadCount: notifications.filter((item) => item.unread).length };
    },
    refetchInterval: 30_000,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });

  const markRead = async (notificationKey: string) => {
    if (!user?.id) return;
    await supabase.from("admin_notification_reads").upsert(
      { user_id: user.id, notification_key: notificationKey, read_at: new Date().toISOString() },
      { onConflict: "user_id,notification_key" },
    );
    await queryClient.invalidateQueries({ queryKey: ["admin-notifications", user.id] });
  };

  return { ...query, notifications: query.data?.notifications ?? [], unreadCount: query.data?.unreadCount ?? 0, markRead };
}

const navSections = [
  {
    label: "Overview",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutGrid, end: true }],
  },
  {
    label: "Site Content",
    items: [
      { to: "/admin/pages", label: "Pages", icon: FileText },
      { to: "/admin/hero", label: "Hero Section", icon: Sparkles },
      { to: "/admin/stats", label: "Statistics", icon: ShieldCheck },
      { to: "/admin/programs", label: "Programs", icon: HeartHandshake },
      { to: "/admin/events", label: "Events & RSVPs", icon: CalendarDays },
      { to: "/admin/stories", label: "Stories", icon: ImageIcon },
      { to: "/admin/team", label: "Team Members", icon: Users },
      { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
      { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
    ],
  },
  {
    label: "Community & Engagement",
    items: [
      { to: "/admin/sponsorships", label: "Sponsorships", icon: HandHeart },
      { to: "/admin/newsletter", label: "Newsletter Subscribers", icon: Mail },
      { to: "/admin/contacts", label: "Contact Messages", icon: Inbox, badge: "contact" as const },
      { to: "/admin/donations", label: "Donations", icon: Heart, badge: "donation" as const },
    ],
  },
  {
    label: "Media & Appearance",
    items: [
      { to: "/admin/media", label: "Media Library", icon: ImageIcon },
      { to: "/admin/storage", label: "Storage & Health", icon: HardDrive },
      { to: "/admin/brand", label: "Brand & Theme", icon: Palette },
      { to: "/admin/settings", label: "Site Settings", icon: Settings },
    ],
  },
  {
    label: "Workspace",
    items: [
      { to: "/admin/users", label: "Users", icon: UserCog },
      { to: "/admin/profile", label: "My Profile", icon: User },
    ],
  },
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
  const { notifications, unreadCount, isLoading: notificationsLoading, markRead } = useAdminNotifications();

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
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {navSections.map((section) => (
            <section key={section.label} aria-labelledby={`admin-nav-${section.label.toLowerCase().replaceAll(" ", "-")}`}>
              <h2
                id={`admin-nav-${section.label.toLowerCase().replaceAll(" ", "-")}`}
                className="px-3 pb-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/40"
              >
                {section.label}
              </h2>
              <div className="space-y-1">
                {section.items.map((item) => {
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
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
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
                aria-label={`Open notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
                aria-expanded={alertsOpen}
                onClick={() => setAlertsOpen((value) => !value)}
                className="relative p-2 transition hover:bg-sand"
              >
                <Bell className="size-5 text-muted-foreground" />
                {(unreadCount > 0 || notificationsLoading) && (
                  <span className="absolute right-1 top-1 size-2 rounded-full bg-earth" />
                )}
              </button>
              {alertsOpen && (
                <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] border border-border bg-card shadow-xl">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">Notifications</div>
                      <div className="mt-0.5 text-[0.68rem] text-muted-foreground">
                        {unreadCount
                          ? `${unreadCount} unread item${unreadCount === 1 ? "" : "s"}`
                          : notifications.length
                            ? "No unread items"
                            : "You're all caught up"}
                      </div>
                    </div>
                    <Bell className="size-4 text-earth" />
                  </div>
                  {notificationsLoading ? (
                    <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                      Checking recent activity…
                    </div>
                  ) : notifications.length ? (
                    <div className="divide-y divide-border">
                      {notifications.map((notification) => (
                        <Link
                          key={notification.id}
                          to={notification.to}
                          onClick={() => {
                            void markRead(notification.id);
                            setAlertsOpen(false);
                          }}
                          className={`flex items-start gap-3 px-4 py-3 transition hover:bg-muted ${notification.unread ? "bg-earth/5" : "opacity-75"}`}
                        >
                          <span className={`mt-1 size-2 shrink-0 rounded-full ${notification.unread ? "bg-earth" : "bg-muted-foreground/30"}`} />
                          <span className="min-w-0">
                            <span className={`block text-sm text-foreground ${notification.unread ? "font-semibold" : "font-medium"}`}>{notification.label}</span>
                            <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                              {notification.detail}
                            </span>
                          </span>
                          <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                      No new contact, donation, or RSVP activity in the last 7 days.
                    </div>
                  )}
                  <Link
                    to="/admin"
                    onClick={() => setAlertsOpen(false)}
                    className="block border-t border-border px-4 py-3 text-xs font-semibold text-primary transition hover:bg-muted"
                  >
                    View dashboard activity
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

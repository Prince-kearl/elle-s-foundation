import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type Role = "admin" | "editor" | "user";

interface AuthState {
  session: Session | null;
  user: User | null;
  role: Role | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | undefined>(undefined);
const roleCache = new Map<string, Role>();
const roleRequests = new Map<string, Promise<Role>>();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRole = async (userId: string | undefined, force = false) => {
    if (!userId) { setRole(null); return; }
    if (!force && roleCache.has(userId)) { setRole(roleCache.get(userId)!); return; }
    const existing = roleRequests.get(userId);
    if (existing && !force) { setRole(await existing); return; }
    const request = Promise.resolve(supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .order("role", { ascending: true }) // admin < editor < user alphabetically
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        const nextRole = (data?.role as Role) ?? "user";
        roleCache.set(userId, nextRole);
        return nextRole;
      }));
    roleRequests.set(userId, request);
    try { setRole(await request); } finally { roleRequests.delete(userId); }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadRole(data.session?.user.id).finally(() => setLoading(false));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      loadRole(s?.user.id);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn: AuthState["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp: AuthState["signUp"] = async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin + "/auth" },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
  };

  const refreshRole = async () => {
    if (session?.user.id) roleCache.delete(session.user.id);
    await loadRole(session?.user.id, true);
  };

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    role,
    loading,
    isAdmin: role === "admin",
    signIn,
    signUp,
    signOut,
    refreshRole,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

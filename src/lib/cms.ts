import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";

export type Stat = { id: string; value: string; label: string; position: number; visible: boolean };
export type Program = { id: string; title: string; description: string; icon: string; image_url: string | null; position: number; visible: boolean };
export type Story = { id: string; tag: string | null; title: string; excerpt: string | null; image_url: string | null; position: number; visible: boolean };
export type TeamMember = { id: string; name: string; role: string; bio: string | null; avatar_url: string | null; position: number; visible: boolean };
export type Testimonial = { id: string; quote: string; name: string; role: string | null; avatar_url: string | null; position: number; visible: boolean };
export type Faq = { id: string; question: string; answer: string; position: number; visible: boolean };
export type ContactSub = { id: string; name: string; email: string; interest: string | null; message: string; handled: boolean; created_at: string };
export type DonationIntent = { id: string; amount: number; frequency: string; name: string | null; email: string | null; note: string | null; status: string; created_at: string };
export type SiteSettings = {
  id: number; org_name: string; tagline: string; logo_url: string | null;
  email: string; phone: string; address: string;
  facebook_url: string; instagram_url: string; twitter_url: string; linkedin_url: string;
  donate_url: string; newsletter_headline: string;
};
export type SiteCopy = Record<string, string>;

async function selectAll<T>(table: string, order = "position"): Promise<T[]> {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending: true });
  if (error) throw error;
  return (data ?? []) as T[];
}

async function selectVisible<T>(table: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select("*").eq("visible", true).order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []) as T[];
}

/* ---------- Public hooks (visible only) ---------- */
export const usePublicStats = () => useQuery({ queryKey: ["p:stats"], queryFn: () => selectVisible<Stat>("stats") });
export const usePublicPrograms = () => useQuery({ queryKey: ["p:programs"], queryFn: () => selectVisible<Program>("programs") });
export const usePublicStories = () => useQuery({ queryKey: ["p:stories"], queryFn: () => selectVisible<Story>("stories") });
export const usePublicTeam = () => useQuery({ queryKey: ["p:team"], queryFn: () => selectVisible<TeamMember>("team_members") });
export const usePublicTestimonials = () => useQuery({ queryKey: ["p:testimonials"], queryFn: () => selectVisible<Testimonial>("testimonials") });
export const usePublicFaqs = () => useQuery({ queryKey: ["p:faqs"], queryFn: () => selectVisible<Faq>("faqs") });

export const useSiteSettings = () =>
  useQuery({
    queryKey: ["site_settings"],
    queryFn: async (): Promise<SiteSettings | null> => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data as SiteSettings | null;
    },
  });

export const useSiteCopy = (section: string) =>
  useQuery({
    queryKey: ["site_copy", section],
    queryFn: async (): Promise<SiteCopy> => {
      const { data, error } = await supabase.from("site_content").select("key,value_text").eq("section", section);
      if (error) throw error;
      const map: SiteCopy = {};
      (data ?? []).forEach((r: any) => { map[r.key] = r.value_text ?? ""; });
      return map;
    },
  });

/* ---------- Admin hooks (all rows) ---------- */
export const useAdminList = <T,>(table: string) =>
  useQuery({ queryKey: ["a", table], queryFn: () => selectAll<T>(table) });

export function useUpsert(table: string, invalidateKeys: string[][] = []) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: any) => {
      const { data, error } = await supabase.from(table).upsert(row).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["a", table] });
      invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
    },
  });
}

export function useDelete(table: string, invalidateKeys: string[][] = []) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["a", table] });
      invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
    },
  });
}

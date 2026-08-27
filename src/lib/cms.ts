import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";

export type Stat = { id: string; value: string; label: string; position: number; visible: boolean };
export type Program = { id: string; title: string; description: string; icon: string; image_url: string | null; position: number; visible: boolean };
export type Story = { id: string; tag: string | null; title: string; excerpt: string | null; image_url: string | null; position: number; visible: boolean };
export type TeamMember = { id: string; name: string; role: string; bio: string | null; avatar_url: string | null; linkedin_url?: string | null; instagram_url?: string | null; website_url?: string | null; position: number; visible: boolean };
export type Testimonial = { id: string; quote: string; name: string; role: string | null; avatar_url: string | null; position: number; visible: boolean };
export type Faq = { id: string; question: string; answer: string; position: number; visible: boolean };
export type ContactSub = { id: string; name: string; email: string; interest: string | null; message: string; handled: boolean; created_at: string };
export type DonationIntent = { id: string; amount: number; frequency: string; currency?: string; sponsorship_id?: string | null; name: string | null; email: string | null; phone: string | null; note: string | null; status: string; created_at: string };
export type EventRecord = { id: string; title: string; event_type: string; description: string; event_date: string; start_time: string | null; end_time: string | null; location: string; status: "draft" | "published" | "archived"; visible: boolean; accent: string; position: number; created_at: string; updated_at: string };
export type Sponsorship = { id: string; title: string; description: string; amount: number; currency: string; frequency: string; icon: string | null; image_url: string | null; benefits: string[] | null; featured: boolean; position: number; visible: boolean; created_at: string; updated_at: string };
export type EventRsvp = { id: string; event_id: string; name: string; email: string; phone: string | null; guests: number; note: string | null; status: "pending" | "confirmed" | "attended" | "cancelled"; created_at: string; events?: { title: string; event_date: string } | null };
export type RsvpEmailConfirmation = { id: string; rsvp_id: string; recipient_email: string; status: "queued" | "sending" | "sent" | "failed" | "needs_setup"; provider_message_id: string | null; error_message: string | null; sent_at: string | null; created_at: string; updated_at: string };
export type NewsletterSubscriber = { id: string; email: string; whatsapp_number: string | null; source: string; status: "subscribed" | "unsubscribed"; created_at: string; updated_at: string };
export type NewsletterConfirmationRecord = { id: string; subscriber_id: string; channel: "database" | "whatsapp"; status: "recorded" | "queued" | "sent" | "failed" | "needs_setup"; message: string; created_at: string; updated_at: string };
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
export const usePublicEvents = () => useQuery({
  queryKey: ["p:events"],
  queryFn: async () => {
    const { data, error } = await supabase.from("events").select("*").eq("visible", true).eq("status", "published").gte("event_date", new Date().toISOString().slice(0, 10)).order("event_date", { ascending: true }).order("start_time", { ascending: true }).limit(8);
    if (error) throw error;
    return (data ?? []) as EventRecord[];
  },
});

const PUBLIC_REALTIME_TABLES = [
  { table: "stats", keys: [["p:stats"]] },
  { table: "programs", keys: [["p:programs"]] },
  { table: "stories", keys: [["p:stories"]] },
  { table: "team_members", keys: [["p:team"]] },
  { table: "testimonials", keys: [["p:testimonials"]] },
  { table: "faqs", keys: [["p:faqs"]] },
  { table: "events", keys: [["p:events"]] },
  { table: "sponsorships", keys: [["p:sponsorships"]] },
  { table: "page_content", keys: [["page_content"]] },
  { table: "site_content", keys: [["site_copy"]] },
  { table: "site_settings", keys: [["site_settings"]] },
  { table: "brand_settings", keys: [["brand"]] },
  { table: "page_brand", keys: [["page_brand"]] },
  { table: "published_media", keys: [["page_content"], ["media_library"]] },
] as const;

/** Keeps every mounted public page synchronized with admin CMS changes. */
export function usePublicCmsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel("public-cms-sync");
    PUBLIC_REALTIME_TABLES.forEach(({ table, keys }) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          keys.forEach((key) => void queryClient.invalidateQueries({ queryKey: key }));
        },
      );
    });
    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

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
export const useAdminList = <T,>(table: string, order = "position") => useQuery({ queryKey: ["a", table, order], queryFn: () => selectAll<T>(table, order) });

export function useUpsert(table: string, invalidateKeys: string[][] = []) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: any) => {
      const query = row?.id
        ? supabase.from(table).update(row).eq("id", row.id)
        : supabase.from(table).insert(row);
      const { data, error } = await query.select().single();
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

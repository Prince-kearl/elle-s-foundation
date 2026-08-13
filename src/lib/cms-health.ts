import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";

/** Tables/views the CMS depends on. */
const TABLES = [
  "site_settings", "page_content", "published_page_content", "page_seo", "brand_settings",
  "page_brand", "media_assets", "published_media", "audit_log", "app_config", "pending_invites",
] as const;

/** RPCs the CMS depends on. */
const RPCS: Array<[string, Record<string, unknown>]> = [
  ["list_users_admin", {}],
  ["recent_audit", { _limit: 1 }],
  ["scheduled_items", {}],
];

export type HealthReport = {
  ok: boolean;
  missingTables: string[];
  missingRpcs: string[];
};

export async function checkCmsHealth(): Promise<HealthReport> {
  const missingTables: string[] = [];
  const missingRpcs: string[] = [];

  await Promise.all(
    TABLES.map(async (t) => {
      const { error } = await supabase.from(t).select("*", { head: true, count: "exact" }).limit(1);
      if (error && (error.code === "PGRST205" || /schema cache|does not exist/i.test(error.message))) missingTables.push(t);
    }),
  );

  await Promise.all(
    RPCS.map(async ([name, args]) => {
      const { error } = await supabase.rpc(name, args as any);
      if (error && (error.code === "PGRST202" || /Could not find the function|schema cache/i.test(error.message))) {
        missingRpcs.push(name);
      }
    }),
  );

  return { ok: missingTables.length === 0 && missingRpcs.length === 0, missingTables, missingRpcs };
}

export function useCmsHealth() {
  return useQuery({
    queryKey: ["cms_health"],
    queryFn: checkCmsHealth,
    staleTime: 60_000,
    retry: false,
  });
}

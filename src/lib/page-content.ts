import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";

export type PageContentMap = Record<string, string>;

/**
 * Returns a { "section.key" -> value } map for a page.
 * Live-synced: admin saves invalidate ["page_content", page].
 */
export function usePageContent(page: string) {
  const preview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "1";
  return useQuery({
    queryKey: ["page_content", page, preview ? "preview" : "published"],
    queryFn: async (): Promise<PageContentMap> => {
      let query = supabase
        .from("page_content")
        .select(preview ? "section,key,value,draft_value,status" : "section,key,value")
        .eq("page", page);
      if (!preview) query = query.eq("status", "published");
      const { data, error } = await query;
      if (error) throw error;
      const map: PageContentMap = {};
      (data ?? []).forEach((r: any) => {
        map[`${r.section}.${r.key}`] = preview ? (r.draft_value ?? r.value ?? "") : (r.value ?? "");
      });
      return map;
    },
    // Realtime invalidation keeps published content fresh without refetching on every mount/focus.
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function pv(map: PageContentMap | undefined, key: string, fallback = ""): string {
  const v = map?.[key];
  return v && v.trim() !== "" ? v : fallback;
}

/** Resolve CMS image values while ignoring stale build-generated asset paths. */
export function publicImageValue(
  map: PageContentMap | undefined,
  key: string,
  fallback: string,
): string {
  const value = pv(map, key, fallback).trim();
  return value.startsWith("/assets/") ? fallback : value;
}

/** Convenience hook returning a resolver function bound to a page. */
export function usePageText(page: string) {
  const { data } = usePageContent(page);
  return (key: string, fallback = "") => pv(data, key, fallback);
}

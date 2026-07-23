import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";

export type PageContentMap = Record<string, string>;

/**
 * Returns a { key -> value } map for a page (all sections combined).
 * Keys are `${section}.${key}` — access `map["hero.image"]`.
 */
export function usePageContent(page: string) {
  return useQuery({
    queryKey: ["page_content", page],
    queryFn: async (): Promise<PageContentMap> => {
      const { data, error } = await supabase
        .from("page_content")
        .select("section,key,value")
        .eq("page", page);
      if (error) throw error;
      const map: PageContentMap = {};
      (data ?? []).forEach((r: any) => {
        map[`${r.section}.${r.key}`] = r.value ?? "";
      });
      return map;
    },
  });
}

export function pv(map: PageContentMap | undefined, key: string, fallback = ""): string {
  return (map && map[key]) || fallback;
}

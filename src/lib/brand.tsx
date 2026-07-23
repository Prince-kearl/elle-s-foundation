import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";

// Loads brand_settings once and injects them as CSS variables on <html>.
// Admin edits to brand invalidate ["brand"] and re-theme the live site.

function hexToOklch(hex: string): string | null {
  const h = hex.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return `oklch(from ${hex} l c h)`;
}

export function useBrand() {
  return useQuery({
    queryKey: ["brand"],
    queryFn: async () => {
      const { data, error } = await supabase.from("brand_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data as any;
    },
    staleTime: 60_000,
  });
}

export function BrandStyle() {
  const { data } = useBrand();

  useEffect(() => {
    if (!data) return;
    const root = document.documentElement;
    const set = (name: string, hex: string | null | undefined) => {
      if (!hex) return;
      const v = hexToOklch(hex);
      if (v) root.style.setProperty(name, v);
    };
    set("--primary", data.primary_color);
    set("--forest", data.forest_color);
    set("--cream", data.cream_color);
    set("--sand", data.sand_color);
    set("--earth", data.earth_color);
    set("--gold", data.gold_color);
    set("--ink", data.ink_color);
    set("--background", data.background_color);
    if (data.radius) root.style.setProperty("--radius", data.radius);
    if (data.base_font_size) root.style.setProperty("font-size", data.base_font_size);

    // Fonts: build a stack
    if (data.heading_font) {
      root.style.setProperty("--font-display", `"${data.heading_font}", ui-serif, Georgia, serif`);
    }
    if (data.body_font) {
      root.style.setProperty("--font-sans", `"${data.body_font}", ui-sans-serif, system-ui, sans-serif`);
    }

    // Dynamically load Google Fonts for chosen families
    const families = new Set<string>();
    if (data.heading_font) families.add(data.heading_font);
    if (data.body_font) families.add(data.body_font);
    const familyParam = Array.from(families)
      .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
      .join("&");
    if (familyParam) {
      const id = "brand-fonts";
      let link = document.getElementById(id) as HTMLLinkElement | null;
      const href = `https://fonts.googleapis.com/css2?${familyParam}&display=swap`;
      if (!link) {
        link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      if (link.href !== href) link.href = href;
    }
  }, [data]);

  return null;
}

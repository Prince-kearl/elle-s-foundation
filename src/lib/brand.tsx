import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "./supabase";

// Loads brand_settings (global) + page_brand (per-page overrides) and injects
// them as CSS variables on <html>. Admin edits invalidate ["brand"]/["page_brand"]
// and re-theme the live site instantly.

export type BrandValues = Record<string, any>;

function toColor(value: string | null | undefined): string | null {
  if (!value) return null;
  const color = String(value).trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(color) || /^(rgb|rgba|hsl|hsla|oklch|oklab|color)\(/i.test(color)) return color;
  return null;
}

export const BRAND_DEFAULTS: BrandValues = {
  primary_color: "#0F6848",
  forest_color: "#084B35",
  cream_color: "#F1FAE9",
  sand_color: "#CDECA7",
  earth_color: "#F26518",
  gold_color: "#FF8A3D",
  ink_color: "#124A3A",
  background_color: "#FBFFF8",
  heading_font: "DM Sans",
  body_font: "Manrope",
  base_font_size: "16px",
  heading_scale: 1,
  body_scale: 1,
  letter_spacing: "0em",
  line_height: "1.6",
  section_spacing: "6rem",
  container_width: "1200px",
  radius: "0.625rem",
  heading_weight: "600",
  muted_color: "#6B7280",
  custom_heading_font_url: "",
  custom_body_font_url: "",
};

export function useBrand() {
  return useQuery({
    queryKey: ["brand"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return (data as BrandValues) ?? BRAND_DEFAULTS;
    },
    staleTime: 30_000,
  });
}

export function usePageBrand(page?: string) {
  return useQuery({
    queryKey: ["page_brand", page],
    enabled: !!page,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_brand")
        .select("*")
        .eq("page", page!)
        .maybeSingle();
      if (error) throw error;
      return (data as BrandValues) ?? null;
    },
    staleTime: 30_000,
  });
}

/** Route path -> page key used by the brand + content editors. */
export function pageKeyFromPath(path: string): string {
  const seg = path.split("?")[0].split("/").filter(Boolean)[0];
  if (!seg) return "home";
  return seg;
}

/** Merge global brand with an enabled per-page override. */
export function mergeBrand(
  global: BrandValues | undefined,
  page: BrandValues | null | undefined,
): BrandValues {
  const base = { ...BRAND_DEFAULTS, ...(global ?? {}) };
  if (!page || !page.enabled) return base;
  const out = { ...base };
  Object.entries(page).forEach(([k, v]) => {
    if (k === "page" || k === "enabled" || k === "updated_at") return;
    if (v !== null && v !== undefined && v !== "") out[k] = v;
  });
  return out;
}

export function brandCssVars(v: BrandValues): Record<string, string> {
  const vars: Record<string, string> = {};
  const c = (name: string, key: string) => {
    const val = toColor(v[key]);
    if (val) vars[name] = val;
  };
  c("--primary", "primary_color");
  c("--forest", "forest_color");
  c("--cream", "cream_color");
  c("--sand", "sand_color");
  c("--earth", "earth_color");
  c("--gold", "gold_color");
  c("--ink", "ink_color");
  c("--background", "background_color");
  if (v.radius) vars["--radius"] = String(v.radius);
  if (v.heading_weight) vars["--heading-weight"] = String(v.heading_weight);
  const muted = toColor(v.muted_color);
  if (muted) vars["--muted-foreground"] = muted;
  if (v.heading_font)
    vars["--font-display"] = `"${v.custom_heading_font_url ? "Elle Custom Heading" : v.heading_font}", ui-sans-serif, system-ui, sans-serif`;
  if (v.body_font) vars["--font-sans"] = `"${v.custom_body_font_url ? "Elle Custom Body" : v.body_font}", ui-sans-serif, system-ui, sans-serif`;
  if (v.heading_scale) vars["--heading-scale"] = String(v.heading_scale);
  if (v.body_scale) vars["--body-scale"] = String(v.body_scale);
  if (v.letter_spacing) vars["--brand-letter-spacing"] = String(v.letter_spacing);
  if (v.line_height) vars["--brand-line-height"] = String(v.line_height);
  if (v.section_spacing) vars["--section-spacing"] = String(v.section_spacing);
  if (v.container_width) vars["--container-width"] = String(v.container_width);
  return vars;
}

const SINGLE_WEIGHT_FONTS = new Set(["DM Serif Display", "Instrument Serif"]);

export function loadBrandFonts(v: BrandValues, id = "brand-fonts") {
  loadCustomBrandFonts(v);
  if (typeof document === "undefined") return;
  const families = new Set<string>();
  if (v.heading_font) families.add(String(v.heading_font));
  if (v.body_font) families.add(String(v.body_font));
  const familyParam = Array.from(families)
    .map((font) => {
      const family = encodeURIComponent(font);
      return SINGLE_WEIGHT_FONTS.has(font)
        ? `family=${family}`
        : `family=${family}:wght@400;500;600;700;800`;
    })
    .join("&");
  if (!familyParam) return;
  const href = `https://fonts.googleapis.com/css2?${familyParam}&display=swap`;
  let link = document.getElementById(id) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
}

function loadCustomBrandFonts(v: BrandValues, id = "custom-brand-fonts") {
  if (typeof document === "undefined") return;
  const rules: string[] = [];
  const fontFace = (family: string, value: unknown) => {
    const url = String(value ?? "").replace(/"/g, "");
    if (!url) return "";
    const extension = url.split("?")[0].split(".").pop()?.toLowerCase();
    const format = extension === "woff" ? "woff" : extension === "ttf" ? "truetype" : extension === "otf" ? "opentype" : "woff2";
    return `@font-face { font-family: "${family}"; src: url("${url}") format("${format}"); font-weight: 400 800; font-style: normal; font-display: swap; }`;
  };
  if (v.custom_heading_font_url) rules.push(fontFace("Elle Custom Heading", v.custom_heading_font_url));
  if (v.custom_body_font_url) rules.push(fontFace("Elle Custom Body", v.custom_body_font_url));
  let style = document.getElementById(id) as HTMLStyleElement | null;
  if (!rules.length) {
    style?.remove();
    return;
  }
  if (!style) {
    style = document.createElement("style");
    style.id = id;
    document.head.appendChild(style);
  }
  style.textContent = rules.join("\\n");
}

export function BrandStyle() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const page = pageKeyFromPath(path);
  const { data: global } = useBrand();
  const { data: pageOverride } = usePageBrand(page);

  useEffect(() => {
    const merged = mergeBrand(global, pageOverride);
    const root = document.documentElement;
    const vars = brandCssVars(merged);
    Object.entries(vars).forEach(([k, val]) => root.style.setProperty(k, val));
    if (merged.base_font_size) root.style.setProperty("font-size", String(merged.base_font_size));
    loadBrandFonts(merged);
  }, [global, pageOverride]);

  return null;
}

import { createFileRoute } from "@tanstack/react-router";
import {
  AdminLayout,
  AdminCard,
  PrimaryButton,
  GhostButton,
  Field,
  TextInput,
  TextArea,
} from "@/components/admin/AdminLayout";
import { useBrand, usePageBrand, mergeBrand, BRAND_DEFAULTS } from "@/lib/brand";
import { supabase } from "@/lib/supabase";
import { uploadFont } from "@/lib/storage";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/brand")({
  head: () => ({
    meta: [{ title: "Brand & Theme — Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: BrandAdmin,
});

const COLOR_FIELDS: [string, string][] = [
  ["primary_color", "Primary"],
  ["forest_color", "Forest"],
  ["earth_color", "Earth"],
  ["gold_color", "Accent Gold"],
  ["cream_color", "Cream"],
  ["sand_color", "Sand"],
  ["ink_color", "Ink"],
  ["background_color", "Background"],
  ["muted_color", "Muted text"],
];

const FONT_CHOICES = [
  "Playfair Display",
  "Cormorant Garamond",
  "Lora",
  "DM Serif Display",
  "Instrument Serif",
  "Libre Baskerville",
  "Merriweather",
  "Bodoni Moda",
  "Source Serif 4",
  "Inter",
  "Plus Jakarta Sans",
  "Poppins",
  "DM Sans",
  "Manrope",
  "Work Sans",
  "Outfit",
  "Public Sans",
  "Nunito Sans",
  "Space Grotesk",
  "IBM Plex Sans",
  "Roboto",
];

const PAGES = ["global", "home", "about", "programs", "sponsor", "donate", "contact"] as const;
type PageKey = (typeof PAGES)[number];

function BrandAdmin() {
  const qc = useQueryClient();
  const [scope, setScope] = useState<PageKey>("global");
  const { data: global } = useBrand();
  const { data: pageRow } = usePageBrand(scope === "global" ? undefined : scope);

  const [v, setV] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [sampleHeading, setSampleHeading] = useState("Feeding Hope. Restoring Lives.");
  const [sampleBody, setSampleBody] = useState("This sample shows how your selected font, weight, style, and scale will appear across the foundation website.");

  useEffect(() => {
    if (scope === "global") setV({ ...BRAND_DEFAULTS, ...(global ?? {}) });
    else setV({ enabled: false, ...(pageRow ?? {}), page: scope });
  }, [scope, global, pageRow]);

  const preview =
    scope === "global" ? { ...BRAND_DEFAULTS, ...v } : mergeBrand(global, { ...v, enabled: true });

  const set = (k: string, val: any) => setV((p: any) => ({ ...p, [k]: val }));

  const uploadCustomFont = async (field: "heading" | "body", file?: File) => {
    if (!file) return;
    try {
      const result = await uploadFont(file);
      const urlField = field === "heading" ? "custom_heading_font_url" : "custom_body_font_url";
      const fontField = field === "heading" ? "heading_font" : "body_font";
      set(urlField, result.url);
      set(fontField, field === "heading" ? "Elle Custom Heading" : "Elle Custom Body");
      toast.success(`${field === "heading" ? "Heading" : "Body"} font uploaded`);
    } catch (error: any) {
      toast.error(error?.message ?? "Could not upload font");
    }
  };

  const clearCustomFont = (field: "heading" | "body") => {
    const urlField = field === "heading" ? "custom_heading_font_url" : "custom_body_font_url";
    const fontField = field === "heading" ? "heading_font" : "body_font";
    set(urlField, "");
    set(fontField, overriding ? "" : field === "heading" ? BRAND_DEFAULTS.heading_font : BRAND_DEFAULTS.body_font);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (scope === "global") {
        const { error } = await supabase
          .from("brand_settings")
          .upsert({ ...v, id: 1, updated_at: new Date().toISOString() });
        if (error) throw error;
        await qc.invalidateQueries({ queryKey: ["brand"] });
      } else {
        const { error } = await supabase
          .from("page_brand")
          .upsert(
            { ...v, page: scope, updated_at: new Date().toISOString() },
            { onConflict: "page" },
          );
        if (error) throw error;
        await qc.invalidateQueries({ queryKey: ["page_brand"] });
      }
      toast.success(scope === "global" ? "Global theme updated" : `${scope} theme updated`);
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    if (scope === "global") setV({ ...BRAND_DEFAULTS });
    else setV({ page: scope, enabled: false });
  };

  const overriding = scope !== "global";

  return (
    <AdminLayout
      title="Brand & Theme"
      subtitle="Colors, fonts, typography scale and spacing — globally or per page. No code needed."
      action={
        <div className="flex gap-2">
          <GhostButton onClick={reset}>
            <RotateCcw className="size-4" /> Reset
          </GhostButton>
          <PrimaryButton onClick={save} disabled={saving}>
            <Save className="size-4" /> Save theme
          </PrimaryButton>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {PAGES.map((p) => (
          <button
            key={p}
            onClick={() => setScope(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${scope === p ? "bg-primary text-white" : "bg-white border border-[#E5E7EB] text-[#4B5563] hover:border-primary/40"}`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4 items-start">
        <div className="space-y-4">
          {overriding && (
            <AdminCard className="p-5 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium text-sm">Enable overrides for “{scope}”</div>
                <div className="text-xs text-[#6B7280] mt-0.5">
                  When off, this page uses the global theme. Leave a field blank to inherit it.
                </div>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={!!v.enabled}
                  onChange={(e) => set("enabled", e.target.checked)}
                />
                <span className="w-11 h-6 bg-[#E5E7EB] peer-checked:bg-primary rounded-full relative transition after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:size-5 after:rounded-full after:transition peer-checked:after:translate-x-5" />
              </label>
            </AdminCard>
          )}

          <AdminCard className="p-6">
            <h3 className="font-display text-xl text-primary mb-4">Colors</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {COLOR_FIELDS.map(([name, label]) => (
                <Field key={name} label={label}>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={v[name] || preview[name] || "#000000"}
                      onChange={(e) => set(name, e.target.value)}
                      className="h-10 w-14 rounded-lg border border-[#E5E7EB] cursor-pointer"
                    />
                    <TextInput
                      value={v[name] ?? ""}
                      placeholder={overriding ? "inherit" : ""}
                      onChange={(e) => set(name, e.target.value)}
                    />
                  </div>
                </Field>
              ))}
            </div>
          </AdminCard>

          <AdminCard className="p-6">
            <h3 className="font-display text-xl text-primary mb-4">Typography</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Heading font">
                <select
                  value={v.heading_font ?? ""}
                  onChange={(e) => set("heading_font", e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm bg-white"
                >
                  {overriding && <option value="">Inherit global</option>}
                  {v.custom_heading_font_url && <option value="Elle Custom Heading">Custom uploaded font</option>}
                  {FONT_CHOICES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <FontUploadControl label="Upload heading font" hasCustom={Boolean(v.custom_heading_font_url)} onUpload={(file) => void uploadCustomFont("heading", file)} onClear={() => clearCustomFont("heading")} />
              </Field>
              <Field label="Body font">
                <select
                  value={v.body_font ?? ""}
                  onChange={(e) => set("body_font", e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm bg-white"
                >
                  {overriding && <option value="">Inherit global</option>}
                  {v.custom_body_font_url && <option value="Elle Custom Body">Custom uploaded font</option>}
                  {FONT_CHOICES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <FontUploadControl label="Upload body font" hasCustom={Boolean(v.custom_body_font_url)} onUpload={(file) => void uploadCustomFont("body", file)} onClear={() => clearCustomFont("body")} />
              </Field>
              <div className="sm:col-span-2 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
                <Field label="Custom heading weight">
                  <select value={v.custom_heading_font_weight ?? "600"} onChange={(e) => set("custom_heading_font_weight", e.target.value)} disabled={!v.custom_heading_font_url} className="w-full border border-border bg-card px-3.5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                    {["400", "500", "600", "700", "800"].map((weight) => <option key={weight} value={weight}>{weight}</option>)}
                  </select>
                </Field>
                <Field label="Custom heading style">
                  <select value={v.custom_heading_font_style ?? "normal"} onChange={(e) => set("custom_heading_font_style", e.target.value)} disabled={!v.custom_heading_font_url} className="w-full border border-border bg-card px-3.5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="normal">Normal</option>
                    <option value="italic">Italic</option>
                  </select>
                </Field>
                <Field label="Custom body weight">
                  <select value={v.custom_body_font_weight ?? "400"} onChange={(e) => set("custom_body_font_weight", e.target.value)} disabled={!v.custom_body_font_url} className="w-full border border-border bg-card px-3.5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                    {["400", "500", "600", "700", "800"].map((weight) => <option key={weight} value={weight}>{weight}</option>)}
                  </select>
                </Field>
                <Field label="Custom body style">
                  <select value={v.custom_body_font_style ?? "normal"} onChange={(e) => set("custom_body_font_style", e.target.value)} disabled={!v.custom_body_font_url} className="w-full border border-border bg-card px-3.5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="normal">Normal</option>
                    <option value="italic">Italic</option>
                  </select>
                </Field>
              </div>
              <Field label="Heading weight">
                <select                   value={v.heading_weight ?? (overriding ? "" : "600")} onChange={(e) => set("heading_weight", e.target.value)} className="w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm bg-white">
                  {overriding && <option value="">Inherit global</option>}
                  {["400", "500", "600", "700", "800"].map((weight) => <option key={weight} value={weight}>{weight}</option>)}
                </select>
              </Field>
              <Field label="Base font size">
                <TextInput
                  value={v.base_font_size ?? ""}
                  placeholder="16px"
                  onChange={(e) => set("base_font_size", e.target.value)}
                />
              </Field>
              <Field label="Corner radius">
                <TextInput
                  value={v.radius ?? ""}
                  placeholder="0.625rem"
                  onChange={(e) => set("radius", e.target.value)}
                />
              </Field>
              <Slider
                label="Heading scale"
                value={Number(v.heading_scale ?? preview.heading_scale ?? 1)}
                min={0.8}
                max={1.4}
                step={0.02}
                onChange={(n) => set("heading_scale", n)}
              />
              <Slider
                label="Body scale"
                value={Number(v.body_scale ?? preview.body_scale ?? 1)}
                min={0.85}
                max={1.3}
                step={0.02}
                onChange={(n) => set("body_scale", n)}
              />
              <Field label="Letter spacing">
                <TextInput
                  value={v.letter_spacing ?? ""}
                  placeholder="0em"
                  onChange={(e) => set("letter_spacing", e.target.value)}
                />
              </Field>
              <Field label="Line height">
                <TextInput
                  value={v.line_height ?? ""}
                  placeholder="1.6"
                  onChange={(e) => set("line_height", e.target.value)}
                />
              </Field>
            </div>
          </AdminCard>

          <AdminCard className="p-6">
            <h3 className="font-display text-xl text-primary mb-4">Spacing & layout</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Section spacing (vertical rhythm)">
                <TextInput
                  value={v.section_spacing ?? ""}
                  placeholder="6rem"
                  onChange={(e) => set("section_spacing", e.target.value)}
                />
              </Field>
              <Field label="Container max width">
                <TextInput
                  value={v.container_width ?? ""}
                  placeholder="1200px"
                  onChange={(e) => set("container_width", e.target.value)}
                />
              </Field>
            </div>
          </AdminCard>
        </div>

        <AdminCard className="p-6 lg:sticky lg:top-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-xl text-primary">Live preview</h3>
              <p className="mt-1 text-xs text-muted-foreground">Test your typography before saving.</p>
            </div>
            <button type="button" onClick={() => { setSampleHeading("Feeding Hope. Restoring Lives."); setSampleBody("This sample shows how your selected font, weight, style, and scale will appear across the foundation website."); }} className="text-xs font-semibold text-primary underline underline-offset-2 hover:text-earth">Reset sample</button>
          </div>
          <div className="mb-5 grid gap-3 border-b border-border pb-5">
            <Field label="Sample heading">
              <TextInput value={sampleHeading} onChange={(event) => setSampleHeading(event.target.value)} placeholder="Enter a heading to preview" />
            </Field>
            <Field label="Sample body text">
              <TextArea value={sampleBody} onChange={(event) => setSampleBody(event.target.value)} rows={3} placeholder="Enter body copy to preview" />
            </Field>
          </div>
          <LivePreview v={preview} sampleHeading={sampleHeading} sampleBody={sampleBody} />
        </AdminCard>
      </div>
    </AdminLayout>
  );
}

function FontUploadControl({ label, hasCustom, onUpload, onClear }: { label: string; hasCustom: boolean; onUpload: (file: File) => void; onClear: () => void }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <label className="inline-flex cursor-pointer items-center border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-muted">
        {label}
        <input type="file" accept=".woff2,.woff,.ttf,.otf,font/woff2,font/woff,font/ttf,font/otf" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = ""; }} />
      </label>
      {hasCustom && <button type="button" onClick={onClear} className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-earth">Remove custom font</button>}
      <span className="w-full text-[11px] text-muted-foreground">WOFF2, WOFF, TTF, or OTF · max 5MB</span>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <Field label={`${label} — ${value.toFixed(2)}×`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#44533D]"
      />
    </Field>
  );
}

function LivePreview({ v, sampleHeading, sampleBody }: { v: any; sampleHeading: string; sampleBody: string }) {
  const hs = Number(v.heading_scale ?? 1);
  const bs = Number(v.body_scale ?? 1);
  return (
    <div
      className="rounded-lg overflow-hidden border border-[#EEF0F3]"
      style={{
        background: v.background_color,
        borderRadius: v.radius,
                    letterSpacing: v.letter_spacing,
            fontSize: v.base_font_size,
            lineHeight: v.line_height,

      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: v.cream_color }}
      >
        <span
          style={{
            fontFamily: `"${v.heading_font}"`,
            color: v.primary_color,
            fontWeight: v.custom_heading_font_url ? v.custom_heading_font_weight : v.heading_weight,
            fontSize: `${1.05 * hs}rem`,
            fontStyle: v.custom_heading_font_url ? v.custom_heading_font_style : "normal",
          }}
        >
          Elle's Foundation
        </span>
        <span
          className="px-3 py-1.5 text-xs text-white"
          style={{ background: v.primary_color, borderRadius: 999 }}
        >
          Donate
        </span>
      </div>
      <div style={{ padding: `calc(${v.section_spacing || "6rem"} / 4) 1rem` }}>
        <span
          className="inline-block text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full"
          style={{ background: v.sand_color, color: v.earth_color }}
        >
          Our Mission
        </span>
        <div
          style={{
            fontFamily: `"${v.heading_font}"`,
            color: v.primary_color,
            fontWeight: v.custom_heading_font_url ? v.custom_heading_font_weight : v.heading_weight,
            fontSize: `${1.85 * hs}rem`,
            lineHeight: 1.05,
            fontStyle: v.custom_heading_font_url ? v.custom_heading_font_style : "normal",
            marginTop: "0.75rem",
          }}
        >
          {sampleHeading || "Your heading preview"}
        </div>
        <p
          style={{
            fontFamily: `"${v.body_font}"`,
            color: v.muted_color || v.ink_color,
            fontSize: `${0.875 * bs}rem`,
            fontWeight: v.custom_body_font_url ? v.custom_body_font_weight : 400,
            fontStyle: v.custom_body_font_url ? v.custom_body_font_style : "normal",
            lineHeight: v.line_height,
            marginTop: "0.75rem",
            opacity: 0.85,
          }}
        >
          {sampleBody || "Your body-text preview"}
        </p>
        <div className="mt-4 flex gap-2">
          <button
            className="px-4 py-2 text-xs font-medium text-white"
            style={{ background: v.primary_color, borderRadius: v.radius }}
          >
            Donate now
          </button>
          <button
            className="px-4 py-2 text-xs font-medium"
            style={{
              background: "transparent",
              border: `1px solid ${v.primary_color}`,
              color: v.primary_color,
              borderRadius: v.radius,
            }}
          >
            Sponsor
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {["12,400+ children", "46 communities"].map((t) => (
            <div
              key={t}
              className="p-3 text-xs"
              style={{
                background: v.cream_color,
                borderRadius: v.radius,
                color: v.ink_color,
                fontFamily: `"${v.body_font}"`,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
      <div
        className="px-4 py-3 text-[10px]"
        style={{ background: v.ink_color, color: v.cream_color }}
      >
        © Elle's Foundation
      </div>
    </div>
  );
}

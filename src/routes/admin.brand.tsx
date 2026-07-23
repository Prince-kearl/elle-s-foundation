import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, AdminCard, PrimaryButton, Field, TextInput } from "@/components/admin/AdminLayout";
import { useBrand } from "@/lib/brand";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/brand")({
  head: () => ({ meta: [{ title: "Brand & Theme — Admin" }, { name: "robots", content: "noindex" }] }),
  component: BrandAdmin,
});

const COLOR_FIELDS = [
  ["primary_color", "Primary"],
  ["forest_color", "Forest"],
  ["earth_color", "Earth"],
  ["gold_color", "Accent Gold"],
  ["cream_color", "Cream"],
  ["sand_color", "Sand"],
  ["ink_color", "Ink"],
  ["background_color", "Background"],
];

const FONT_CHOICES = [
  "Playfair Display", "Cormorant Garamond", "Lora", "DM Serif Display", "Instrument Serif",
  "Inter", "Poppins", "DM Sans", "Manrope", "Work Sans",
];

function BrandAdmin() {
  const { data } = useBrand();
  const qc = useQueryClient();
  const [v, setV] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (data) setV(data); }, [data]);

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("brand_settings").upsert({ ...v, id: 1, updated_at: new Date().toISOString() });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["brand"] });
      toast.success("Brand updated");
    } catch (e: any) { toast.error(e?.message ?? "Save failed"); }
    finally { setSaving(false); }
  };

  return (
    <AdminLayout
      title="Brand & Theme"
      subtitle="Colors, fonts, radius — change once, apply everywhere. No code needed."
      action={<PrimaryButton onClick={save} disabled={saving}><Save className="size-4" /> Save theme</PrimaryButton>}
    >
      <div className="space-y-4 max-w-4xl">
        <AdminCard className="p-6">
          <h3 className="font-display text-xl text-primary mb-4">Colors</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {COLOR_FIELDS.map(([name, label]) => (
              <Field key={name} label={label}>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={v[name] || "#000000"}
                    onChange={(e) => setV({ ...v, [name]: e.target.value })}
                    className="h-10 w-14 rounded-lg border border-[#E5E7EB] cursor-pointer"
                  />
                  <TextInput value={v[name] ?? ""} onChange={(e) => setV({ ...v, [name]: e.target.value })} />
                </div>
              </Field>
            ))}
          </div>
        </AdminCard>

        <AdminCard className="p-6">
          <h3 className="font-display text-xl text-primary mb-4">Typography</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Heading font">
              <select value={v.heading_font ?? "Playfair Display"} onChange={(e) => setV({ ...v, heading_font: e.target.value })}
                className="w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm bg-white">
                {FONT_CHOICES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Body font">
              <select value={v.body_font ?? "Inter"} onChange={(e) => setV({ ...v, body_font: e.target.value })}
                className="w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm bg-white">
                {FONT_CHOICES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Base font size (e.g. 16px)">
              <TextInput value={v.base_font_size ?? "16px"} onChange={(e) => setV({ ...v, base_font_size: e.target.value })} />
            </Field>
            <Field label="Corner radius (e.g. 0.625rem)">
              <TextInput value={v.radius ?? "0.625rem"} onChange={(e) => setV({ ...v, radius: e.target.value })} />
            </Field>
          </div>
        </AdminCard>

        <AdminCard className="p-6">
          <h3 className="font-display text-xl text-primary mb-4">Preview</h3>
          <div className="rounded-lg p-6" style={{ background: v.cream_color }}>
            <div className="font-display text-3xl" style={{ color: v.primary_color, fontFamily: `"${v.heading_font}"` }}>
              Feeding Hope. Restoring Lives.
            </div>
            <p className="mt-3 text-sm" style={{ color: v.ink_color, fontFamily: `"${v.body_font}"` }}>
              This is how your body text will look across the site.
            </p>
            <button className="mt-4 px-5 py-2.5 text-sm font-medium text-white" style={{ background: v.primary_color, borderRadius: v.radius }}>
              Donate now
            </button>
          </div>
        </AdminCard>
      </div>
    </AdminLayout>
  );
}

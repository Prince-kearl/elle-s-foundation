import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, AdminCard, PrimaryButton, Field, TextInput } from "@/components/admin/AdminLayout";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { useSiteCopy } from "@/lib/cms";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/hero")({
  head: () => ({ meta: [{ title: "Hero — Admin" }, { name: "robots", content: "noindex" }] }),
  component: HeroAdmin,
});

const KEYS = [
  { name: "eyebrow", label: "Eyebrow badge", type: "text" as const },
  { name: "title_line_1", label: "Title — line 1", type: "text" as const },
  { name: "title_line_2", label: "Title — line 2 (italic)", type: "text" as const },
  { name: "description", label: "Description", type: "textarea" as const },
  { name: "cta_primary_label", label: "Primary button label", type: "text" as const },
  { name: "cta_primary_href", label: "Primary button link", type: "text" as const },
  { name: "cta_secondary_label", label: "Secondary button label", type: "text" as const },
  { name: "cta_secondary_href", label: "Secondary button link", type: "text" as const },
  { name: "trust_line", label: "Trust line under CTAs", type: "text" as const },
];

function HeroAdmin() {
  const { data } = useSiteCopy("hero");
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (data) setValues(data); }, [data]);

  const save = async () => {
    setSaving(true);
    try {
      const rows = KEYS.map((k) => ({ section: "hero", key: k.name, value_text: values[k.name] ?? "" }));
      const { error } = await supabase.from("site_content").upsert(rows, { onConflict: "section,key" });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["site_copy", "hero"] });
      toast.success("Hero updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    } finally { setSaving(false); }
  };

  return (
    <AdminLayout
      title="Hero Section"
      subtitle="Edit the headline, description, and buttons on your homepage hero."
      action={<PrimaryButton onClick={save} disabled={saving}><Save className="size-4" /> Save changes</PrimaryButton>}
    >
      <AdminCard className="p-6 max-w-3xl">
        <div className="grid sm:grid-cols-2 gap-4">
          {KEYS.map((k) => (
            <div key={k.name} className={k.type === "textarea" ? "sm:col-span-2" : ""}>
              <Field label={k.label}>
                {k.type === "textarea"
                  ? <RichTextEditor value={values[k.name] ?? ""} onChange={(value) => setValues({ ...values, [k.name]: value })} />
                  : <TextInput value={values[k.name] ?? ""} onChange={(e) => setValues({ ...values, [k.name]: e.target.value })} />}
              </Field>
            </div>
          ))}
        </div>
      </AdminCard>
    </AdminLayout>
  );
}

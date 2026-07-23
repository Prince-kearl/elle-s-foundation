import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, AdminCard, PrimaryButton, Field, TextInput } from "@/components/admin/AdminLayout";
import { ImageField } from "@/components/admin/ImageField";
import { useSiteSettings } from "@/lib/cms";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Site Settings — Admin" }, { name: "robots", content: "noindex" }] }),
  component: SettingsAdmin,
});

const GROUPS = [
  { title: "Organization", fields: [
    { name: "org_name", label: "Organization name" },
    { name: "tagline", label: "Tagline" },
    { name: "logo_url", label: "Logo URL" },
  ]},
  { title: "Contact", fields: [
    { name: "email", label: "Email" },
    { name: "phone", label: "Phone" },
    { name: "address", label: "Address" },
  ]},
  { title: "Social", fields: [
    { name: "facebook_url", label: "Facebook URL" },
    { name: "instagram_url", label: "Instagram URL" },
    { name: "twitter_url", label: "Twitter/X URL" },
    { name: "linkedin_url", label: "LinkedIn URL" },
  ]},
  { title: "Links & Copy", fields: [
    { name: "donate_url", label: "Donate button link" },
    { name: "newsletter_headline", label: "Newsletter headline" },
  ]},
];

function SettingsAdmin() {
  const { data } = useSiteSettings();
  const qc = useQueryClient();
  const [values, setValues] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (data) setValues(data); }, [data]);

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("site_settings").upsert({ ...values, id: 1, updated_at: new Date().toISOString() });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["site_settings"] });
      toast.success("Settings saved");
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    } finally { setSaving(false); }
  };

  return (
    <AdminLayout
      title="Site Settings"
      subtitle="Organization info, contact details, and social links used across the site."
      action={<PrimaryButton onClick={save} disabled={saving}><Save className="size-4" /> Save all changes</PrimaryButton>}
    >
      <div className="space-y-4 max-w-4xl">
        {GROUPS.map((g) => (
          <AdminCard key={g.title} className="p-6">
            <h3 className="font-display text-xl text-primary mb-4">{g.title}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {g.fields.map((f) => (
                <Field key={f.name} label={f.label}>
                  {f.name === "logo_url" ? (
                    <ImageField value={values[f.name] ?? ""} onChange={(url) => setValues({ ...values, [f.name]: url })} folder="branding" />
                  ) : (
                    <TextInput value={values[f.name] ?? ""} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
                  )}
                </Field>
              ))}
            </div>
          </AdminCard>
        ))}
      </div>
    </AdminLayout>
  );
}

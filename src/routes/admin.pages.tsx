import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, AdminCard, PrimaryButton, Field, TextInput, TextArea } from "@/components/admin/AdminLayout";
import { MediaField } from "@/components/admin/ImageField";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/pages")({
  head: () => ({ meta: [{ title: "Pages — Admin" }, { name: "robots", content: "noindex" }] }),
  component: PagesAdmin,
});

const PAGES = ["home", "about", "programs", "sponsor", "donate", "contact", "footer"] as const;

function PagesAdmin() {
  const [page, setPage] = useState<(typeof PAGES)[number]>("home");
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["a", "page_content", page],
    queryFn: async () => {
      const { data, error } = await supabase.from("page_content").select("*").eq("page", page).order("section").order("position");
      if (error) throw error;
      return data ?? [];
    },
  });

  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const m: Record<string, string> = {};
    rows.forEach((r: any) => { m[r.id] = r.value ?? ""; });
    setValues(m);
  }, [rows]);

  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      const updates = rows.map((r: any) => ({ ...r, value: values[r.id] ?? "", updated_at: new Date().toISOString() }));
      const { error } = await supabase.from("page_content").upsert(updates);
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["page_content", page] });
      toast.success("Page saved — live site updated");
    } catch (e: any) { toast.error(e?.message ?? "Save failed"); }
    finally { setSaving(false); }
  };

  // group by section
  const grouped: Record<string, any[]> = {};
  rows.forEach((r: any) => { (grouped[r.section] ??= []).push(r); });

  return (
    <AdminLayout
      title="Page Content"
      subtitle="Edit every text, image and video used on each public page."
      action={<PrimaryButton onClick={save} disabled={saving || isLoading}><Save className="size-4" /> Save page</PrimaryButton>}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {PAGES.map((p) => (
          <button key={p} onClick={() => setPage(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${page === p ? "bg-primary text-white" : "bg-white border border-[#E5E7EB] text-[#4B5563] hover:border-primary/40"}`}>
            {p}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-10"><Loader2 className="inline size-5 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <AdminCard className="p-10 text-center text-sm text-[#6B7280]">No editable fields for this page yet. They'll appear once seeded in the database.</AdminCard>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {Object.entries(grouped).map(([section, items]) => (
            <AdminCard key={section} className="p-6">
              <h3 className="font-display text-lg text-primary capitalize mb-4">{section}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {items.map((r: any) => {
                  const type = r.content_type as string;
                  const wide = type === "textarea" || type === "image" || type === "video" || type === "media";
                  return (
                    <div key={r.id} className={wide ? "sm:col-span-2" : ""}>
                      <Field label={r.label || r.key}>
                        {type === "image" || type === "video" || type === "media" ? (
                          <MediaField
                            value={values[r.id] ?? ""}
                            onChange={(url) => setValues((p) => ({ ...p, [r.id]: url }))}
                            folder={`pages/${page}`}
                            accept={type === "video" ? "video" : type === "media" ? "any" : "image"}
                          />
                        ) : type === "textarea" ? (
                          <TextArea rows={4} value={values[r.id] ?? ""} onChange={(e) => setValues((p) => ({ ...p, [r.id]: e.target.value }))} />
                        ) : (
                          <TextInput value={values[r.id] ?? ""} onChange={(e) => setValues((p) => ({ ...p, [r.id]: e.target.value }))} />
                        )}
                      </Field>
                    </div>
                  );
                })}
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

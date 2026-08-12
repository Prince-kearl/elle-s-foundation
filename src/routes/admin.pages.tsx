import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, AdminCard, PrimaryButton, Field, TextInput, TextArea } from "@/components/admin/AdminLayout";
import { MediaField } from "@/components/admin/ImageField";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Save, Loader2, Eye, Send, CalendarClock, Archive } from "lucide-react";
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
    rows.forEach((r: any) => { m[r.id] = r.draft_value ?? r.value ?? ""; });
    setValues(m);
  }, [rows]);

  const [saving, setSaving] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const save = async () => {
    setSaving(true);
    try {
      const updates = rows.map((r: any) => ({ id: r.id, draft_value: values[r.id] ?? "", status: r.status === "published" ? "draft" : r.status, updated_at: new Date().toISOString() }));
      const { error } = await supabase.from("page_content").upsert(updates);
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["page_content", page] });
      toast.success("Draft saved");
    } catch (e: any) { toast.error(e?.message ?? "Save failed"); }
    finally { setSaving(false); }
  };

  const publish = async () => {
    await save();
    const { error } = await supabase.rpc("publish_page", { _page: page, _publish_at: scheduleAt || null });
    if (error) return toast.error(error.message);
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["page_content", page] }),
      qc.invalidateQueries({ queryKey: ["a", "page_content", page] }),
    ]);
    toast.success(scheduleAt ? "Page scheduled" : "Page published");
  };

  const unpublish = async () => {
    const { error } = await supabase.rpc("unpublish_page", { _page: page });
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["page_content", page] });
    toast.success("Page unpublished");
  };

  // group by section
  const grouped: Record<string, any[]> = {};
  rows.forEach((r: any) => { (grouped[r.section] ??= []).push(r); });

  return (
    <AdminLayout
      title="Page Content"
      subtitle="Edit every text, image and video used on each public page."
      action={<div className="flex flex-wrap gap-2">
        <a href={`/${page === "home" ? "" : page}?preview=1`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium"><Eye className="size-4" /> Preview</a>
        <PrimaryButton onClick={save} disabled={saving || isLoading}><Save className="size-4" /> Save draft</PrimaryButton>
        <PrimaryButton onClick={publish} disabled={saving || isLoading}>{scheduleAt ? <CalendarClock className="size-4" /> : <Send className="size-4" />} {scheduleAt ? "Schedule" : "Publish"}</PrimaryButton>
      </div>}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {PAGES.map((p) => (
          <button key={p} onClick={() => setPage(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${page === p ? "bg-primary text-white" : "bg-white border border-[#E5E7EB] text-[#4B5563] hover:border-primary/40"}`}>
            {p}
          </button>
        ))}
      </div>

      <AdminCard className="mb-4 p-4 flex flex-wrap items-end gap-3">
        <Field label="Schedule publication (optional)">
          <TextInput type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
        </Field>
        <PrimaryButton onClick={unpublish} className="!bg-none !bg-[#7F1D1D]"><Archive className="size-4" /> Unpublish</PrimaryButton>
        <p className="text-xs text-[#6B7280] pb-2">Drafts are private. Preview opens the admin-only draft view; publishing copies the draft to the live website.</p>
      </AdminCard>

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

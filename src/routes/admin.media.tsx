import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, AdminCard, PrimaryButton, GhostButton } from "@/components/admin/AdminLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { uploadMedia, deleteAsset } from "@/lib/storage";
import { useRef, useState } from "react";
import { Upload, Trash2, Copy, Loader2, Film } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/media")({
  head: () => ({ meta: [{ title: "Media Library — Admin" }, { name: "robots", content: "noindex" }] }),
  component: MediaAdmin,
});

const FILTERS = [
  ["all", "All"],
  ["image", "Images"],
  ["video", "Videos"],
] as const;

function MediaAdmin() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["a", "media_assets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("media_assets").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const shown = assets.filter((a: any) => filter === "all" || (a.kind ?? "image") === filter);

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      for (const f of Array.from(files)) await uploadMedia(f, "library");
      await qc.invalidateQueries({ queryKey: ["a", "media_assets"] });
      await qc.invalidateQueries({ queryKey: ["media_library"] });
      toast.success(`Uploaded ${files.length} file(s)`);
    } catch (e: any) { toast.error(e?.message ?? "Upload failed"); }
    finally { setBusy(false); }
  };

  const remove = async (a: any) => {
    if (!confirm("Delete this file? It may still be used on the site.")) return;
    await deleteAsset(a.id, a.path);
    await qc.invalidateQueries({ queryKey: ["a", "media_assets"] });
    await qc.invalidateQueries({ queryKey: ["media_library"] });
    toast.success("Deleted");
  };

  return (
    <AdminLayout
      title="Media Library"
      subtitle="Upload and manage every image and video used across the website."
      action={
        <PrimaryButton onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload media
        </PrimaryButton>
      }
    >
      <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => onUpload(e.target.files)} />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === k ? "bg-primary text-white" : "bg-white border border-[#E5E7EB] text-[#4B5563] hover:border-primary/40"}`}>
            {label}
          </button>
        ))}
      </div>

      <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onUpload(e.dataTransfer.files); }}>
      <AdminCard className="p-6">

        {isLoading ? (
          <div className="text-center py-10 text-sm text-[#6B7280]"><Loader2 className="inline size-4 animate-spin" /></div>
        ) : shown.length === 0 ? (
          <div className="text-center py-10 text-sm text-[#6B7280]">
            Nothing here yet. Drag files in, or click “Upload media”.
            <div className="text-[11px] mt-1">Images up to 5MB · Videos (MP4, WEBM, MOV) up to 100MB</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {shown.map((a: any) => (
              <div key={a.id} className="group relative aspect-square rounded-lg overflow-hidden border border-[#EEF0F3] bg-[#F9FAFB]">
                {(a.kind ?? "image") === "video" ? (
                  <video src={a.url} muted playsInline loop className="w-full h-full object-cover bg-black"
                    onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
                    onMouseLeave={(e) => (e.currentTarget as HTMLVideoElement).pause()} />
                ) : (
                  <img src={a.url} alt={a.alt_text || a.filename} className="w-full h-full object-cover" />
                )}
                {(a.kind ?? "image") === "video" && (
                  <span className="absolute top-1.5 left-1.5 rounded bg-black/60 text-white p-1"><Film className="size-3" /></span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-end p-2 gap-1">
                  <GhostButton onClick={() => { navigator.clipboard.writeText(a.url); toast.success("URL copied"); }} className="!bg-white !py-1 !px-2 text-xs">
                    <Copy className="size-3" />
                  </GhostButton>
                  <button onClick={() => remove(a)} className="ml-auto p-1.5 rounded-md bg-white text-red-600 hover:bg-red-50">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </AdminLayout>
  );
}

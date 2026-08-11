import { useRef, useState } from "react";
import { Upload, Image as ImageIcon, Link2, X, Loader2, Check, Film } from "lucide-react";
import { uploadMedia, kindOf, type MediaKind } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

type Tab = "upload" | "library" | "url";

export function MediaField({
  value,
  onChange,
  folder = "general",
  accept = "image",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  /** "image" | "video" | "any" */
  accept?: "image" | "video" | "any";
}) {
  const [tab, setTab] = useState<Tab>("upload");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const acceptAttr = accept === "video" ? "video/*" : accept === "any" ? "image/*,video/*" : "image/*";

  const library = useQuery({
    queryKey: ["media_library", accept],
    queryFn: async () => {
      let q = supabase.from("media_assets").select("*").order("created_at", { ascending: false }).limit(60);
      if (accept === "image") q = q.eq("kind", "image");
      if (accept === "video") q = q.eq("kind", "video");
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    enabled: tab === "library",
  });

  const handleFile = async (file: File) => {
    const k = kindOf(file);
    if (accept !== "any" && k !== accept) {
      toast.error(`Please choose ${accept === "video" ? "a video" : "an image"} file.`);
      return;
    }
    setBusy(true);
    try {
      const { url } = await uploadMedia(file, folder);
      onChange(url);
      toast.success("Uploaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const valueKind: MediaKind = value ? kindOf(value) : "image";

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative inline-block">
          {valueKind === "video" ? (
            <video src={value} muted playsInline controls className="h-32 w-auto rounded-lg border border-[#E5E7EB] bg-black" />
          ) : (
            <img src={value} alt="" className="h-32 w-auto rounded-lg border border-[#E5E7EB] object-cover" />
          )}
          <button type="button" onClick={() => onChange("")} className="absolute -top-2 -right-2 size-6 rounded-full bg-white border border-[#E5E7EB] shadow grid place-items-center text-[#6B7280] hover:text-red-600">
            <X className="size-3" />
          </button>
        </div>
      ) : null}

      <div className="rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex border-b border-[#EEF0F3] text-xs font-medium">
          {(["upload", "library", "url"] as Tab[]).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`flex-1 px-3 py-2 capitalize inline-flex items-center justify-center gap-1.5 ${tab === t ? "text-primary border-b-2 border-primary -mb-px" : "text-[#6B7280] hover:text-primary"}`}>
              {t === "upload" && <Upload className="size-3.5" />}
              {t === "library" && (accept === "video" ? <Film className="size-3.5" /> : <ImageIcon className="size-3.5" />)}
              {t === "url" && <Link2 className="size-3.5" />}
              {t}
            </button>
          ))}
        </div>

        <div className="p-3">
          {tab === "upload" && (
            <div
              className="rounded-lg border-2 border-dashed border-[#E5E7EB] p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-[#F5EFE5]/30 transition"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
            >
              <input ref={fileRef} type="file" accept={acceptAttr} className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              {busy ? (
                <div className="flex flex-col items-center gap-2 text-primary"><Loader2 className="size-5 animate-spin" /><span className="text-sm">Uploading…</span></div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-[#6B7280]">
                  <Upload className="size-5" />
                  <span className="text-sm font-medium">
                    Drop {accept === "video" ? "video" : accept === "any" ? "file" : "image"} or click to upload
                  </span>
                  <span className="text-[11px]">
                    {accept === "video" ? "MP4, WEBM, MOV · Max 100MB" : accept === "any" ? "Images max 5MB · Videos max 100MB" : "JPG, PNG, WEBP, GIF · Max 5MB"}
                  </span>
                </div>
              )}
            </div>
          )}

          {tab === "library" && (
            <div className="max-h-64 overflow-y-auto">
              {library.isLoading ? (
                <div className="p-6 text-center text-sm text-[#6B7280]"><Loader2 className="inline size-4 animate-spin" /></div>
              ) : (library.data?.length ?? 0) === 0 ? (
                <div className="p-6 text-center text-sm text-[#6B7280]">Nothing here yet. Upload one first.</div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {library.data!.map((a: any) => (
                    <button key={a.id} type="button" onClick={() => { onChange(a.url); toast.success("Selected"); }}
                      className={`relative aspect-square rounded-md overflow-hidden border ${value === a.url ? "border-primary ring-2 ring-primary/30" : "border-[#EEF0F3] hover:border-primary/40"}`}>
                      {(a.kind ?? "image") === "video" ? (
                        <video src={a.url} muted playsInline className="w-full h-full object-cover bg-black" />
                      ) : (
                        <img src={a.url} alt={a.alt_text || ""} className="w-full h-full object-cover" />
                      )}
                      {(a.kind ?? "image") === "video" && (
                        <span className="absolute top-1 left-1 rounded bg-black/60 text-white p-0.5"><Film className="size-3" /></span>
                      )}
                      {value === a.url && (
                        <div className="absolute inset-0 grid place-items-center bg-primary/40">
                          <Check className="size-5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "url" && (
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-primary"
            />
          )}
        </div>
      </div>
    </div>
  );
}

/** Backwards-compatible image-only field. */
export function ImageField(props: { value: string; onChange: (url: string) => void; folder?: string }) {
  return <MediaField {...props} accept="image" />;
}

import { useRef, useState } from "react";
import { Upload, Image as ImageIcon, Link2, X, Loader2, Check } from "lucide-react";
import { uploadImage } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

type Tab = "upload" | "library" | "url";

export function ImageField({
  value,
  onChange,
  folder = "general",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const [tab, setTab] = useState<Tab>("upload");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const library = useQuery({
    queryKey: ["media_library"],
    queryFn: async () => {
      const { data, error } = await supabase.from("media_assets").select("*").order("created_at", { ascending: false }).limit(60);
      if (error) throw error;
      return data ?? [];
    },
    enabled: tab === "library",
  });

  const handleFile = async (file: File) => {
    setBusy(true);
    try {
      const { url } = await uploadImage(file, folder);
      onChange(url);
      toast.success("Uploaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="h-32 w-auto rounded-lg border border-[#E5E7EB] object-cover" />
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
              {t === "library" && <ImageIcon className="size-3.5" />}
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
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              {busy ? (
                <div className="flex flex-col items-center gap-2 text-primary"><Loader2 className="size-5 animate-spin" /><span className="text-sm">Uploading…</span></div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-[#6B7280]">
                  <Upload className="size-5" />
                  <span className="text-sm font-medium">Drop image or click to upload</span>
                  <span className="text-[11px]">JPG, PNG, WEBP, GIF · Max 5MB</span>
                </div>
              )}
            </div>
          )}

          {tab === "library" && (
            <div className="max-h-64 overflow-y-auto">
              {library.isLoading ? (
                <div className="p-6 text-center text-sm text-[#6B7280]"><Loader2 className="inline size-4 animate-spin" /></div>
              ) : (library.data?.length ?? 0) === 0 ? (
                <div className="p-6 text-center text-sm text-[#6B7280]">No images yet. Upload one first.</div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {library.data!.map((a: any) => (
                    <button key={a.id} type="button" onClick={() => { onChange(a.url); toast.success("Selected"); }}
                      className={`relative aspect-square rounded-md overflow-hidden border ${value === a.url ? "border-primary ring-2 ring-primary/30" : "border-[#EEF0F3] hover:border-primary/40"}`}>
                      <img src={a.url} alt={a.alt_text || ""} className="w-full h-full object-cover" />
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

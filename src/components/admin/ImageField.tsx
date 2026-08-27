import { useRef, useState } from "react";
import { Upload, Image as ImageIcon, Link2, X, Loader2, Check, Film, Crop, ZoomIn } from "lucide-react";
import { uploadMedia, kindOf, type MediaKind } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import heroAsset from "@/assets/community/live/hero-community-water.svg";
import outreachAsset from "@/assets/community/live/outreach-children.jpeg";
import suppliesAsset from "@/assets/community/live/community-supplies.jpeg";
import teamAsset from "@/assets/community/live/community-team.jpeg";
import streetAsset from "@/assets/community/live/outreach-street-group.jpeg";
import childAsset from "@/assets/community/live/child-community.jpeg";
import treeAsset from "@/assets/community/live/team-under-tree.jpeg";

type Tab = "upload" | "library" | "url";

type LibraryAsset = {
  id: string;
  url: string;
  kind: MediaKind;
  alt_text?: string | null;
};

const bundledLibraryAssets: LibraryAsset[] = [
  {
    id: "bundled-hero",
    url: heroAsset,
    kind: "image",
    alt_text: "Elle's Foundation community outreach",
  },
  {
    id: "bundled-outreach",
    url: outreachAsset,
    kind: "image",
    alt_text: "Children and volunteers at an outreach",
  },
  {
    id: "bundled-supplies",
    url: suppliesAsset,
    kind: "image",
    alt_text: "Community supplies prepared for distribution",
  },
  {
    id: "bundled-team",
    url: teamAsset,
    kind: "image",
    alt_text: "Elle's Foundation volunteers serving a community",
  },
  {
    id: "bundled-street",
    url: streetAsset,
    kind: "image",
    alt_text: "Community outreach team on the street",
  },
  {
    id: "bundled-child",
    url: childAsset,
    kind: "image",
    alt_text: "Child supported by Elle's Foundation",
  },
  { id: "bundled-tree", url: treeAsset, kind: "image", alt_text: "Team gathered under a tree" },
];

export function MediaField({
  value,
  onChange,
  folder = "general",
  accept = "image",
  enableCrop = false,
  originalValue,
  onReset,
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  /** "image" | "video" | "any" */
  accept?: "image" | "video" | "any";
  enableCrop?: boolean;
  originalValue?: string;
  onReset?: () => void;
}) {
  const [tab, setTab] = useState<Tab>("upload");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const acceptAttr =
    accept === "video" ? "video/*" : accept === "any" ? "image/*,video/*" : "image/*";

  const library = useQuery({
    queryKey: ["media_library", accept],
    queryFn: async () => {
      let q = supabase
        .from("media_assets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(60);
      if (accept === "image") q = q.eq("kind", "image");
      if (accept === "video") q = q.eq("kind", "video");
      const { data, error } = await q;
      if (error) {
        // Bundled public-site assets remain selectable even before the storage table
        // is migrated or when no uploaded assets exist yet.
        if (error.code === "PGRST205" || error.code === "42P01") return bundledLibraryAssets;
        throw error;
      }
      const remoteAssets = (data ?? []) as LibraryAsset[];
      return [...bundledLibraryAssets, ...remoteAssets];
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
        <div className="space-y-3">
        <div className="relative inline-block">
          {valueKind === "video" ? (
            <video
              src={value}
              muted
              playsInline
              controls
              className="h-32 w-auto rounded-lg border border-[#E5E7EB] bg-black"
            />
          ) : (
            <img
              src={value}
              alt=""
              className="h-32 w-auto rounded-lg border border-[#E5E7EB] object-cover"
            />
          )}
          <button
            type="button"
            onClick={(event) => { event.preventDefault(); event.stopPropagation(); onChange(""); }}
            className="absolute -top-2 -right-2 size-6 rounded-full bg-white border border-[#E5E7EB] shadow grid place-items-center text-[#6B7280] hover:text-red-600"
          >
            <X className="size-3" />
          </button>
        </div>
        {enableCrop && valueKind === "image" ? <ImageCropPanel value={value} originalValue={originalValue} folder={folder} onChange={onChange} onReset={onReset} /> : null}
        </div>
      ) : null}

      <div className="rounded-lg border border-[#E5E7EB] bg-white">
        <div className="flex border-b border-[#EEF0F3] text-xs font-medium">
          {(["upload", "library", "url"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 px-3 py-2 capitalize inline-flex items-center justify-center gap-1.5 ${tab === t ? "text-primary border-b-2 border-primary -mb-px" : "text-[#6B7280] hover:text-primary"}`}
            >
              {t === "upload" && <Upload className="size-3.5" />}
              {t === "library" &&
                (accept === "video" ? (
                  <Film className="size-3.5" />
                ) : (
                  <ImageIcon className="size-3.5" />
                ))}
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
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept={acceptAttr}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              {busy ? (
                <div className="flex flex-col items-center gap-2 text-primary">
                  <Loader2 className="size-5 animate-spin" />
                  <span className="text-sm">Uploading…</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-[#6B7280]">
                  <Upload className="size-5" />
                  <span className="text-sm font-medium">
                    Drop {accept === "video" ? "video" : accept === "any" ? "file" : "image"} or
                    click to upload
                  </span>
                  <span className="text-[11px]">
                    {accept === "video"
                      ? "MP4, WEBM, MOV · Max 100MB"
                      : accept === "any"
                        ? "Images max 5MB · Videos max 100MB"
                        : "JPG, PNG, WEBP, GIF · Max 5MB"}
                  </span>
                </div>
              )}
            </div>
          )}

          {tab === "library" && (
            <div className="max-h-64 overflow-y-auto">
              {library.isLoading ? (
                <div className="p-6 text-center text-sm text-[#6B7280]">
                  <Loader2 className="inline size-4 animate-spin" />
                </div>
              ) : (library.data?.length ?? 0) === 0 ? (
                <div className="p-6 text-center text-sm text-[#6B7280]">
                  Nothing here yet. Upload one first.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {library.data!.map((a: any) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        onChange(a.url);
                        toast.success("Selected");
                      }}
                      className={`relative aspect-square rounded-md overflow-hidden border ${value === a.url ? "border-primary ring-2 ring-primary/30" : "border-[#EEF0F3] hover:border-primary/40"}`}
                    >
                      {(a.kind ?? "image") === "video" ? (
                        <video
                          src={a.url}
                          muted
                          playsInline
                          className="w-full h-full object-cover bg-black"
                        />
                      ) : (
                        <img
                          src={a.url}
                          alt={a.alt_text || ""}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {(a.kind ?? "image") === "video" && (
                        <span className="absolute top-1 left-1 rounded bg-black/60 text-white p-0.5">
                          <Film className="size-3" />
                        </span>
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
export function ImageField(props: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  return <MediaField {...props} accept="image" />;
}


function ImageCropPanel({ value, originalValue, folder, onChange, onReset }: { value: string; originalValue?: string; folder: string; onChange: (url: string) => void; onReset?: () => void }) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);
  const [busy, setBusy] = useState(false);
  const aspect = 1.28;

  const applyCrop = async () => {
    setBusy(true);
    try {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = value;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("The image could not be loaded for cropping."));
      });
      const baseWidth = Math.min(image.naturalWidth, image.naturalHeight * aspect);
      const baseHeight = baseWidth / aspect;
      const cropWidth = baseWidth / zoom;
      const cropHeight = baseHeight / zoom;
      const sx = (image.naturalWidth - cropWidth) * (positionX / 100);
      const sy = (image.naturalHeight - cropHeight) * (positionY / 100);
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = Math.round(canvas.width / aspect);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not prepare the crop.");
      context.drawImage(image, sx, sy, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (!blob) throw new Error("The cropped image could not be created.");
      const file = new File([blob], `team-crop-${Date.now()}.jpg`, { type: "image/jpeg" });
      const uploaded = await uploadMedia(file, folder);
      onChange(uploaded.url);
      setOpen(false);
      toast.success("Cropped team image ready to publish");
    } catch (error: any) {
      toast.error(error?.message ?? "Could not crop this image. Check that the image URL allows browser access.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-md border border-[#E5E7EB] bg-[#F8FAF7] p-3" onClick={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()}>
      <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setOpen((current) => !current); }} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary hover:text-earth">
        <Crop className="size-4" /> {open ? "Close crop tool" : "Crop for team card"}
      </button>
      {open ? (
        <div className="mt-3 space-y-3">
          <div className="relative mx-auto aspect-[1.28/1] w-full max-w-sm overflow-hidden border border-primary/25 bg-forest">
            <img src={value} alt="Crop preview" className="absolute h-full w-full object-cover" style={{ objectPosition: `${positionX}% ${positionY}%`, transform: `scale(${zoom})` }} />
            <div className="pointer-events-none absolute inset-0 border-2 border-white/80 shadow-[inset_0_0_0_999px_rgb(8_75_53/0.08)]" />
            <span className="absolute left-2 top-2 bg-forest/75 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">Team card frame</span>
          </div>
          <label className="flex items-center gap-3 text-xs font-semibold text-[#4B5563]">
            <ZoomIn className="size-4 text-primary" /> Zoom
            <input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => { event.stopPropagation(); setZoom(Number(event.target.value)); }} className="min-w-0 flex-1 accent-[var(--primary)]" />
            <span className="w-10 text-right tabular-nums">{zoom.toFixed(1)}×</span>
          </label>
          <label className="block text-xs font-semibold text-[#4B5563]">Horizontal focus
            <input type="range" min="0" max="100" value={positionX} onChange={(event) => { event.stopPropagation(); setPositionX(Number(event.target.value)); }} className="mt-1 w-full accent-[var(--primary)]" />
          </label>
          <label className="block text-xs font-semibold text-[#4B5563]">Vertical focus
            <input type="range" min="0" max="100" value={positionY} onChange={(event) => { event.stopPropagation(); setPositionY(Number(event.target.value)); }} className="mt-1 w-full accent-[var(--primary)]" />
          </label>
          <div className="flex items-center justify-between gap-3 border-t border-[#E5E7EB] pt-3">
            <p className="text-[11px] leading-5 text-[#6B7280]">Keep the eyes and face inside the frame. The saved crop matches the public card ratio.</p>
            <div className="flex shrink-0 gap-2">
              {onReset && originalValue && originalValue !== value ? <button type="button" disabled={busy} onClick={(event) => { event.preventDefault(); event.stopPropagation(); onReset(); }} className="border border-[#D8E0DA] px-3 py-2 text-xs font-bold text-[#4B5563] hover:border-primary hover:text-primary">Reset original</button> : null}
              <button type="button" disabled={busy} onClick={(event) => { event.preventDefault(); event.stopPropagation(); void applyCrop(); }} className="bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-60">{busy ? "Saving…" : "Apply crop"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

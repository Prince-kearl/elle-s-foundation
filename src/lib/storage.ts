import { supabase } from "./supabase";
import { r2PresignUpload } from "./r2.functions";

const BUCKET = "media";
const MAX_IMAGE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO = 100 * 1024 * 1024; // 100MB

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"];

export type MediaKind = "image" | "video";

export function kindOf(file: File | string): MediaKind {
  const t = typeof file === "string" ? file : file.type;
  if (t.startsWith("video/") || /\.(mp4|webm|mov|ogv)(\?|$)/i.test(t)) return "video";
  return "image";
}

/** Reads the non-secret storage provider preference from app_config. */
export async function getStorageProvider(): Promise<"r2" | "supabase"> {
  const { data } = await supabase.from("app_config").select("value").eq("key", "storage").maybeSingle();
  return (data as any)?.value?.provider === "r2" ? "r2" : "supabase";
}

async function uploadToR2(file: File, path: string) {
  const { uploadUrl, publicUrl } = await r2PresignUpload({ data: { key: path, contentType: file.type } });
  const res = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
  if (!res.ok) throw new Error(`R2 upload failed (${res.status}). Check your credentials and bucket CORS rules.`);
  return publicUrl;
}

export async function uploadMedia(file: File, folder = "general"): Promise<{ url: string; path: string; kind: MediaKind }> {
  const kind = kindOf(file);
  const allowed = kind === "video" ? VIDEO_TYPES : IMAGE_TYPES;
  if (!allowed.includes(file.type)) {
    throw new Error(
      kind === "video"
        ? "Only MP4, WEBM, MOV or OGG videos are allowed."
        : "Only JPG, PNG, WEBP, GIF, or SVG images are allowed.",
    );
  }
  const max = kind === "video" ? MAX_VIDEO : MAX_IMAGE;
  if (file.size > max) throw new Error(`${kind === "video" ? "Video" : "Image"} must be under ${max / 1024 / 1024}MB.`);

  const ext = file.name.split(".").pop()?.toLowerCase() || (kind === "video" ? "mp4" : "jpg");
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const provider = await getStorageProvider();
  let url: string;

  if (provider === "r2") {
    url = await uploadToR2(file, path);
  } else {
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type,
    });
    if (error) throw error;
    url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  const { data: user } = await supabase.auth.getUser();
  await supabase.from("media_assets").insert({
    url,
    path,
    kind,
    filename: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    folder,
    uploaded_by: user.user?.id ?? null,
  });

  return { url, path, kind };
}

/** Backwards-compatible alias. */
export const uploadImage = uploadMedia;

export async function deleteAsset(id: string, path: string) {
  const provider = await getStorageProvider().catch(() => "supabase" as const);
  if (provider === "supabase") await supabase.storage.from(BUCKET).remove([path]);
  await supabase.from("media_assets").delete().eq("id", id);
}

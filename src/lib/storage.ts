import { supabase } from "./supabase";

const BUCKET = "media";
const MAX_IMAGE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO = 100 * 1024 * 1024; // 100MB

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"];
const FONT_TYPES = ["font/woff2", "font/woff", "font/ttf", "font/otf", "application/font-woff", "application/x-font-ttf", "application/vnd.ms-opentype"];
const MAX_FONT = 5 * 1024 * 1024;

export type MediaKind = "image" | "video";

export function kindOf(file: File | string): MediaKind {
  const t = typeof file === "string" ? file : file.type;
  if (t.startsWith("video/") || /\.(mp4|webm|mov|ogv)(\?|$)/i.test(t)) return "video";
  return "image";
}

/** Public URL for a stored object path. */
export function publicUrl(path: string) {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function uploadMedia(
  file: File,
  folder = "general",
): Promise<{ url: string; path: string; kind: MediaKind }> {
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
  if (file.size > max)
    throw new Error(
      `${kind === "video" ? "Video" : "Image"} must be under ${max / 1024 / 1024}MB.`,
    );

  const ext = file.name.split(".").pop()?.toLowerCase() || (kind === "video" ? "mp4" : "jpg");
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (error) {
    if (/bucket not found|does not exist/i.test(error.message ?? "")) {
      throw new Error(
        'Supabase Storage bucket "media" is missing. Run supabase/migrations/20260826_media_storage_bucket.sql in the Supabase SQL Editor, then try again.',
      );
    }
    throw error;
  }
  const url = publicUrl(path);

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

/** Upload a validated custom webfont to the public media bucket. */
export async function uploadFont(file: File, folder = "fonts"): Promise<{ url: string; path: string }> {
  if (!FONT_TYPES.includes(file.type) && !/\.(woff2?|ttf|otf)$/i.test(file.name)) {
    throw new Error("Only WOFF2, WOFF, TTF, or OTF font files are allowed.");
  }
  if (file.size > MAX_FONT) throw new Error("Font files must be under 5MB.");
  const ext = file.name.split(".").pop()?.toLowerCase() || "woff2";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const contentType = file.type || (ext === "woff2" ? "font/woff2" : ext === "woff" ? "font/woff" : "font/ttf");
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType,
  });
  if (error) {
    if (/bucket not found|does not exist/i.test(error.message ?? "")) {
      throw new Error('Supabase Storage bucket "media" is missing. Run the media storage migration in the Supabase SQL Editor.');
    }
    throw error;
  }
  return { url: publicUrl(path), path };
}

/** Backwards-compatible alias. */
export const uploadImage = uploadMedia;

export async function deleteAsset(id: string, path: string) {
  await supabase.storage.from(BUCKET).remove([path]);
  await supabase.from("media_assets").delete().eq("id", id);
}

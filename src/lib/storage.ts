import { supabase } from "./supabase";

const BUCKET = "media";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export async function uploadImage(file: File, folder = "general"): Promise<{ url: string; path: string }> {
  if (!ALLOWED.includes(file.type)) throw new Error("Only JPG, PNG, WEBP, GIF, or SVG images are allowed.");
  if (file.size > MAX_SIZE) throw new Error(`Image must be under ${MAX_SIZE / 1024 / 1024}MB.`);

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const url = data.publicUrl;

  // Register in library (best-effort)
  const { data: user } = await supabase.auth.getUser();
  await supabase.from("media_assets").insert({
    url,
    path,
    filename: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    folder,
    uploaded_by: user.user?.id ?? null,
  });

  return { url, path };
}

export async function deleteAsset(id: string, path: string) {
  await supabase.storage.from(BUCKET).remove([path]);
  await supabase.from("media_assets").delete().eq("id", id);
}

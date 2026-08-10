import { kindOf } from "@/lib/storage";

/**
 * Renders an uploaded media URL as a video (autoplaying, muted loop) or an image.
 * `video` wins over `src` when provided — lets admins swap any image for a clip.
 */
export function Media({
  src,
  video,
  alt = "",
  className = "",
  loading = "lazy",
  poster,
}: {
  src?: string;
  video?: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
  poster?: string;
}) {
  const url = video || src || "";
  if (!url) return null;
  if (video || kindOf(url) === "video") {
    return (
      <video
        src={url}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={alt}
        className={className}
      />
    );
  }
  return <img src={url} alt={alt} loading={loading} className={className} />;
}

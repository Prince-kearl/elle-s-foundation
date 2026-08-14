export type MediaProbe = {
  url: string;
  ok: boolean;
  status: number | null;
  contentType: string | null;
  sizeBytes: number | null;
  ms: number;
  error: string | null;
};

/** Probes one public media URL. HEAD first, falls back to a tiny ranged GET. */
export async function probeMediaUrl(url: string): Promise<MediaProbe> {
  const started = Date.now();
  const base: MediaProbe = { url, ok: false, status: null, contentType: null, sizeBytes: null, ms: 0, error: null };

  try {
    let res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (res.status === 405 || res.status === 501 || res.status === 403) {
      res = await fetch(url, { method: "GET", headers: { Range: "bytes=0-0" }, redirect: "follow" });
    }
    const len = res.headers.get("content-range")?.split("/")?.[1] ?? res.headers.get("content-length");
    return {
      ...base,
      ok: res.ok || res.status === 206,
      status: res.status,
      contentType: res.headers.get("content-type"),
      sizeBytes: len ? Number(len) : null,
      ms: Date.now() - started,
    };
  } catch (e) {
    return { ...base, ms: Date.now() - started, error: e instanceof Error ? e.message : "Request failed" };
  }
}

export async function probeMediaUrls(urls: string[]): Promise<MediaProbe[]> {
  const out: MediaProbe[] = [];
  const batch = 6;
  for (let i = 0; i < urls.length; i += batch) {
    out.push(...(await Promise.all(urls.slice(i, i + batch).map(probeMediaUrl))));
  }
  return out;
}

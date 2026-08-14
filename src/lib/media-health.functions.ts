import { createServerFn } from "@tanstack/react-start";
import { probeMediaUrls } from "./media-health.server";

export const checkMediaUrls = createServerFn({ method: "POST" })
  .inputValidator((input: { urls: string[] }) => {
    const urls = (input?.urls ?? [])
      .filter((u) => typeof u === "string" && /^https?:\/\//i.test(u))
      .slice(0, 120);
    if (!urls.length) throw new Error("No public media URLs to verify.");
    return { urls };
  })
  .handler(async ({ data }) => {
    const results = await probeMediaUrls(data.urls);
    return {
      results,
      total: results.length,
      failed: results.filter((r) => !r.ok).length,
    };
  });

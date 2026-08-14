import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, RefreshCw, HardDrive, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout, AdminCard, PrimaryButton, GhostButton } from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { r2Status } from "@/lib/r2.functions";
import { checkMediaUrls } from "@/lib/media-health.functions";

export const Route = createFileRoute("/admin/storage")({
  head: () => ({
    meta: [
      { title: "Storage & Media Health — Elle's Foundation Admin" },
      { name: "description", content: "Configure Cloudflare R2 storage and verify that every uploaded image and video loads correctly." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StorageAdmin,
});

const SECRET_KEYS = ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_BASE_URL"];

function StorageAdmin() {
  const qc = useQueryClient();
  const status = useServerFn(r2Status);
  const probe = useServerFn(checkMediaUrls);
  const [results, setResults] = useState<any[] | null>(null);

  const { data: r2, isLoading: loadingR2, refetch } = useQuery({
    queryKey: ["r2_status"],
    queryFn: () => status({}),
    retry: false,
  });

  const { data: provider = "supabase" } = useQuery({
    queryKey: ["app_config", "storage"],
    queryFn: async () => {
      const { data } = await supabase.from("app_config").select("value").eq("key", "storage").maybeSingle();
      return ((data as any)?.value?.provider as string) ?? "supabase";
    },
    retry: false,
  });

  const { data: assets = [] } = useQuery({
    queryKey: ["a", "media_assets", "health"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_assets")
        .select("id,url,kind,filename,created_at")
        .order("created_at", { ascending: false })
        .limit(120);
      if (error) throw error;
      return data ?? [];
    },
    retry: false,
  });

  const setProvider = useMutation({
    mutationFn: async (value: "r2" | "supabase") => {
      const { error } = await supabase
        .from("app_config")
        .upsert({ key: "storage", value: { provider: value } }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["app_config", "storage"] });
      toast.success("Storage provider updated");
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not save"),
  });

  const runTest = useMutation({
    mutationFn: async () => probe({ data: { urls: assets.map((a: any) => a.url).filter(Boolean) } }),
    onSuccess: (res: any) => {
      setResults(res.results);
      if (res.failed === 0) toast.success(`All ${res.total} media files load correctly.`);
      else toast.error(`${res.failed} of ${res.total} media files failed to load.`);
    },
    onError: (e: any) => toast.error(e?.message ?? "Health test failed"),
  });

  const failed = results?.filter((r) => !r.ok) ?? [];

  return (
    <AdminLayout
      title="Storage & Media Health"
      subtitle="Connect Cloudflare R2 and verify that every uploaded image and video is reachable in production."
      action={
        <GhostButton onClick={() => refetch()}>
          <RefreshCw className="size-4" /> Recheck config
        </GhostButton>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="size-5 text-primary" />
            <h2 className="font-display text-xl">Cloudflare R2 configuration</h2>
          </div>

          {loadingR2 ? (
            <p className="text-sm text-[#6B7280] flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Checking server credentials…</p>
          ) : (
            <ul className="space-y-2">
              {SECRET_KEYS.map((k) => {
                const missing = (r2 as any)?.missing?.includes(k);
                return (
                  <li key={k} className="flex items-center justify-between rounded-lg border border-[#EEF0F3] px-3 py-2 text-sm">
                    <span className="font-mono text-xs">{k}</span>
                    {missing ? (
                      <span className="inline-flex items-center gap-1 text-red-600 text-xs font-semibold"><XCircle className="size-4" /> Missing</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-700 text-xs font-semibold"><CheckCircle2 className="size-4" /> Set</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {r2 && (
            <div className="mt-4 rounded-lg bg-[#F9FAFB] border border-[#EEF0F3] p-3 text-xs text-[#4B5563] space-y-1">
              <div>Bucket: <strong>{(r2 as any).bucket || "—"}</strong></div>
              <div>Public base: <strong className="break-all">{(r2 as any).publicBase || "—"}</strong></div>
              <div>Account: <strong>{(r2 as any).accountIdMasked || "—"}</strong></div>
              <div>
                CDN reachable:{" "}
                <strong>
                  {(r2 as any).reachable === null ? "not tested" : (r2 as any).reachable ? "yes" : "no"}
                </strong>{" "}
                {(r2 as any).message}
              </div>
            </div>
          )}

          <div className="mt-5">
            <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Active upload target</span>
            <div className="mt-2 flex gap-2">
              {(["r2", "supabase"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider.mutate(p)}
                  disabled={p === "r2" && !(r2 as any)?.configured}
                  className={`rounded-lg px-4 py-2 text-sm font-medium border transition disabled:opacity-50 ${
                    provider === p ? "bg-primary text-white border-primary" : "bg-white border-[#E5E7EB] text-[#4B5563]"
                  }`}
                >
                  {p === "r2" ? "Cloudflare R2" : "Supabase Storage"}
                </button>
              ))}
            </div>
            {!(r2 as any)?.configured && (
              <p className="mt-2 text-xs text-[#6B7280]">Add the R2 secrets above before switching uploads to Cloudflare.</p>
            )}
          </div>
        </AdminCard>

        <AdminCard className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="font-display text-xl">Media health test</h2>
          </div>
          <p className="text-sm text-[#6B7280]">
            Fetches every uploaded image and video from the public URL the website uses and reports anything that
            fails — broken CDN domain, wrong bucket, private object, or missing file.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <PrimaryButton onClick={() => runTest.mutate()} disabled={runTest.isPending || assets.length === 0}>
              {runTest.isPending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
              Test {assets.length} file{assets.length === 1 ? "" : "s"}
            </PrimaryButton>
            {results && (
              <span className={`text-sm font-semibold ${failed.length ? "text-red-600" : "text-green-700"}`}>
                {failed.length ? `${failed.length} failing` : "All files OK"}
              </span>
            )}
          </div>

          {results && (
            <div className="mt-5 max-h-[420px] overflow-auto rounded-lg border border-[#EEF0F3]">
              <table className="w-full text-xs">
                <thead className="bg-[#F9FAFB] text-[#6B7280]">
                  <tr>
                    <th className="text-left px-3 py-2">File</th>
                    <th className="text-left px-3 py-2">Type</th>
                    <th className="text-left px-3 py-2">Status</th>
                    <th className="text-left px-3 py-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r: any) => {
                    const asset = assets.find((a: any) => a.url === r.url);
                    return (
                      <tr key={r.url} className="border-t border-[#EEF0F3]">
                        <td className="px-3 py-2 max-w-[220px] truncate" title={r.url}>{asset?.filename ?? r.url}</td>
                        <td className="px-3 py-2">{r.contentType ?? asset?.kind ?? "—"}</td>
                        <td className={`px-3 py-2 font-semibold ${r.ok ? "text-green-700" : "text-red-600"}`}>
                          {r.ok ? `OK ${r.status}` : r.error ?? `HTTP ${r.status}`}
                        </td>
                        <td className="px-3 py-2">{r.ms}ms</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {assets.length === 0 && (
            <p className="mt-4 text-sm text-[#6B7280]">No media assets found yet — upload files in the Media Library first.</p>
          )}
        </AdminCard>
      </div>
    </AdminLayout>
  );
}

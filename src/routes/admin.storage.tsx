import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, HardDrive, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AdminLayout, AdminCard, PrimaryButton } from "@/components/admin/AdminLayout";
import { supabase } from "@/lib/supabase";
import { checkMediaUrls } from "@/lib/media-health.functions";

export const Route = createFileRoute("/admin/storage")({
  head: () => ({
    meta: [
      { title: "Storage & Media Health — Elle's Foundation Admin" },
      { name: "description", content: "Verify that every uploaded image and video stored in the database loads correctly." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StorageAdmin,
});

function StorageAdmin() {
  const probe = useServerFn(checkMediaUrls);
  const [results, setResults] = useState<any[] | null>(null);

  const { data: assets = [] } = useQuery({
    queryKey: ["a", "media_assets", "health"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("media_assets")
        .select("id,url,kind,filename,size_bytes,created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
    retry: false,
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
  const totalBytes = assets.reduce((s: number, a: any) => s + (a.size_bytes ?? 0), 0);

  return (
    <AdminLayout
      title="Storage & Media Health"
      subtitle="All images and videos are stored in your project database storage and served from its public media bucket."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="size-5 text-primary" />
            <h2 className="font-display text-xl">Storage overview</h2>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between rounded-lg border border-[#EEF0F3] px-3 py-2">
              <span>Provider</span><strong>Database storage (media bucket)</strong>
            </li>
            <li className="flex justify-between rounded-lg border border-[#EEF0F3] px-3 py-2">
              <span>Files stored</span><strong>{assets.length}</strong>
            </li>
            <li className="flex justify-between rounded-lg border border-[#EEF0F3] px-3 py-2">
              <span>Total size</span><strong>{(totalBytes / 1024 / 1024).toFixed(1)} MB</strong>
            </li>
          </ul>
          <p className="mt-4 text-xs text-[#6B7280]">
            The <span className="font-mono">media</span> bucket must be public so uploaded images and videos render on
            the live site after hosting. Run the health test to confirm.
          </p>
        </AdminCard>

        <AdminCard className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="size-5 text-primary" />
            <h2 className="font-display text-xl">Media health test</h2>
          </div>
          <p className="text-sm text-[#6B7280]">
            Fetches every uploaded image and video from the public URL the website uses and reports anything that
            fails — private object, missing file, or wrong bucket.
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

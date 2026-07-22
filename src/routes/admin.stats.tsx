import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CollectionEditor } from "@/components/admin/CollectionEditor";

export const Route = createFileRoute("/admin/stats")({
  head: () => ({ meta: [{ title: "Statistics — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminLayout title="Statistics" subtitle="Impact counters shown across the site.">
      <CollectionEditor
        table="stats"
        singularName="Statistic"
        invalidateKeys={[["p:stats"]]}
        fields={[
          { name: "value", label: "Value", type: "text" },
          { name: "label", label: "Label", type: "text" },
        ]}
        columns={[
          { key: "value", label: "Value", render: (r: any) => <span className="font-display text-lg text-primary">{r.value}</span> },
          { key: "label", label: "Label" },
        ]}
      />
    </AdminLayout>
  ),
});

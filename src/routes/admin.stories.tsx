import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CollectionEditor } from "@/components/admin/CollectionEditor";

export const Route = createFileRoute("/admin/stories")({
  head: () => ({ meta: [{ title: "Stories — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminLayout title="Featured Stories" subtitle="Real stories from the people you serve.">
      <CollectionEditor
        table="stories"
        singularName="Story"
        invalidateKeys={[["p:stories"]]}
        fields={[
          { name: "tag", label: "Tag (Education, Family, Youth…)", type: "text" },
          { name: "title", label: "Title", type: "text" },
          { name: "excerpt", label: "Excerpt", type: "textarea" },
          { name: "image_url", label: "Image URL", type: "url" },
        ]}
        columns={[
          { key: "title", label: "Title", render: (r: any) => <span className="font-semibold">{r.title}</span> },
          { key: "tag", label: "Tag", render: (r: any) => <span className="text-xs uppercase tracking-wider text-earth font-semibold">{r.tag}</span> },
          { key: "excerpt", label: "Excerpt" },
        ]}
      />
    </AdminLayout>
  ),
});

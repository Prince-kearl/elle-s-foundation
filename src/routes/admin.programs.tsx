import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CollectionEditor } from "@/components/admin/CollectionEditor";

export const Route = createFileRoute("/admin/programs")({
  head: () => ({ meta: [{ title: "Programs — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminLayout title="Programs" subtitle="Programs displayed on the homepage and programs page.">
      <CollectionEditor
        table="programs"
        singularName="Program"
        invalidateKeys={[["p:programs"]]}
        fields={[
          { name: "title", label: "Title", type: "text" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "icon", label: "Icon (GraduationCap, HeartPulse, Home, TreePine, Heart, Sparkles)", type: "text" },
          { name: "image_url", label: "Image", type: "image", folder: "programs" },
        ]}
        columns={[
          { key: "title", label: "Title", render: (r: any) => <span className="font-semibold">{r.title}</span> },
          { key: "description", label: "Description" },
          { key: "icon", label: "Icon" },
        ]}
      />
    </AdminLayout>
  ),
});

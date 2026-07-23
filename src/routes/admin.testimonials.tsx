import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CollectionEditor } from "@/components/admin/CollectionEditor";

export const Route = createFileRoute("/admin/testimonials")({
  head: () => ({ meta: [{ title: "Testimonials — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminLayout title="Testimonials" subtitle="Voices from the community you serve.">
      <CollectionEditor
        table="testimonials"
        singularName="Testimonial"
        invalidateKeys={[["p:testimonials"]]}
        fields={[
          { name: "quote", label: "Quote", type: "textarea" },
          { name: "name", label: "Name", type: "text" },
          { name: "role", label: "Role / Location", type: "text" },
          { name: "avatar_url", label: "Avatar", type: "image", folder: "testimonials" },
        ]}
        columns={[
          { key: "quote", label: "Quote" },
          { key: "name", label: "Author", render: (r: any) => <span className="font-semibold">{r.name}</span> },
          { key: "role", label: "Role" },
        ]}
      />
    </AdminLayout>
  ),
});

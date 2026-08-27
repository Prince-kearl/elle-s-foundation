import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CollectionEditor } from "@/components/admin/CollectionEditor";
import { richTextForDisplay } from "@/components/admin/RichTextEditor";

export const Route = createFileRoute("/admin/testimonials")({
  head: () => ({ meta: [{ title: "Testimonials — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminLayout title="Testimonials" subtitle="Voices from the community you serve.">
      <CollectionEditor
        table="testimonials"
        singularName="Testimonial"
        invalidateKeys={[["p:testimonials"]]}
        fields={[
          { name: "quote", label: "Quote", type: "richtext" },
          { name: "name", label: "Name", type: "text" },
          { name: "role", label: "Role / Location", type: "text" },
          { name: "avatar_url", label: "Avatar", type: "image", folder: "testimonials", crop: true, originalField: "avatar_original_url" },
        ]}
        columns={[
          { key: "quote", label: "Quote", render: (r: any) => <span className="line-clamp-2 text-[#374151]" dangerouslySetInnerHTML={{ __html: richTextForDisplay(r.quote) }} /> },
          { key: "name", label: "Author", render: (r: any) => <span className="font-semibold">{r.name}</span> },
          { key: "role", label: "Role" },
        ]}
      />
    </AdminLayout>
  ),
});

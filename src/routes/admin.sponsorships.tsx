import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CollectionEditor } from "@/components/admin/CollectionEditor";

export const Route = createFileRoute("/admin/sponsorships")({
  head: () => ({ meta: [{ title: "Sponsorships — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminLayout title="Sponsorship Tiers" subtitle="Recurring giving tiers displayed on the Sponsor page (Ghana Cedis).">
      <CollectionEditor
        table="sponsorships"
        singularName="Sponsorship"
        invalidateKeys={[["p:sponsorships"]]}
        fields={[
          { name: "title", label: "Title", type: "text" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "amount", label: "Amount (GH₵)", type: "number" },
          { name: "frequency", label: "Frequency (monthly / once / yearly)", type: "text" },
          { name: "icon", label: "Icon (HandHeart, GraduationCap, Utensils, Home, TreePine, Heart)", type: "text" },
          { name: "image_url", label: "Image", type: "image", folder: "sponsorships" },
        ]}
        columns={[
          { key: "title", label: "Title", render: (r: any) => <span className="font-semibold">{r.title}</span> },
          { key: "amount", label: "Amount", render: (r: any) => <span className="font-display text-primary">GH₵{Number(r.amount).toLocaleString()}</span> },
          { key: "frequency", label: "Frequency" },
        ]}
      />
    </AdminLayout>
  ),
});

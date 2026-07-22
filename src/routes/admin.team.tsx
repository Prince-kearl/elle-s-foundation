import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CollectionEditor } from "@/components/admin/CollectionEditor";

export const Route = createFileRoute("/admin/team")({
  head: () => ({ meta: [{ title: "Team — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminLayout title="Team Members" subtitle="Leadership and team profiles shown on the About page.">
      <CollectionEditor
        table="team_members"
        singularName="Member"
        invalidateKeys={[["p:team"]]}
        fields={[
          { name: "name", label: "Name", type: "text" },
          { name: "role", label: "Role", type: "text" },
          { name: "bio", label: "Bio", type: "textarea" },
          { name: "avatar_url", label: "Avatar URL", type: "url" },
        ]}
        columns={[
          { key: "name", label: "Name", render: (r: any) => <span className="font-semibold">{r.name}</span> },
          { key: "role", label: "Role" },
        ]}
      />
    </AdminLayout>
  ),
});

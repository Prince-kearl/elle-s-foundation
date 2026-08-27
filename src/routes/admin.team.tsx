import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CollectionEditor } from "@/components/admin/CollectionEditor";
import { AdminCard } from "@/components/admin/AdminLayout";
import { useAdminList, useTeamProfileAnalytics } from "@/lib/cms";
import type { TeamMember } from "@/lib/cms";

export const Route = createFileRoute("/admin/team")({
  head: () => ({ meta: [{ title: "Team — Admin" }, { name: "robots", content: "noindex" }] }),
  component: TeamAdmin,
});

function TeamAdmin() {
  const { data: members = [] } = useAdminList<TeamMember>("team_members");
  const { data: analytics = [] } = useTeamProfileAnalytics();
  const viewsByMember = new Map(analytics.map((item) => [item.team_member_id, item.views]));
  const totalViews = analytics.reduce((sum, item) => sum + item.views, 0);
  const topProfile = members
    .map((member) => ({ member, views: viewsByMember.get(member.id) ?? 0 }))
    .sort((a, b) => b.views - a.views)[0];

  return (
    <AdminLayout title="Team Members" subtitle="Leadership and team profiles shown on the About page.">
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminCard className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Profile opens</p>
          <p className="mt-3 font-display text-3xl text-primary">{totalViews}</p>
          <p className="mt-1 text-sm text-muted-foreground">All-time public profile clicks</p>
        </AdminCard>
        <AdminCard className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Profiles tracked</p>
          <p className="mt-3 font-display text-3xl text-primary">{analytics.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">Members receiving clicks</p>
        </AdminCard>
        <AdminCard className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Most viewed</p>
          <p className="mt-3 truncate font-display text-2xl text-primary">{topProfile?.member.name ?? "—"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{topProfile ? `${topProfile.views} profile opens` : "No profile opens yet"}</p>
        </AdminCard>
      </div>
      <CollectionEditor
        table="team_members"
        singularName="Member"
        invalidateKeys={[["p:team"]]}
        enableDragSort
        fields={[
          { name: "name", label: "Name", type: "text" },
          { name: "role", label: "Role", type: "text" },
          { name: "bio", label: "Bio", type: "textarea" },
          { name: "avatar_url", label: "Avatar", type: "image", folder: "team" },
          { name: "linkedin_url", label: "LinkedIn URL", type: "text" },
          { name: "instagram_url", label: "Instagram URL", type: "text" },
          { name: "website_url", label: "Website URL", type: "text" },
        ]}
        columns={[
          { key: "name", label: "Name", render: (r: any) => <span className="font-semibold">{r.name}</span> },
          { key: "role", label: "Role" },
        ]}
      />
    </AdminLayout>
  );
}

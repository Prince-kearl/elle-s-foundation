import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CollectionEditor } from "@/components/admin/CollectionEditor";
import { AdminCard } from "@/components/admin/AdminLayout";
import { useAdminList, useTeamProfileAnalytics } from "@/lib/cms";
import type { TeamMember } from "@/lib/cms";
import { richTextForDisplay } from "@/components/admin/RichTextEditor";

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
          { name: "bio", label: "Bio", type: "richtext" },
          { name: "avatar_url", label: "Avatar", type: "image", folder: "team", crop: true, originalField: "avatar_original_url" },
          { name: "linkedin_url", label: "LinkedIn URL", type: "url" },
          { name: "instagram_url", label: "Instagram URL", type: "url" },
          { name: "website_url", label: "Website URL", type: "url" },
        ]}
        preview={(row) => <TeamCardPreview row={row} />}
        columns={[
          { key: "name", label: "Name", render: (r: any) => <span className="font-semibold">{r.name}</span> },
          { key: "role", label: "Role" },
        ]}
      />
    </AdminLayout>
  );
}

function TeamCardPreview({ row }: { row: Record<string, any> }) {
  const name = String(row.name ?? "Team member");
  const initials = name.split(" ").filter(Boolean).map((part) => part[0]).join("").slice(0, 3).toUpperCase();
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,220px)_1fr] md:items-center">
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B7280]">Live card preview</p>
        <div className="overflow-hidden border border-border bg-background shadow-[0_16px_32px_-26px_var(--forest)]">
          <div className="relative aspect-[1.28/1] overflow-hidden bg-forest">
            {row.avatar_url ? <img src={row.avatar_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center font-display text-4xl text-cream">{initials}</div>}
            <div className="absolute inset-0 bg-gradient-to-t from-forest/75 via-transparent to-primary/15" />
            <span className="absolute right-3 top-3 grid size-7 place-items-center border border-cream/55 bg-forest/25 text-cream">↗</span>
          </div>
          <div className="relative px-3 pb-3 pt-8">
            <span className="absolute -top-6 left-3 grid size-12 place-items-center border-4 border-background bg-forest font-display text-sm text-cream">{initials}</span>
            <p className="truncate font-display text-base text-primary">{name}</p>
            <p className="mt-1 truncate text-[9px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">{row.role || "Role"}</p>
            {row.bio ? <div className="rich-text rich-text--compact mt-3 line-clamp-2 text-[10px] leading-4 text-muted-foreground" dangerouslySetInnerHTML={{ __html: richTextForDisplay(row.bio) }} /> : null}
            <div className="mt-3 flex justify-end border-t border-border pt-2"><span className="bg-primary px-2 py-1 text-[9px] font-semibold text-primary-foreground">View bio ↗</span></div>
          </div>
        </div>
      </div>
      <div className="border-l-2 border-secondary pl-4 text-sm leading-6 text-[#4B5563]">
        <p className="font-semibold text-primary">Preview before publishing</p>
        <p className="mt-1">Adjust the crop until the face is visible in this same {"1.28:1"} image frame, then click Save changes. The crop tool creates a new optimized image and updates the card preview immediately.</p>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import {
  AdminCard,
  AdminLayout,
  GhostButton,
  PrimaryButton,
  TextInput,
} from "@/components/admin/AdminLayout";
import { MediaField } from "@/components/admin/ImageField";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Search,
  Send,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import heroAsset from "@/assets/community/live/hero-community-water.svg";
import outreachAsset from "@/assets/community/live/outreach-children.jpeg";
import suppliesAsset from "@/assets/community/live/community-supplies.jpeg";
import teamAsset from "@/assets/community/live/community-team.jpeg";
import streetAsset from "@/assets/community/live/outreach-street-group.jpeg";
import childAsset from "@/assets/community/live/child-community.jpeg";
import treeAsset from "@/assets/community/live/team-under-tree.jpeg";
import operationFeedTheStreet from "@/assets/community/operation-feed-the-street-2025.jpeg";

export const Route = createFileRoute("/admin/media")({
  head: () => ({
    meta: [{ title: "Media Library — Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: MediaAdmin,
});

type MediaSlot = {
  id: string;
  page: string;
  section: string;
  key: string;
  label: string;
  description: string;
  aspect: string;
  defaultUrl: string;
  alt: string;
  category: string;
};

type ContentRow = {
  id?: string;
  page: string;
  section: string;
  key: string;
  label?: string | null;
  content_type?: string | null;
  value?: string | null;
  draft_value?: string | null;
  position?: number | null;
  status?: string | null;
};

const SLOT_DEFINITIONS: MediaSlot[] = [
  {
    id: "home-hero",
    page: "home",
    section: "hero",
    key: "image",
    label: "Home: Hero Main Banner",
    description: "The primary bold hero image displayed at the top of the homepage.",
    aspect: "16:9",
    defaultUrl: heroAsset,
    alt: "Elle's Foundation volunteers and children celebrating a community outreach moment",
    category: "Home Page",
  },
  {
    id: "home-about",
    page: "home",
    section: "about",
    key: "image",
    label: "Home: About Image",
    description: "The image used beside the homepage About section.",
    aspect: "4:3",
    defaultUrl: outreachAsset,
    alt: "Children and volunteers at an Elle's Foundation outreach",
    category: "Home Page",
  },
  {
    id: "home-past-event",
    page: "home",
    section: "past_event",
    key: "image",
    label: "Home: Past Event Feature",
    description: "The image displayed in the Operation Feed the Street archive card.",
    aspect: "16:10",
    defaultUrl: operationFeedTheStreet,
    alt: "Elle's Foundation volunteers and children celebrating a community outreach moment",
    category: "Home Page",
  },
  {
    id: "home-volunteer",
    page: "home",
    section: "volunteer",
    key: "image",
    label: "Home: Volunteer Feature",
    description: "The image used in the volunteer impact feature near the bottom of the homepage.",
    aspect: "4:3",
    defaultUrl: teamAsset,
    alt: "Elle's Foundation volunteers serving a community meal",
    category: "Home Page",
  },
  {
    id: "home-story-1",
    page: "home",
    section: "stories",
    key: "image_1",
    label: "Home: Story 1",
    description: "The first image in the Stories from the field section.",
    aspect: "4:3",
    defaultUrl: streetAsset,
    alt: "Amina found her voice through school",
    category: "Media & Platform Stories",
  },
  {
    id: "home-story-2",
    page: "home",
    section: "stories",
    key: "image_2",
    label: "Home: Story 2",
    description: "The second image in the Stories from the field section.",
    aspect: "4:3",
    defaultUrl: childAsset,
    alt: "A home rebuilt, a mother renewed",
    category: "Media & Platform Stories",
  },
  {
    id: "home-story-3",
    page: "home",
    section: "stories",
    key: "image_3",
    label: "Home: Story 3",
    description: "The third image in the Stories from the field section.",
    aspect: "4:3",
    defaultUrl: treeAsset,
    alt: "Two brothers, one graduation day",
    category: "Media & Platform Stories",
  },
  {
    id: "about-hero",
    page: "about",
    section: "hero",
    key: "image",
    label: "About: Story Image",
    description: "The main image on the About page story section.",
    aspect: "4:3",
    defaultUrl: outreachAsset,
    alt: "Children and volunteers at an Elle's Foundation outreach",
    category: "About Page",
  },
  {
    id: "about-cta",
    page: "about",
    section: "cta",
    key: "image",
    label: "About: Decade Card Image",
    description:
      "Optional image for the About page decade card. Leave blank for the solid-color card.",
    aspect: "16:10",
    defaultUrl: "",
    alt: "Community gathering",
    category: "About Page",
  },
  {
    id: "programs-header",
    page: "programs",
    section: "header",
    key: "image",
    label: "Programs: Header Image",
    description: "The lead image at the top of the Programs page.",
    aspect: "16:10",
    defaultUrl: suppliesAsset,
    alt: "Elle's Foundation programs and community supplies",
    category: "Programs & Pathways",
  },
];

const CATEGORIES = [
  "All",
  "Home Page",
  "About Page",
  "Programs & Pathways",
  "Media & Platform Stories",
];

type CmsMediaState = {
  rows: ContentRow[];
  missingTable: boolean;
};

type PublishRow = {
  id: string;
  page: string;
  section: string;
  key: string;
  label: string;
  content_type: "image" | "text";
  position: number;
  value: string;
  draft_value: string;
  status: "published";
  published_at: string;
  publish_at: null;
  updated_at: string;
};

function isMissingPageContentTable(error: unknown) {
  const typedError = error as { code?: string; message?: string } | null;
  const message = String(typedError?.message ?? error ?? "");
  return (
    typedError?.code === "PGRST205" ||
    typedError?.code === "42P01" ||
    /schema cache|relation .*page_content.*does not exist/i.test(message)
  );
}

function MediaAdmin() {
  const qc = useQueryClient();
  const uploadRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [alts, setAlts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const { data: cmsState = { rows: [], missingTable: false }, isLoading } = useQuery<CmsMediaState>(
    {
      queryKey: ["a", "page_content", "media-slots"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("page_content")
          .select("*")
          .in("page", [...new Set(SLOT_DEFINITIONS.map((slot) => slot.page))]);
        if (error) {
          if (isMissingPageContentTable(error)) {
            return { rows: [], missingTable: true };
          }
          throw error;
        }
        return { rows: (data ?? []) as ContentRow[], missingTable: false };
      },
    },
  );
  const rows = cmsState.rows;
  const cmsTableMissing = cmsState.missingTable;

  useEffect(() => {
    const nextDrafts: Record<string, string> = {};
    const nextAlts: Record<string, string> = {};
    SLOT_DEFINITIONS.forEach((slot) => {
      const imageRow = rows.find(
        (row) => row.page === slot.page && row.section === slot.section && row.key === slot.key,
      );
      const altRow = rows.find(
        (row) =>
          row.page === slot.page && row.section === slot.section && row.key === `${slot.key}_alt`,
      );
      nextDrafts[slot.id] = imageRow?.draft_value || imageRow?.value || slot.defaultUrl;
      nextAlts[slot.id] = altRow?.draft_value || altRow?.value || slot.alt;
    });
    setDrafts(nextDrafts);
    setAlts(nextAlts);
  }, [rows]);

  const shownSlots = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return SLOT_DEFINITIONS.filter((slot) => {
      const matchesCategory = category === "All" || slot.category === category;
      const matchesQuery =
        !normalized ||
        `${slot.label} ${slot.description} ${slot.category}`.toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const saveSlot = async (slot: MediaSlot) => {
    if (cmsTableMissing) {
      toast.error(
        "The page_content table is not installed. Apply the CMS migration in Supabase first.",
      );
      return;
    }
    setSaving(slot.id);
    try {
      const imageRow = rows.find(
        (row) => row.page === slot.page && row.section === slot.section && row.key === slot.key,
      );
      const altRow = rows.find(
        (row) =>
          row.page === slot.page && row.section === slot.section && row.key === `${slot.key}_alt`,
      );
      const base = {
        page: slot.page,
        section: slot.section,
        content_type: "image",
        position: imageRow?.position ?? 0,
        status: "draft",
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("page_content").upsert(
        [
          {
            id: imageRow?.id ?? crypto.randomUUID(),
            ...base,
            key: slot.key,
            label: slot.label,
            value: imageRow?.value ?? drafts[slot.id] ?? slot.defaultUrl,
            draft_value: drafts[slot.id] ?? "",
          },
          {
            id: altRow?.id ?? crypto.randomUUID(),
            ...base,
            key: `${slot.key}_alt`,
            label: `${slot.label} alt text`,
            content_type: "text",
            position: (imageRow?.position ?? 0) + 1,
            value: altRow?.value ?? alts[slot.id] ?? slot.alt,
            draft_value: alts[slot.id] ?? slot.alt,
          },
        ],
        { onConflict: "page,section,key" },
      );
      if (error) throw error;
      await qc.refetchQueries({ queryKey: ["a", "page_content", "media-slots"] });
      await qc.invalidateQueries({ queryKey: ["page_content", slot.page] });
      toast.success(`${slot.label} saved as a draft`);
    } catch (error: any) {
      toast.error(error?.message ?? "Could not save image slot");
    } finally {
      setSaving(null);
    }
  };

  const publishChanges = async () => {
    if (cmsTableMissing) {
      toast.error(
        "The page_content table is not installed. Apply the CMS migration in Supabase first.",
      );
      return;
    }
    setPublishing(true);
    try {
      const { data: freshRows, error: refreshError } = await supabase
        .from("page_content")
        .select("*")
        .in("page", [...new Set(SLOT_DEFINITIONS.map((slot) => slot.page))]);
      if (refreshError) throw refreshError;
      const currentRows = (freshRows ?? []) as ContentRow[];
      const now = new Date().toISOString();
      const publishRows = shownSlots
        .flatMap<PublishRow | null>((slot) => {
          const imageRow = currentRows.find(
            (row) => row.page === slot.page && row.section === slot.section && row.key === slot.key,
          );
          const altRow = currentRows.find(
            (row) =>
              row.page === slot.page &&
              row.section === slot.section &&
              row.key === `${slot.key}_alt`,
          );
          return [
            imageRow?.id
              ? {
                  id: imageRow.id,
                  page: slot.page,
                  section: slot.section,
                  key: slot.key,
                  label: imageRow.label ?? slot.label,
                  content_type: "image",
                  position: imageRow.position ?? 0,
                  value: drafts[slot.id] ?? slot.defaultUrl,
                  draft_value: drafts[slot.id] ?? slot.defaultUrl,
                  status: "published",
                  published_at: now,
                  publish_at: null,
                  updated_at: now,
                }
              : null,
            altRow?.id
              ? {
                  id: altRow.id,
                  page: slot.page,
                  section: slot.section,
                  key: `${slot.key}_alt`,
                  label: altRow.label ?? `${slot.label} alt text`,
                  content_type: "text",
                  position: (imageRow?.position ?? 0) + 1,
                  value: alts[slot.id] ?? slot.alt,
                  draft_value: alts[slot.id] ?? slot.alt,
                  status: "published",
                  published_at: now,
                  publish_at: null,
                  updated_at: now,
                }
              : null,
          ];
        })
        .filter((row): row is PublishRow => row !== null);
      if (!publishRows.length) {
        throw new Error("Save at least one image slot before publishing changes.");
      }
      const { error } = await supabase
        .from("page_content")
        .upsert(publishRows, { onConflict: "id" });
      if (error) throw error;
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["page_content"] }),
        qc.invalidateQueries({ queryKey: ["a", "page_content", "media-slots"] }),
      ]);
      toast.success("Image changes published to the public site");
    } catch (error: any) {
      toast.error(error?.message ?? "Could not publish image changes");
    } finally {
      setPublishing(false);
    }
  };

  const uploadDirectly = async (file: File) => {
    const { uploadMedia } = await import("@/lib/storage");
    try {
      await uploadMedia(file, "media-library");
      await qc.invalidateQueries({ queryKey: ["media_library"] });
      toast.success("Uploaded to the media library. Select it from a slot to assign it.");
    } catch (error: any) {
      toast.error(error?.message ?? "Upload failed");
    }
  };

  return (
    <AdminLayout
      title="Site image customizer"
      subtitle="Edit, upload, and update pictures across every public page and component of the website."
      action={
        <div className="flex flex-wrap gap-2">
          <GhostButton onClick={() => uploadRef.current?.click()}>
            <Upload className="size-4" /> Upload photo
          </GhostButton>
          <PrimaryButton onClick={publishChanges} disabled={publishing || isLoading}>
            {publishing ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {publishing ? "Publishing…" : "Publish changes"}
          </PrimaryButton>
        </div>
      }
    >
      {cmsTableMissing && (
        <div className="mb-6 border border-earth/30 bg-cream p-4 text-sm text-ink">
          <p className="font-semibold text-primary">
            CMS setup required before image assignments can be saved.
          </p>
          <p className="mt-1 leading-6 text-muted-foreground">
            Supabase cannot find <code className="font-mono text-xs">public.page_content</code> in
            its schema cache. Apply
            <code className="mx-1 font-mono text-xs">ELLES_CMS_CONSOLIDATED.sql</code> in the
            Supabase SQL Editor, then reload this page.
          </p>
        </div>
      )}

      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadDirectly(file);
          event.currentTarget.value = "";
        }}
      />

      <div className="mb-6 flex flex-col gap-4 border-border bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`border px-3 py-2 text-xs font-semibold transition ${
                category === item
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-primary hover:border-primary"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="relative block w-full lg:max-w-xs">
          <span className="sr-only">Search image slots</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <TextInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search image slots..."
            className="pl-9"
          />
        </label>
      </div>

      {isLoading ? (
        <AdminCard className="p-12 text-center text-sm text-muted-foreground">
          <Loader2 className="mx-auto size-5 animate-spin" />
        </AdminCard>
      ) : shownSlots.length === 0 ? (
        <AdminCard className="p-12 text-center text-sm text-muted-foreground">
          No image slots match your search.
        </AdminCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {shownSlots.map((slot) => {
            const value = drafts[slot.id] ?? slot.defaultUrl;
            const isSaving = saving === slot.id;
            return (
              <AdminCard key={slot.id} className="overflow-hidden">
                <div className="relative aspect-[16/10] bg-muted">
                  {value ? (
                    <img
                      src={value}
                      alt={alts[slot.id] ?? slot.alt}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-muted-foreground">
                      <ImageIcon className="size-10" />
                    </div>
                  )}
                  <span className="absolute left-3 top-3 bg-primary px-2 py-1 text-[0.62rem] font-bold text-primary-foreground">
                    {slot.aspect}
                  </span>
                  <span className="absolute right-3 top-3 bg-forest/90 px-2 py-1 text-[0.62rem] font-bold text-primary-foreground">
                    <Check className="mr-1 inline size-3" /> {value ? "Assigned" : "Empty slot"}
                  </span>
                </div>
                <div className="space-y-4 p-5">
                  <div>
                    <div className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-earth">
                      {slot.category}
                    </div>
                    <h2 className="mt-2 font-display text-lg font-semibold leading-tight text-primary">
                      {slot.label}
                    </h2>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {slot.description}
                    </p>
                  </div>
                  <label className="block">
                    <span className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      Accessibility & SEO alt text
                    </span>
                    <TextInput
                      value={alts[slot.id] ?? slot.alt}
                      onChange={(event) =>
                        setAlts((current) => ({ ...current, [slot.id]: event.target.value }))
                      }
                      className="mt-2"
                    />
                  </label>
                  <MediaField
                    value={value}
                    onChange={(url) => setDrafts((current) => ({ ...current, [slot.id]: url }))}
                    folder={`pages/${slot.page}`}
                    accept="image"
                  />
                  <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!value) return;
                        void navigator.clipboard.writeText(value);
                        toast.success("Image URL copied");
                      }}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-earth"
                    >
                      <Copy className="size-3.5" /> Copy URL
                    </button>
                    {value && (
                      <a
                        href={value}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-earth"
                      >
                        <ExternalLink className="size-3.5" /> Open
                      </a>
                    )}
                    <PrimaryButton
                      onClick={() => void saveSlot(slot)}
                      disabled={isSaving}
                      className="!px-3 !py-2 !text-xs"
                    >
                      {isSaving ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Check className="size-3.5" />
                      )}
                      {isSaving ? "Saving" : "Save"}
                    </PrimaryButton>
                  </div>
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}

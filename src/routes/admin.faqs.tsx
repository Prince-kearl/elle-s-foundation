import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, AdminCard, Badge } from "@/components/admin/AdminLayout";
import { CollectionEditor } from "@/components/admin/CollectionEditor";
import { richTextForDisplay } from "@/components/admin/RichTextEditor";
import { useAdminList, useFaqAnalytics } from "@/lib/cms";
import type { Faq } from "@/lib/cms";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Eye, EyeOff, GripVertical, HelpCircle, Search, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin/faqs")({
  head: () => ({ meta: [{ title: "FAQs — Admin" }, { name: "robots", content: "noindex" }] }),
  component: FaqAdmin,
});

function FaqAdmin() {
  const queryClient = useQueryClient();
  const { data: faqs = [], isLoading } = useAdminList<Faq>("faqs");
  const { data: analytics } = useFaqAnalytics();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const channel = supabase
      .channel("admin-faq-analytics-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "faq_interactions" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["a:faq-analytics"] });
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [queryClient]);

  const publishedCount = faqs.filter((faq) => faq.visible).length;
  const hiddenCount = faqs.length - publishedCount;
  const categories = useMemo(
    () => Array.from(new Set(faqs.map((faq) => faq.category?.trim() || "General"))).sort((a, b) => a.localeCompare(b)),
    [faqs],
  );
  const normalizedQuery = query.trim().toLowerCase();
  const matches = (faq: Faq) => {
    const category = faq.category?.trim() || "General";
    const searchable = `${faq.question} ${faq.answer} ${category}`.toLowerCase();
    return (categoryFilter === "all" || category === categoryFilter) && (!normalizedQuery || searchable.includes(normalizedQuery));
  };
  const filteredCount = faqs.filter(matches).length;

  const topFaqs = useMemo(() => {
    const counts = new Map((analytics?.byFaq ?? []).map((item) => [item.faq_id, item]));
    return faqs
      .map((faq) => ({ faq, ... (counts.get(faq.id) ?? { views: 0, searches: 0 }) }))
      .sort((a, b) => (b.views + b.searches) - (a.views + a.searches))
      .slice(0, 5);
  }, [analytics?.byFaq, faqs]);

  return (
    <AdminLayout title="FAQs" subtitle="Manage the questions and answers shown on your public FAQ section.">
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminCard className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Total questions</p>
              <p className="mt-3 font-display text-3xl text-primary">{isLoading ? "—" : faqs.length}</p>
              <p className="mt-1 text-sm text-muted-foreground">All FAQ records in the CMS</p>
            </div>
            <span className="grid size-10 place-items-center bg-secondary text-primary"><HelpCircle className="size-5" /></span>
          </div>
        </AdminCard>
        <AdminCard className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Published</p>
              <p className="mt-3 font-display text-3xl text-primary">{isLoading ? "—" : publishedCount}</p>
              <p className="mt-1 text-sm text-muted-foreground">Visible on the public homepage</p>
            </div>
            <span className="grid size-10 place-items-center bg-[#EAF5E6] text-[#2F6B3D]"><CheckCircle2 className="size-5" /></span>
          </div>
        </AdminCard>
        <AdminCard className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Hidden drafts</p>
              <p className="mt-3 font-display text-3xl text-primary">{isLoading ? "—" : hiddenCount}</p>
              <p className="mt-1 text-sm text-muted-foreground">Saved but not currently published</p>
            </div>
            <span className="grid size-10 place-items-center bg-[#F4F4F0] text-muted-foreground"><EyeOff className="size-5" /></span>
          </div>
        </AdminCard>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <AdminCard className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">FAQ engagement</p>
              <p className="mt-3 font-display text-3xl text-primary">{analytics?.totalViews ?? 0}</p>
              <p className="mt-1 text-sm text-muted-foreground">Anonymous FAQ views recorded</p>
            </div>
            <span className="grid size-10 place-items-center bg-secondary text-primary"><TrendingUp className="size-5" /></span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
            <div><p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Search interactions</p><p className="mt-1 text-xl font-semibold text-primary">{analytics?.totalSearches ?? 0}</p></div>
            <div><p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Tracked questions</p><p className="mt-1 text-xl font-semibold text-primary">{analytics?.byFaq.length ?? 0}</p></div>
          </div>
        </AdminCard>
        <AdminCard className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Popular questions</p>
          <div className="mt-3 space-y-3">
            {topFaqs.length ? topFaqs.map(({ faq, views, searches }) => (
              <div key={faq.id} className="flex items-start justify-between gap-3 text-sm">
                <span className="line-clamp-2 font-medium text-primary">{faq.question || "Untitled question"}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{views + searches}</span>
              </div>
            )) : <p className="text-sm leading-6 text-muted-foreground">Engagement data will appear after visitors interact with published FAQs.</p>}
          </div>
        </AdminCard>
      </div>

      <AdminCard className="mb-6 border-primary/15 bg-primary/[0.04] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center bg-primary text-primary-foreground"><Eye className="size-4" /></span>
            <div>
              <h2 className="font-semibold text-primary">Publish FAQs from this workspace</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Add a question, choose a category, write its answer, and turn on “Visible on site” before saving. Use the drag handle to set the public order. Changes are synced to the homepage automatically.</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground"><GripVertical className="size-4" /> Drag to reorder</div>
        </div>
      </AdminCard>

      <AdminCard className="mb-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="flex min-w-0 flex-1 items-center gap-2 border border-border bg-background px-3 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <span className="sr-only">Search FAQs</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search questions, answers, or categories…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </label>
          <label className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            <span>Category</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="border border-border bg-background px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-primary outline-none focus:border-primary">
              <option value="all">All categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <p className="text-xs text-muted-foreground">Showing {filteredCount} of {faqs.length}</p>
        </div>
      </AdminCard>

      <CollectionEditor
        table="faqs"
        singularName="FAQ"
        invalidateKeys={[["p:faqs"]]}
        enableDragSort
        filter={matches}
        fields={[
          { name: "question", label: "Question", type: "text" },
          { name: "category", label: "Category", type: "text" },
          { name: "answer", label: "Answer", type: "richtext" },
        ]}
        preview={(row) => <FaqPreview row={row} />}
        columns={[
          { key: "question", label: "Question", render: (row: Faq) => <span className="font-semibold text-primary">{row.question || "Untitled question"}</span> },
          { key: "category", label: "Category", render: (row: Faq) => <Badge tone="brand">{row.category?.trim() || "General"}</Badge> },
          { key: "answer", label: "Answer" },
        ]}
      />

      {(analytics?.topSearches?.length ?? 0) > 0 ? (
        <AdminCard className="mt-6 p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Search demand</p>
              <h2 className="mt-1 font-display text-2xl text-primary">What visitors are looking for</h2>
            </div>
            <Search className="size-5 text-primary" />
          </div>
          <div className="flex flex-wrap gap-2">
            {analytics?.topSearches.map((item) => <span key={item.query} className="border border-border bg-background px-3 py-2 text-xs text-primary">{item.query} <strong className="ml-1 text-muted-foreground">{item.searches}</strong></span>)}
          </div>
        </AdminCard>
      ) : null}
    </AdminLayout>
  );
}

function FaqPreview({ row }: { row: Record<string, any> }) {
  const question = String(row.question ?? "Your question will appear here");
  const answer = String(row.answer ?? "Write an answer to preview it here.");
  const category = String(row.category ?? "General");
  const visible = row.visible !== false;

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-start">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          <span>Public FAQ preview</span>
          <Badge tone="brand">{category || "General"}</Badge>
          <Badge tone={visible ? "success" : "neutral"}>{visible ? "Published" : "Hidden"}</Badge>
        </div>
        <details open className="border border-primary/15 bg-background">
          <summary className="flex list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-primary [&::-webkit-details-marker]:hidden">
            <span>{question}</span>
            <span className="text-lg leading-none text-primary/60">−</span>
          </summary>
          <div className="border-t border-primary/10 px-5 py-4 text-sm leading-6 text-muted-foreground">
            <div className="rich-text" dangerouslySetInnerHTML={{ __html: richTextForDisplay(answer) }} />
          </div>
        </details>
      </div>
      <div className="border-l-2 border-secondary pl-4 text-sm leading-6 text-muted-foreground">
        <p className="font-semibold text-primary">Before publishing</p>
        <p className="mt-1">Choose a clear category, keep questions specific, use short paragraphs, and check the preview before making the answer visible.</p>
      </div>
    </div>
  );
}

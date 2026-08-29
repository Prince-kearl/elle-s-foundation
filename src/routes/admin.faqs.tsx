import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout, AdminCard, Badge } from "@/components/admin/AdminLayout";
import { CollectionEditor } from "@/components/admin/CollectionEditor";
import { richTextForDisplay } from "@/components/admin/RichTextEditor";
import { useAdminList } from "@/lib/cms";
import type { Faq } from "@/lib/cms";
import { CheckCircle2, Eye, EyeOff, GripVertical, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/admin/faqs")({
  head: () => ({ meta: [{ title: "FAQs — Admin" }, { name: "robots", content: "noindex" }] }),
  component: FaqAdmin,
});

function FaqAdmin() {
  const { data: faqs = [], isLoading } = useAdminList<Faq>("faqs");
  const publishedCount = faqs.filter((faq) => faq.visible).length;
  const hiddenCount = faqs.length - publishedCount;

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

      <AdminCard className="mb-6 border-primary/15 bg-primary/[0.04] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center bg-primary text-primary-foreground"><Eye className="size-4" /></span>
            <div>
              <h2 className="font-semibold text-primary">Publish FAQs from this workspace</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Add a question, write its answer, and turn on “Visible on site” before saving. Use the drag handle to set the public order. Changes are synced to the homepage automatically.</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground"><GripVertical className="size-4" /> Drag to reorder</div>
        </div>
      </AdminCard>

      <CollectionEditor
        table="faqs"
        singularName="FAQ"
        invalidateKeys={[["p:faqs"]]}
        enableDragSort
        fields={[
          { name: "question", label: "Question", type: "text" },
          { name: "answer", label: "Answer", type: "richtext" },
        ]}
        preview={(row) => <FaqPreview row={row} />}
        columns={[
          { key: "question", label: "Question", render: (row: Faq) => <span className="font-semibold text-primary">{row.question || "Untitled question"}</span> },
          { key: "answer", label: "Answer" },
        ]}
      />
    </AdminLayout>
  );
}

function FaqPreview({ row }: { row: Record<string, any> }) {
  const question = String(row.question ?? "Your question will appear here");
  const answer = String(row.answer ?? "Write an answer to preview it here.");
  const visible = row.visible !== false;

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-start">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          <span>Public FAQ preview</span>
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
        <p className="mt-1">Keep questions specific, use short paragraphs, and check the preview before making the answer visible.</p>
      </div>
    </div>
  );
}

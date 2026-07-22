import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CollectionEditor } from "@/components/admin/CollectionEditor";

export const Route = createFileRoute("/admin/faqs")({
  head: () => ({ meta: [{ title: "FAQs — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminLayout title="FAQs" subtitle="Questions your visitors ask most.">
      <CollectionEditor
        table="faqs"
        singularName="FAQ"
        invalidateKeys={[["p:faqs"]]}
        fields={[
          { name: "question", label: "Question", type: "text" },
          { name: "answer", label: "Answer", type: "textarea" },
        ]}
        columns={[
          { key: "question", label: "Question", render: (r: any) => <span className="font-semibold">{r.question}</span> },
          { key: "answer", label: "Answer" },
        ]}
      />
    </AdminLayout>
  ),
});

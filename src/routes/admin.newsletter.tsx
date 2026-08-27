import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Mail, MessageCircle, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import {
  AdminCard,
  AdminLayout,
  Badge,
  GhostButton,
  PrimaryButton,
  TextInput,
} from "@/components/admin/AdminLayout";
import {
  useAdminList,
  useDelete,
  useUpsert,
  type NewsletterConfirmationRecord,
  type NewsletterSubscriber,
} from "@/lib/cms";

export const Route = createFileRoute("/admin/newsletter")({
  head: () => ({
    meta: [{ title: "Newsletter Subscribers — Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: NewsletterAdmin,
});

function NewsletterAdmin() {
  const {
    data: subscribers,
    isLoading: subscribersLoading,
    error: subscribersError,
  } = useAdminList<NewsletterSubscriber>("newsletter_subscribers", "created_at");
  const { data: confirmations, error: confirmationsError } =
    useAdminList<NewsletterConfirmationRecord>("newsletter_confirmation_records", "created_at");
  const updateSubscriber = useUpsert("newsletter_subscribers");
  const deleteSubscriber = useDelete("newsletter_subscribers");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | NewsletterSubscriber["status"]>("all");

  const confirmationBySubscriber = useMemo(
    () =>
      new Map(
        (confirmations ?? []).map((record) => [
          `${record.subscriber_id}:${record.channel}`,
          record,
        ]),
      ),
    [confirmations],
  );

  const filteredSubscribers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...(subscribers ?? [])]
      .filter((subscriber) => statusFilter === "all" || subscriber.status === statusFilter)
      .filter(
        (subscriber) =>
          !normalizedQuery ||
          `${subscriber.email} ${subscriber.source}`.toLowerCase().includes(normalizedQuery),
      )
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  }, [query, statusFilter, subscribers]);

  const activeCount = (subscribers ?? []).filter(
    (subscriber) => subscriber.status === "subscribed",
  ).length;
  const unsubscribedCount = (subscribers ?? []).filter(
    (subscriber) => subscriber.status === "unsubscribed",
  ).length;
  const whatsappSetupCount = (confirmations ?? []).filter(
    (record) => record.channel === "whatsapp" && record.status === "needs_setup",
  ).length;

  function exportCsv() {
    const headers = [
      "Email",
      "Status",
      "WhatsApp number",
      "Source",
      "Subscribed at",
      "Database confirmation",
      "WhatsApp confirmation",
    ];
    const rows = filteredSubscribers.map((subscriber) => [
      subscriber.email,
      subscriber.status,
      subscriber.whatsapp_number ?? "",
      subscriber.source,
      subscriber.created_at,
      confirmationBySubscriber.get(`${subscriber.id}:database`)?.status ?? "not recorded",
      confirmationBySubscriber.get(`${subscriber.id}:whatsapp`)?.status ?? "not recorded",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => csvEscape(String(value))).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `elles-foundation-newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(
      `${filteredSubscribers.length} subscriber${filteredSubscribers.length === 1 ? "" : "s"} exported.`,
    );
  }

  async function updateStatus(
    subscriber: NewsletterSubscriber,
    status: NewsletterSubscriber["status"],
  ) {
    try {
      await updateSubscriber.mutateAsync({
        id: subscriber.id,
        status,
        updated_at: new Date().toISOString(),
      });
      toast.success(status === "subscribed" ? "Subscriber reactivated" : "Subscriber unsubscribed");
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Could not update subscriber status"));
    }
  }

  async function removeSubscriber(subscriber: NewsletterSubscriber) {
    if (!confirm(`Delete ${subscriber.email} and its confirmation records?`)) return;
    try {
      await deleteSubscriber.mutateAsync(subscriber.id);
      toast.success("Subscriber deleted");
    } catch (error: unknown) {
      toast.error(errorMessage(error, "Could not delete subscriber"));
    }
  }

  return (
    <AdminLayout
      title="Newsletter subscribers"
      subtitle="Review your audience, export the list, and track confirmation records from one workspace."
      action={
        <PrimaryButton onClick={exportCsv} disabled={!filteredSubscribers.length}>
          <Download className="size-4" /> Export CSV
        </PrimaryButton>
      }
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={Users}
          label="Total subscribers"
          value={(subscribers ?? []).length}
          tone="blue"
        />
        <Metric icon={Mail} label="Active subscriptions" value={activeCount} tone="green" />
        <Metric
          icon={MessageCircle}
          label="WhatsApp setup needed"
          value={whatsappSetupCount}
          tone="orange"
        />
        <Metric icon={Trash2} label="Unsubscribed" value={unsubscribedCount} tone="gold" />
      </div>

      <AdminCard className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[#e3e8e4] p-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
              AUDIENCE LIST
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold text-[#0b4a5a]">
              Newsletter subscribers
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {filteredSubscribers.length} of {(subscribers ?? []).length} records shown
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block min-w-0 sm:w-72">
              <span className="sr-only">Search subscribers</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <TextInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by email..."
                className="pl-9"
              />
            </label>
            <label>
              <span className="sr-only">Filter subscriber status</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "all" | NewsletterSubscriber["status"])
                }
                className="h-[42px] w-full border border-[#cdd9d2] bg-white px-3 text-sm text-[#0b4a5a] outline-none focus:border-[#f26518] sm:w-auto"
              >
                <option value="all">All statuses</option>
                <option value="subscribed">Subscribed</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
            </label>
          </div>
        </div>

        {subscribersLoading ? (
          <EmptyState label="Loading subscribers…" />
        ) : subscribersError ? (
          <div className="m-5 border border-[#f0c8b5] bg-[#fff6f0] p-5 text-sm text-[#8e3b1f]">
            <strong>Subscriber data is unavailable.</strong>
            <p className="mt-1">
              Apply the newsletter subscriber and confirmation migrations in Supabase, then refresh
              this page.
            </p>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <EmptyState
            label={
              query || statusFilter !== "all"
                ? "No subscribers match these filters."
                : "No subscribers yet. New footer signups will appear here."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-[var(--background)] text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                <tr>
                  <th className="px-5 py-3">Subscriber</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Confirmations</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e8e4]">
                {filteredSubscribers.map((subscriber) => {
                  const databaseRecord = confirmationBySubscriber.get(`${subscriber.id}:database`);
                  const whatsappRecord = confirmationBySubscriber.get(`${subscriber.id}:whatsapp`);
                  return (
                    <tr key={subscriber.id} className="align-top hover:bg-[var(--background)]">
                      <td className="px-5 py-4">
                        <a
                          href={`mailto:${subscriber.email}`}
                          className="font-semibold text-[#0b4a5a] hover:text-[#f26518] hover:underline"
                        >
                          {subscriber.email}
                        </a>
                        {subscriber.whatsapp_number && (
                          <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                            WhatsApp: {subscriber.whatsapp_number}
                          </div>
                        )}
                        <div className="mt-1 text-[0.68rem] uppercase tracking-[0.1em] text-[var(--muted-foreground)]">
                          {subscriber.source.replaceAll("_", " ")}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-[#5c756a]">
                        {formatDate(subscriber.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge
                            tone={databaseRecord?.status === "recorded" ? "success" : "neutral"}
                          >
                            Database {databaseRecord?.status ?? "missing"}
                          </Badge>
                          <Badge
                            tone={
                              whatsappRecord?.status === "needs_setup"
                                ? "warn"
                                : whatsappRecord?.status === "sent"
                                  ? "success"
                                  : "neutral"
                            }
                          >
                            WhatsApp {whatsappRecord?.status ?? "missing"}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={subscriber.status}
                          onChange={(event) =>
                            updateStatus(
                              subscriber,
                              event.target.value as NewsletterSubscriber["status"],
                            )
                          }
                          className="border border-[#cdd9d2] bg-white px-2 py-1.5 text-xs font-semibold text-[#0b4a5a] outline-none focus:border-[#f26518]"
                        >
                          <option value="subscribed">Subscribed</option>
                          <option value="unsubscribed">Unsubscribed</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <GhostButton
                          onClick={() => removeSubscriber(subscriber)}
                          className="border-[#efc8c8] text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="size-3.5" /> Delete
                        </GhostButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <div className="mt-4 border border-[#f2d892] bg-[#fffbea] p-4 text-sm text-[#735e17]">
        <strong>WhatsApp confirmation status:</strong>{" "}
        {confirmationsError
          ? "Confirmation records are unavailable. Apply the confirmation migration in Supabase, then refresh this page."
          : "Database records are created automatically for each signup. WhatsApp rows remain marked needs setup until an approved WhatsApp Business provider, sender number, and message template are connected."}
      </div>
    </AdminLayout>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  tone: "gold" | "green" | "orange" | "blue";
}) {
  const tones = {
    gold: "bg-[#fff7c7] text-[#0b4a5a]",
    green: "bg-[#dff5e8] text-[var(--primary)]",
    orange: "bg-[#ffe2d2] text-[#f26518]",
    blue: "bg-[#dcecf4] text-[#1b86b8]",
  };
  return (
    <div className="border border-[#dfe6e1] bg-white p-4">
      <div className="flex items-start justify-between">
        <span className={`grid size-9 place-items-center ${tones[tone]}`}>
          <Icon className="size-4" />
        </span>
        <span className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          Live
        </span>
      </div>
      <div className="mt-4 font-display text-3xl font-semibold text-[#0b4a5a]">{value}</div>
      <div className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
        {label}
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="border-b border-dashed border-[#dfe6e1] p-10 text-center text-sm text-[var(--muted-foreground)]">
      {label}
    </div>
  );
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function csvEscape(value: string) {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, Check, ClipboardList, MailCheck, MapPin, Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { AdminCard, AdminLayout, Badge, GhostButton, PrimaryButton, TextInput } from "@/components/admin/AdminLayout";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { useAdminList, useDelete, useUpsert, type EventRecord, type EventRsvp, type RsvpEmailConfirmation } from "@/lib/cms";

export const Route = createFileRoute("/admin/events")({
  head: () => ({ meta: [{ title: "Events & RSVPs — Admin" }, { name: "robots", content: "noindex" }] }),
  component: EventsAdmin,
});

const emptyEvent: Partial<EventRecord> = {
  title: "",
  event_type: "Community event",
  description: "",
  event_date: "",
  start_time: "",
  end_time: "",
  location: "",
  status: "draft",
  visible: false,
  accent: "#ff8a3d",
  position: 0,
};

function EventsAdmin() {
  const { data: events, isLoading: eventsLoading } = useAdminList<EventRecord>("events");
  const { data: rsvps, isLoading: rsvpsLoading } = useAdminList<EventRsvp>("event_rsvps");
  const { data: emailConfirmations } = useAdminList<RsvpEmailConfirmation>("rsvp_email_confirmations", "created_at");
  const upsertEvent = useUpsert("events", [["p:events"]]);
  const deleteEvent = useDelete("events", [["p:events"]]);
  const upsertRsvp = useUpsert("event_rsvps");
  const [editing, setEditing] = useState<Partial<EventRecord> | null>(null);

  const orderedEvents = [...(events ?? [])].sort((a, b) => a.event_date.localeCompare(b.event_date));
  const published = orderedEvents.filter((event) => event.status === "published" && event.visible);
  const pendingRsvps = (rsvps ?? []).filter((rsvp) => rsvp.status === "pending");
  const totalGuests = (rsvps ?? []).filter((rsvp) => rsvp.status !== "cancelled").reduce((sum, rsvp) => sum + Number(rsvp.guests || 1), 0);
  const failedEmailConfirmations = (emailConfirmations ?? []).filter((record) => record.status === "failed" || record.status === "needs_setup").length;
  const confirmationByRsvp = new Map((emailConfirmations ?? []).map((record) => [record.rsvp_id, record]));

  async function saveEvent(event: Partial<EventRecord>) {
    try {
      await upsertEvent.mutateAsync({ ...event, position: event.position ?? orderedEvents.length, updated_at: new Date().toISOString() });
      toast.success(event.id ? "Event updated" : "Event created");
      setEditing(null);
    } catch (error: any) {
      toast.error(error?.message ?? "Could not save event");
    }
  }

  return (
    <AdminLayout title="Events & RSVPs" subtitle="Plan community moments, publish dates, and manage registrations from one workspace." action={<PrimaryButton onClick={() => setEditing({ ...emptyEvent, position: orderedEvents.length })}><Plus className="size-4" /> Add event</PrimaryButton>}>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={CalendarDays} label="Total events" value={orderedEvents.length} tone="gold" />
        <Metric icon={Check} label="Published" value={published.length} tone="green" />
        <Metric icon={ClipboardList} label="Pending RSVPs" value={pendingRsvps.length} tone="orange" />
        <Metric icon={Users} label="Guests registered" value={totalGuests} tone="blue" />
        <Metric icon={MailCheck} label="Email issues" value={failedEmailConfirmations} tone="orange" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminCard className="overflow-hidden">
          <SectionHeader eyebrow="EVENT CALENDAR" title="Upcoming and scheduled events" icon={<CalendarDays className="size-4 text-[#f26518]" />} />
          {eventsLoading ? <EmptyState label="Loading events…" /> : orderedEvents.length === 0 ? <EmptyState label="No events yet. Add the first community event." /> : (
            <div className="divide-y divide-[#e3e8e4]">
              {orderedEvents.map((event) => (
                <div key={event.id} className="grid gap-4 p-5 md:grid-cols-[4.5rem_1fr_auto] md:items-center hover:bg-[#fbfff8]">
                  <div className="grid size-14 place-items-center border border-[#0b4a5a]/15 bg-[#f1fae9] text-center"><div><div className="font-display text-2xl font-semibold leading-none text-[#0b4a5a]">{new Date(`${event.event_date}T00:00:00`).toLocaleDateString("en-GH", { day: "2-digit" })}</div><div className="mt-1 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[#f26518]">{new Date(`${event.event_date}T00:00:00`).toLocaleDateString("en-GH", { month: "short" })}</div></div></div>
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[#477763]">{event.event_type}</span>{event.status === "published" && event.visible ? <Badge tone="success">Published</Badge> : event.status === "archived" ? <Badge>Archived</Badge> : <Badge tone="warn">Draft</Badge>}</div><h3 className="mt-1 font-display text-xl font-semibold text-[#0b4a5a]">{event.title}</h3><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#477763]"><span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" /> {event.location}</span><span>{event.start_time ? event.start_time.slice(0, 5) : "Time to be confirmed"}</span></div></div>
                  <div className="flex gap-2 md:justify-end"><GhostButton onClick={() => setEditing(event)}><Pencil className="size-3.5" /> Edit</GhostButton><button type="button" title="Delete event" onClick={async () => { if (!confirm(`Delete ${event.title}?`)) return; await deleteEvent.mutateAsync(event.id); toast.success("Event deleted"); }} className="border border-[#efc8c8] px-3 py-2 text-red-600 hover:bg-red-50"><Trash2 className="size-4" /></button></div>
                </div>
              ))}
            </div>
          )}
        </AdminCard>

        <AdminCard className="overflow-hidden">
          <SectionHeader eyebrow="REGISTRATION INBOX" title="Latest RSVPs" icon={<ClipboardList className="size-4 text-[#f26518]" />} />
          {rsvpsLoading ? <EmptyState label="Loading RSVPs…" /> : (rsvps ?? []).length === 0 ? <EmptyState label="No registrations yet." /> : (
            <div className="divide-y divide-[#e3e8e4]">
              {[...(rsvps ?? [])].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 8).map((rsvp) => {
                const event = events?.find((item) => item.id === rsvp.event_id);
                return <div key={rsvp.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><div className="font-semibold text-[#0b4a5a]">{rsvp.name}</div><a href={`mailto:${rsvp.email}`} className="text-xs text-[#0f6848] hover:underline">{rsvp.email}</a></div><Badge tone={rsvp.status === "confirmed" || rsvp.status === "attended" ? "success" : rsvp.status === "cancelled" ? "neutral" : "warn"}>{rsvp.status}</Badge></div><div className="mt-3 text-xs font-semibold text-[#477763]">{event?.title ?? "Event"} · {rsvp.guests} {rsvp.guests === 1 ? "guest" : "guests"}</div>{rsvp.note && <p className="mt-2 text-sm leading-6 text-[#5c756a]">{rsvp.note}</p>}<div className="mt-3 flex items-center justify-between gap-3"><span className="text-[0.65rem] uppercase tracking-[0.12em] text-[#8aa096]">{new Date(rsvp.created_at).toLocaleString()}</span>{(() => { const confirmation = confirmationByRsvp.get(rsvp.id); return confirmation ? <Badge tone={confirmation.status === "sent" ? "success" : confirmation.status === "failed" || confirmation.status === "needs_setup" ? "warn" : "neutral"}>Email: {confirmation.status.replace("_", " ")}</Badge> : <span className="text-[0.65rem] text-[#8aa096]">Email pending</span>; })()}<select value={rsvp.status} onChange={async (e) => { await upsertRsvp.mutateAsync({ id: rsvp.id, status: e.target.value }); toast.success("RSVP status updated"); }} className="border border-[#0b4a5a]/15 bg-white px-2 py-1.5 text-xs font-semibold text-[#0b4a5a] outline-none"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="attended">Attended</option><option value="cancelled">Cancelled</option></select></div></div>;
              })}
            </div>
          )}
        </AdminCard>
      </div>

      {editing && <EventEditor event={editing} onClose={() => setEditing(null)} onSave={saveEvent} />}
    </AdminLayout>
  );
}

function Metric({ icon: Icon, label, value, tone }: { icon: typeof CalendarDays; label: string; value: number; tone: "gold" | "green" | "orange" | "blue" }) {
  const tones = { gold: "bg-[#fff7c7] text-[#0b4a5a]", green: "bg-[#dff5e8] text-[#0f6848]", orange: "bg-[#ffe2d2] text-[#f26518]", blue: "bg-[#dcecf4] text-[#1b86b8]" };
  return <div className="border border-[#dfe6e1] bg-white p-4"><div className="flex items-start justify-between"><span className={`grid size-9 place-items-center ${tones[tone]}`}><Icon className="size-4" /></span><span className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#8aa096]">Live</span></div><div className="mt-4 font-display text-3xl font-semibold text-[#0b4a5a]">{value}</div><div className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#477763]">{label}</div></div>;
}

function SectionHeader({ eyebrow, title, icon }: { eyebrow: string; title: string; icon: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-3 border-b border-[#e3e8e4] p-5"><div><div className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[#8aa096]">{eyebrow}</div><h2 className="mt-1 font-display text-xl font-semibold text-[#0b4a5a]">{title}</h2></div>{icon}</div>;
}

function EmptyState({ label }: { label: string }) {
  return <div className="border-b border-dashed border-[#dfe6e1] p-10 text-center text-sm text-[#6b8076]">{label}</div>;
}

function EventEditor({ event, onClose, onSave }: { event: Partial<EventRecord>; onClose: () => void; onSave: (event: Partial<EventRecord>) => Promise<void> }) {
  const [state, setState] = useState(event);
  const set = (key: string, value: unknown) => setState((current) => ({ ...current, [key]: value }));
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#073b2b]/70 p-4" role="dialog" aria-modal="true" onClick={onClose}><div className="w-full max-w-2xl border border-[#0b4a5a]/20 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-start justify-between border-b border-[#dfe6e1] p-6"><div><div className="text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[#f26518]">Calendar manager</div><h2 className="mt-2 font-display text-2xl font-semibold text-[#0b4a5a]">{state.id ? "Edit event" : "Create event"}</h2></div><button type="button" onClick={onClose} className="border border-[#0b4a5a]/15 px-3 py-2 text-sm font-bold text-[#0b4a5a]">Esc</button></div><form onSubmit={(e) => { e.preventDefault(); onSave(state); }} className="grid gap-4 p-6 sm:grid-cols-2"><label className="text-xs font-bold uppercase tracking-[0.12em] text-[#477763] sm:col-span-2">Event title<TextInput required value={state.title ?? ""} onChange={(e) => set("title", e.target.value)} className="mt-2" placeholder="The Smile Project" /></label><label className="text-xs font-bold uppercase tracking-[0.12em] text-[#477763]">Event type<TextInput required value={state.event_type ?? ""} onChange={(e) => set("event_type", e.target.value)} className="mt-2" placeholder="Community event" /></label><label className="text-xs font-bold uppercase tracking-[0.12em] text-[#477763]">Location<TextInput required value={state.location ?? ""} onChange={(e) => set("location", e.target.value)} className="mt-2" placeholder="Dzowulu Special School" /></label><label className="text-xs font-bold uppercase tracking-[0.12em] text-[#477763]">Date<TextInput required type="date" value={state.event_date ?? ""} onChange={(e) => set("event_date", e.target.value)} className="mt-2" /></label><label className="text-xs font-bold uppercase tracking-[0.12em] text-[#477763]">Start time<TextInput type="time" value={state.start_time ?? ""} onChange={(e) => set("start_time", e.target.value)} className="mt-2" /></label><label className="text-xs font-bold uppercase tracking-[0.12em] text-[#477763]">End time<TextInput type="time" value={state.end_time ?? ""} onChange={(e) => set("end_time", e.target.value)} className="mt-2" /></label><label className="text-xs font-bold uppercase tracking-[0.12em] text-[#477763]">Status<select value={state.status ?? "draft"} onChange={(e) => set("status", e.target.value)} className="mt-2 w-full border border-[#0b4a5a]/15 bg-white px-3 py-2.5 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#f26518]"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label><label className="text-xs font-bold uppercase tracking-[0.12em] text-[#477763] sm:col-span-2">Description<div className="mt-2"><RichTextEditor value={state.description ?? ""} onChange={(value) => set("description", value)} placeholder="Describe the event and what guests can expect." /></div></label><div className="flex items-center justify-between gap-3 border-t border-[#dfe6e1] pt-4 sm:col-span-2"><label className="flex items-center gap-2 text-sm font-semibold text-[#0b4a5a]"><input type="checkbox" checked={!!state.visible} onChange={(e) => set("visible", e.target.checked)} /> Show on public calendar</label><div className="flex gap-2"><GhostButton onClick={onClose}>Cancel</GhostButton><PrimaryButton type="submit">Save event</PrimaryButton></div></div></form></div></div>;
}

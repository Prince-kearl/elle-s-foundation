import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL");
  const appUrl = Deno.env.get("PUBLIC_SITE_URL") ?? "https://ellesfoundation.org";

  if (!supabaseUrl || !serviceRoleKey) return json({ error: "Supabase function secrets are not configured" }, 503);
  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const body = await request.json().catch(() => ({}));
  const rsvpId = body.rsvp_id ?? body.confirmation_id;
  if (!rsvpId) return json({ error: "rsvp_id is required" }, 400);

  const { data: confirmation, error: confirmationError } = await admin
    .from("rsvp_email_confirmations")
    .select("*")
    .eq(body.confirmation_id ? "id" : "rsvp_id", rsvpId)
    .single();
  if (confirmationError || !confirmation) return json({ error: confirmationError?.message ?? "Confirmation record not found" }, 404);
  if (confirmation.status === "sent") return json({ ok: true, status: "sent", provider_message_id: confirmation.provider_message_id });

  const { data: rsvp, error: rsvpError } = await admin
    .from("event_rsvps")
    .select("id, name, email, guests, note, status, events(title, event_date, start_time, end_time, location)")
    .eq("id", confirmation.rsvp_id)
    .single();
  if (rsvpError || !rsvp) return json({ error: rsvpError?.message ?? "RSVP not found" }, 404);

  if (!resendApiKey || !fromEmail) {
    await updateConfirmation(admin, confirmation.id, { status: "needs_setup", error_message: "RESEND_API_KEY and RESEND_FROM_EMAIL are required" });
    return json({ ok: false, status: "needs_setup" }, 503);
  }

  await updateConfirmation(admin, confirmation.id, { status: "sending", error_message: null });
  const event = Array.isArray(rsvp.events) ? rsvp.events[0] : rsvp.events;
  const eventDate = event?.event_date ? new Date(`${event.event_date}T00:00:00Z`).toLocaleDateString("en-GB", { dateStyle: "long", timeZone: "UTC" }) : "the scheduled date";
  const subject = `Your RSVP is confirmed — ${event?.title ?? "Elle's Foundation event"}`;
  const text = [
    `Hi ${rsvp.name},`,
    "",
    `Thank you for registering for ${event?.title ?? "this community event"}. Your RSVP has been received.",
    "",
    `Date: ${eventDate}`,
    event?.start_time ? `Time: ${event.start_time}${event.end_time ? `–${event.end_time}` : ""}` : null,
    event?.location ? `Location: ${event.location}` : null,
    `Guests: ${rsvp.guests}`,
    rsvp.note ? `Note: ${rsvp.note}` : null,
    "",
    `We look forward to seeing you. For updates, visit ${appUrl}/#events`,
    "",
    "Elle's Foundation",
  ].filter(Boolean).join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: fromEmail, to: [rsvp.email], subject, text }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage = result?.message ?? result?.name ?? `Resend returned ${response.status}`;
    await updateConfirmation(admin, confirmation.id, { status: "failed", error_message: errorMessage });
    return json({ ok: false, status: "failed", error: errorMessage }, 502);
  }

  await updateConfirmation(admin, confirmation.id, {
    status: "sent",
    provider_message_id: result?.id ?? null,
    error_message: null,
    sent_at: new Date().toISOString(),
  });
  return json({ ok: true, status: "sent", provider_message_id: result?.id ?? null });
});

async function updateConfirmation(client: ReturnType<typeof createClient>, id: string, values: Record<string, unknown>) {
  await client.from("rsvp_email_confirmations").update({ ...values, updated_at: new Date().toISOString() }).eq("id", id);
}

function json(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: corsHeaders });
}

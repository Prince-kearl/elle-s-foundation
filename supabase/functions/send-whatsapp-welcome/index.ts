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
  const accessToken = Deno.env.get("META_WHATSAPP_ACCESS_TOKEN");
  const webhookSecret = Deno.env.get("WHATSAPP_QUEUE_WEBHOOK_SECRET");
  const phoneNumberId = Deno.env.get("META_WHATSAPP_PHONE_NUMBER_ID");
  const apiVersion = Deno.env.get("META_WHATSAPP_API_VERSION") ?? "v23.0";
  const newsletterTemplate = Deno.env.get("META_WHATSAPP_NEWSLETTER_TEMPLATE_NAME");
  const donationTemplate = Deno.env.get("META_WHATSAPP_DONATION_TEMPLATE_NAME");
  const templateLanguage = Deno.env.get("META_WHATSAPP_TEMPLATE_LANGUAGE") ?? "en_US";

  if (!supabaseUrl || !serviceRoleKey || !accessToken || !phoneNumberId || !webhookSecret) {
    return json({ error: "WhatsApp provider secrets are not configured" }, 503);
  }
  if (request.headers.get("x-webhook-secret") !== webhookSecret) {
    return json({ error: "Unauthorized" }, 401);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const body = await request.json().catch(() => ({}));
  const queueId = body.queue_id ?? body.record?.id;
  if (!queueId) return json({ error: "queue_id is required" }, 400);

  const { data: queue, error: queueError } = await admin
    .from("whatsapp_welcome_queue")
    .select("*")
    .eq("id", queueId)
    .single();
  if (queueError || !queue) return json({ error: queueError?.message ?? "Queue record not found" }, 404);
  if (queue.status === "sent") return json({ ok: true, status: "sent", provider_message_id: queue.provider_message_id });

  const templateName = queue.source_type === "donation" ? donationTemplate : newsletterTemplate;
  if (!templateName) {
    await updateQueue(admin, queue.id, { status: "needs_setup", error_message: "No approved WhatsApp template is configured for this source" });
    await syncNewsletterConfirmation(admin, queue, "needs_setup");
    return json({ error: "No approved WhatsApp template is configured for this source" }, 503);
  }

  await updateQueue(admin, queue.id, { status: "sending", error_message: null });
  const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: queue.phone,
      type: "template",
      template: { name: templateName, language: { code: templateLanguage } },
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage = result?.error?.message ?? `Meta API returned ${response.status}`;
    await updateQueue(admin, queue.id, { status: "failed", error_message: errorMessage });
    await syncNewsletterConfirmation(admin, queue, "failed");
    return json({ error: errorMessage }, 502);
  }

  const providerMessageId = result?.messages?.[0]?.id ?? null;
  await updateQueue(admin, queue.id, {
    status: "sent",
    provider_message_id: providerMessageId,
    error_message: null,
    sent_at: new Date().toISOString(),
  });
  await syncNewsletterConfirmation(admin, queue, "sent");
  return json({ ok: true, status: "sent", provider_message_id: providerMessageId });
});

async function syncNewsletterConfirmation(client: ReturnType<typeof createClient>, queue: { source_type: string; source_id: string }, status: string) {
  if (queue.source_type !== "newsletter") return;
  await client.from("newsletter_confirmation_records").update({ status, updated_at: new Date().toISOString() }).eq("subscriber_id", queue.source_id).eq("channel", "whatsapp");
}

async function updateQueue(client: ReturnType<typeof createClient>, id: string, values: Record<string, unknown>) {
  await client.from("whatsapp_welcome_queue").update({ ...values, updated_at: new Date().toISOString() }).eq("id", id);
}

function json(payload: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: corsHeaders });
}

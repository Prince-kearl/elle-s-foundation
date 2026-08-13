import { createServerFn } from "@tanstack/react-start";

/**
 * Cloudflare R2 uploads via SigV4 presigned PUT URLs.
 * Secrets live in the server environment only:
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL
 */

const enc = new TextEncoder();

async function hmac(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey("raw", key as BufferSource, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", k, enc.encode(data));
}

function hex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(s: string) {
  return hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
}

function uriEncode(str: string, encodeSlash = true) {
  return str
    .split("")
    .map((ch) => {
      if (/[A-Za-z0-9_\-~.]/.test(ch)) return ch;
      if (ch === "/") return encodeSlash ? "%2F" : "/";
      return Array.from(enc.encode(ch)).map((b) => `%${b.toString(16).toUpperCase().padStart(2, "0")}`).join("");
    })
    .join("");
}

function readEnv() {
  return {
    accountId: process.env["R2_ACCOUNT_ID"] ?? "",
    accessKeyId: process.env["R2_ACCESS_KEY_ID"] ?? "",
    secretAccessKey: process.env["R2_SECRET_ACCESS_KEY"] ?? "",
    bucket: process.env["R2_BUCKET"] ?? "",
    publicBase: (process.env["R2_PUBLIC_BASE_URL"] ?? "").replace(/\/+$/, ""),
  };
}

export const r2Status = createServerFn({ method: "GET" }).handler(async () => {
  const cfg = readEnv();
  const missing = (["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET", "R2_PUBLIC_BASE_URL"] as const).filter(
    (k) => !process.env[k],
  );
  let reachable: boolean | null = null;
  let message = "";
  if (missing.length === 0) {
    try {
      const res = await fetch(`${cfg.publicBase}/`, { method: "HEAD" });
      reachable = res.status < 500;
      message = `Public base responded with ${res.status}`;
    } catch (e) {
      reachable = false;
      message = e instanceof Error ? e.message : "Public base unreachable";
    }
  }
  return {
    configured: missing.length === 0,
    missing,
    bucket: cfg.bucket,
    publicBase: cfg.publicBase,
    accountIdMasked: cfg.accountId ? `${cfg.accountId.slice(0, 4)}…${cfg.accountId.slice(-4)}` : "",
    reachable,
    message,
  };
});

export const r2PresignUpload = createServerFn({ method: "POST" })
  .inputValidator((input: { key: string; contentType: string }) => {
    if (!input?.key || !/^[\w./-]+$/.test(input.key)) throw new Error("Invalid object key");
    if (!input?.contentType) throw new Error("Missing content type");
    return input;
  })
  .handler(async ({ data }) => {
    const { accountId, accessKeyId, secretAccessKey, bucket, publicBase } = readEnv();
    if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBase) {
      throw new Error("Cloudflare R2 is not configured on the server.");
    }

    const host = `${accountId}.r2.cloudflarestorage.com`;
    const region = "auto";
    const service = "s3";
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const canonicalUri = `/${bucket}/${uriEncode(data.key, false)}`;

    const query = new URLSearchParams({
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": `${accessKeyId}/${credentialScope}`,
      "X-Amz-Date": amzDate,
      "X-Amz-Expires": "900",
      "X-Amz-SignedHeaders": "host",
    });
    const canonicalQuery = Array.from(query.entries())
      .map(([k, v]) => [uriEncode(k), uriEncode(v)] as const)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([k, v]) => `${k}=${v}`)
      .join("&");

    const canonicalRequest = [
      "PUT",
      canonicalUri,
      canonicalQuery,
      `host:${host}\n`,
      "host",
      "UNSIGNED-PAYLOAD",
    ].join("\n");

    const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, await sha256Hex(canonicalRequest)].join("\n");

    const kDate = await hmac(enc.encode(`AWS4${secretAccessKey}`), dateStamp);
    const kRegion = await hmac(kDate, region);
    const kService = await hmac(kRegion, service);
    const kSigning = await hmac(kService, "aws4_request");
    const signature = hex(await hmac(kSigning, stringToSign));

    return {
      uploadUrl: `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`,
      publicUrl: `${publicBase}/${data.key}`,
    };
  });

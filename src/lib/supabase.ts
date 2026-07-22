import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

// Opaque sb_publishable_* keys aren't JWTs. supabase-js sends them as both
// `apikey` and `Authorization: Bearer <key>`. Strip the Authorization header
// unless a real user session token is present, otherwise PostgREST rejects
// with "Expected 3 parts in JWT; got 1".
const customFetch: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers);
  const auth = headers.get("Authorization");
  if (auth === `Bearer ${key}`) headers.delete("Authorization");
  headers.set("apikey", key);
  return fetch(input, { ...init, headers });
};

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "elle-foundation-auth",
  },
  global: { fetch: customFetch },
});

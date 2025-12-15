// api/_supabase.js
let _client = null;

export async function getSupabase() {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing SUPABASE_URL");
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  // ✅ dynamic import works regardless of ESM/CJS build mode
  const { createClient } = await import("@supabase/supabase-js");

  _client = createClient(url, key, {
    auth: { persistSession: false },
  });

  return _client;
}

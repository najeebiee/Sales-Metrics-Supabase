// api/users.js
import { getSupabase } from "./_supabase.js";

export default async function handler(req, res) {
  try {
    const supabase = await getSupabase();

    const { df, dt, search } = req.query;

    let query = supabase
      .from("user_profiles")
      .select("*")
      .order("date_created", { ascending: false });

    if (df) query = query.gte("date_created", `${df}T00:00:00.000Z`);
    if (dt) query = query.lte("date_created", `${dt}T23:59:59.999Z`);

    if (search && search.trim()) {
      const s = search.trim();
      // search username OR name
      query = query.or(`username.ilike.%${s}%,name.ilike.%${s}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.status(200).json({ data: data ?? [] });
  } catch (err) {
    console.error("Vercel /api/users error:", err);
    res.status(500).json({ error: "Proxy failed", details: err.message || String(err) });
  }
}

// api/personalAccounts.js
import { getSupabase } from './_supabase.js';

export default async function handler(req, res) {
  try {
    const supabase = await getSupabase();
    const { username } = req.query;

    let query = supabase.from('personal_accounts').select('*');

    if (username && typeof username === 'string') {
      query = query.ilike('user_name', `%${username}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json({ data: data ?? [] });
  } catch (err) {
    console.error('api/personalAccounts error', err);
    return res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
}

// api/networkActivity.js
import { getSupabase } from './_supabase.js';

const parseDate = (value) => {
  if (!value || typeof value !== 'string' || value.length !== 8) return null;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null;
  return { year, month, day };
};

const toUtcRangeStart = ({ year, month, day }) =>
  new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)).toISOString();

const toUtcRangeEnd = ({ year, month, day }) =>
  new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999)).toISOString();

export default async function handler(req, res) {
  try {
    const supabase = await getSupabase();
    const { df, dt, username } = req.query;

    let query = supabase.from('network_activity').select('*');

    const dfDate = parseDate(df);
    const dtDate = parseDate(dt);

    if (dfDate) {
      query = query.gte('request_date', toUtcRangeStart(dfDate));
    }
    if (dtDate) {
      query = query.lte('request_date', toUtcRangeEnd(dtDate));
    }

    if (username && typeof username === 'string') {
      query = query.ilike('user_name', `%${username}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json({ data: data ?? [] });
  } catch (err) {
    console.error('api/networkActivity error', err);
    return res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
}

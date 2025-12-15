// api/sales.js
import { getSupabase } from './_supabase.js';

const parseDate = (value) => {
  if (!value || typeof value !== 'string' || value.length !== 8) return null;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return null;
  return { year, month, day };
};

const toDateString = ({ year, month, day }) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export default async function handler(req, res) {
  try {
    const supabase = await getSupabase();
    const { df, dt } = req.query;

    let query = supabase.from('sales').select('*');

    const dfDate = parseDate(df);
    const dtDate = parseDate(dt);

    if (dfDate) {
      query = query.gte('transdate', toDateString(dfDate));
    }
    if (dtDate) {
      query = query.lte('transdate', toDateString(dtDate));
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json({ data: data ?? [] });
  } catch (err) {
    console.error('api/sales error', err);
    return res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
}

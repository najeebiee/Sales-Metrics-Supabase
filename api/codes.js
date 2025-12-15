// api/codes.js
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

const searchableColumns = [
  'owner_user_name',
  'owner_name',
  'sponsor_login_name',
  'sponsor_name',
  'used_by_user_name',
  'used_by_name',
  'code_sku',
  'code',
  'code_status',
];

export default async function handler(req, res) {
  try {
    const supabase = await getSupabase();
    const { df, dt, search } = req.query;

    let query = supabase.from('codes').select('*');

    const dfDate = parseDate(df);
    const dtDate = parseDate(dt);

    if (dfDate) {
      query = query.gte('code_date_created', toUtcRangeStart(dfDate));
    }
    if (dtDate) {
      query = query.lte('code_date_created', toUtcRangeEnd(dtDate));
    }

    if (search && typeof search === 'string') {
      const term = `%${search}%`;
      const orFilters = searchableColumns.map((col) => `${col}.ilike.${term}`).join(',');
      query = query.or(orFilters);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json({ data: data ?? [] });
  } catch (err) {
    console.error('api/codes error', err);
    return res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
}

// api/users.js
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
    const { df, dt, search } = req.query;

    let query = supabase
      .from('user_profiles')
      .select(
        [
          'username',
          'name',
          'sponsored_by',
          'placement',
          'grp',
          'account_type',
          'date_created',
          'region',
          'province',
          'city',
          'barangay',
          'status',
        ].join(',')
      );

    const dfDate = parseDate(df);
    const dtDate = parseDate(dt);

    if (dfDate) query = query.gte('date_created', toUtcRangeStart(dfDate));
    if (dtDate) query = query.lte('date_created', toUtcRangeEnd(dtDate));

    if (search && typeof search === 'string') {
      const term = `%${search}%`;
      query = query.or(`username.ilike.${term},name.ilike.${term}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({
        error: 'Supabase query failed',
        details: error.message,
        code: error.code,
        hint: error.hint,
      });
    }

    return res.status(200).json({ data: data ?? [] });
  } catch (err) {
    console.error('api/users crash:', err);
    return res.status(500).json({
      error: 'Function crashed',
      details: err?.message ?? String(err),
      stack: err?.stack ?? null,
    });
  }
}

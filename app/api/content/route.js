import { supabaseAdmin, supabasePublic } from '@/lib/supabaseClient';

// GET: publik, ambil semua konten editable (dipakai homepage render teks/galeri/video)
export async function GET() {
  const { data, error } = await supabasePublic.from('site_content').select('key, value');
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const content = {};
  for (const row of data) content[row.key] = row.value;
  return Response.json({ content });
}

// POST: admin only, update satu atau beberapa key sekaligus
// body: { updates: { key1: value1, key2: value2 } }
export async function POST(req) {
  const adminToken = req.headers.get('x-admin-token');
  if (adminToken !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { updates } = await req.json();
  if (!updates || typeof updates !== 'object') {
    return Response.json({ error: 'updates wajib diisi' }, { status: 400 });
  }

  const db = supabaseAdmin();
  const rows = Object.entries(updates).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await db.from('site_content').upsert(rows, { onConflict: 'key' });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}

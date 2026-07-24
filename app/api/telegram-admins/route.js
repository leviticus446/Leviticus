import { supabaseAdmin } from '@/lib/supabaseClient';

function checkAdmin(req) {
  return req.headers.get('x-admin-token') === process.env.ADMIN_SECRET;
}

export async function GET(req) {
  if (!checkAdmin(req)) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const db = supabaseAdmin();
  const { data, error } = await db.from('telegram_admins').select('*').order('created_at', { ascending: true });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ admins: data });
}

export async function POST(req) {
  if (!checkAdmin(req)) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { telegram_chat_id, telegram_username, name } = await req.json();
  if (!telegram_chat_id) return Response.json({ error: 'telegram_chat_id wajib diisi' }, { status: 400 });

  const db = supabaseAdmin();
  const { data, error } = await db
    .from('telegram_admins')
    .upsert({ telegram_chat_id, telegram_username, name, is_active: true }, { onConflict: 'telegram_chat_id' })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ admin: data });
}

export async function DELETE(req) {
  if (!checkAdmin(req)) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return Response.json({ error: 'id wajib diisi' }, { status: 400 });

  const db = supabaseAdmin();
  const { error } = await db.from('telegram_admins').delete().eq('id', id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

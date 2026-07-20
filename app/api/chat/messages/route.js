import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  if (!sessionId) return Response.json({ error: 'sessionId wajib diisi' }, { status: 400 });

  const db = supabaseAdmin();
  const { data, error } = await db
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ messages: data });
}

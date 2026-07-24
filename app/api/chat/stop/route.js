import { supabaseAdmin } from '@/lib/supabaseClient';
import { sendTelegramMessage } from '@/lib/telegram';

// Dipanggil dari website ketika PEMBELI tap "Akhiri Obrolan"
export async function POST(req) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) return Response.json({ error: 'sessionId wajib diisi' }, { status: 400 });

    const db = supabaseAdmin();
    const { data: session, error } = await db.from('chat_sessions').select('*').eq('id', sessionId).single();
    if (error || !session) return Response.json({ error: 'Sesi tidak ditemukan' }, { status: 404 });

    if (session.status === 'closed') {
      return Response.json({ ok: true }); // udah ditutup, gak perlu diulang
    }

    await db.from('chat_sessions').update({ status: 'closed' }).eq('id', sessionId);
    await db.from('chat_messages').insert({
      session_id: sessionId,
      sender_type: 'system',
      message: 'Percakapan diakhiri oleh pembeli.',
    });

    if (session.assigned_admin_chat_id) {
      const shortId = sessionId.slice(0, 8);
      await sendTelegramMessage(
        session.assigned_admin_chat_id,
        `🔒 Pembeli mengakhiri percakapan sesi <code>${shortId}</code>. Sesi ini ditutup, gak perlu dibalas lagi.`
      );
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

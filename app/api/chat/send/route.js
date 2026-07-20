import { supabaseAdmin } from '@/lib/supabaseClient';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(req) {
  try {
    const body = await req.json();
    const { sessionId, productId, buyerName, message, imageUrl } = body;

    if (!message && !imageUrl) {
      return Response.json({ error: 'Pesan kosong' }, { status: 400 });
    }

    const db = supabaseAdmin();
    let session;

    if (sessionId) {
      const { data, error } = await db
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      if (error || !data) return Response.json({ error: 'Sesi tidak ditemukan' }, { status: 404 });
      session = data;
    } else {
      const { data: admins, error: adminErr } = await db
        .from('telegram_admins')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (adminErr || !admins || admins.length === 0) {
        return Response.json({ error: 'Belum ada admin aktif' }, { status: 503 });
      }

      let productName = '';
      if (productId) {
        const { data: product } = await db.from('products').select('name').eq('id', productId).single();
        productName = product?.name || '';
      }

      const { data: newSession, error: sessErr } = await db
        .from('chat_sessions')
        .insert({
          product_id: productId || null,
          buyer_name: buyerName || 'Pengunjung',
          assigned_admin_chat_id: admins[0].telegram_chat_id,
          status: 'open',
        })
        .select()
        .single();

      if (sessErr) return Response.json({ error: sessErr.message }, { status: 500 });
      session = newSession;

      await sendTelegramMessage(
        session.assigned_admin_chat_id,
        `💬 <b>Chat baru dari website</b>\nDari: ${session.buyer_name}${productName ? `\nProduk: ${productName}` : ''}\nSesi: <code>${session.id}</code>\n\nBalas pesan ini di Telegram, otomatis ke-forward ke pembeli.`
      );
    }

    const { error: msgErr } = await db.from('chat_messages').insert({
      session_id: session.id,
      sender_type: 'buyer',
      message: message || null,
      image_url: imageUrl || null,
    });
    if (msgErr) return Response.json({ error: msgErr.message }, { status: 500 });

    if (session.assigned_admin_chat_id) {
      const forwardText = imageUrl
        ? `[Sesi ${session.id.slice(0, 8)}] 📷 ${message || ''}`
        : `[Sesi ${session.id.slice(0, 8)}] ${message}`;
      await sendTelegramMessage(session.assigned_admin_chat_id, forwardText);
    }

    return Response.json({ sessionId: session.id });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
